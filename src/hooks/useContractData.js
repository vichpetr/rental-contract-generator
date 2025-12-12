import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { contractConfig as fallbackConfig } from '../config/contractConfig';

export function useContractData() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [properties, setProperties] = useState([]);
    const [config, setConfig] = useState(null);

    // 1. Fetch available properties on mount
    useEffect(() => {
        async function fetchProperties() {
            try {
                setLoading(true);

                // Get the current user ID to fetch for (from Auth Context OR Dev Env)
                // Note: In a real app we'd get this from useAuth(), but here we might not be passed the user yet.
                // We'll trust the RPC to handle the ID we pass it.

                // HACK: Need to access the "dev user id" here if not authenticated.
                // Ideally this hook receives `user` user object.
                // For now, let's grab it from env if pure dev mode context.
                const devUserId = import.meta.env.VITE_DEV_USER_ID;

                // First try getting session user
                const { data: { session } } = await supabase.auth.getSession();
                const userId = session?.user?.id || devUserId;

                if (!userId) {
                    // No user at all ?
                    setProperties([]);
                    setLoading(false);
                    return;
                }

                // USE RPC to bypass RLS if we are just "simulating" the user from .env
                // Standard select() would fail RLS if session is missing.
                const { data, error } = await supabase
                    .rpc('get_owner_properties', { target_user_id: userId });

                if (error) {
                    // Fallback to standard select if RPC missing (e.g. before migration applied)
                    console.warn('RPC get_owner_properties failed, trying standard select', error);
                    const { data: fallbackData, error: fallbackError } = await supabase
                        .from('properties')
                        .select('id, name, address')
                        .order('name');

                    if (fallbackError) throw fallbackError;
                    setProperties(fallbackData || []);
                } else {
                    setProperties(data || []);
                }

            } catch (err) {
                console.error('Error fetching properties:', err);
                setError(err);
            } finally {
                setLoading(false);
            }
        }
        fetchProperties();
    }, []);

    // 2. Function to load data for a specific property
    const loadPropertyConfig = useCallback(async (propertyId) => {
        try {
            setLoading(true);
            setError(null);

            // Fetch full property details (settings, landlord info)
            const { data: property, error: propError } = await supabase
                .from('properties')
                .select('*')
                .eq('id', propertyId)
                .single();

            if (propError) throw propError;
            if (!property) throw new Error('Property not found');

            // Fetch Rental Units
            const { data: stdUnits, error: stdUnitsError } = await supabase
                .from('rental_units')
                .select('*')
                .eq('property_id', propertyId)
                .order('monthly_rent', { ascending: true });

            let finalUnits = stdUnits || [];

            if (stdUnitsError || finalUnits.length === 0) {
                // Try RPC Fallback
                const { data: rpcUnits, error: rpcError } = await supabase
                    .rpc('get_property_units', { target_property_id: propertyId });

                if (!rpcError && rpcUnits) {
                    finalUnits = rpcUnits;
                    // Ensure sort order (cheapest first)
                    finalUnits.sort((a, b) => a.monthly_rent - b.monthly_rent);
                }
            } else if (stdUnitsError) {
                throw stdUnitsError;
            }

            const units = finalUnits;

            // Construct Config Object
            const newConfig = {
                landlord: property.landlord_info,
                property: property.address,
                roomVariants: units.map(u => ({
                    id: u.id,
                    name: u.name,
                    maxOccupants: u.max_occupants,
                    monthlyRent: u.monthly_rent,
                    feePerPerson: u.fee_per_person,
                    description: u.description,
                    area: u.area_m2,
                    features: u.features
                })),
                meterReadings: units[0]?.meter_readings || {},
                securityDeposit: property.settings.securityDeposit,
                rentDueDay: property.settings.rentDueDay,
                noticePeriodMonths: property.settings.noticePeriodMonths,
                servicesBreakdown: property.settings.servicesBreakdown,
                defaultContractDuration: property.settings.defaultContractDuration,

                // Templates (static for now)
                contractTemplate: fallbackConfig.contractTemplate,
                subtenantSection: fallbackConfig.subtenantSection,
                subtenantSignature: fallbackConfig.subtenantSignature,
                handoverProtocolTemplate: fallbackConfig.handoverProtocolTemplate,
                subtenantProtocolSection: fallbackConfig.subtenantProtocolSection
            };

            setConfig(newConfig);
            return newConfig;
        } catch (err) {
            console.error('Error loading property data:', err);
            setError(err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return { loading, error, properties, config, loadPropertyConfig };
}
