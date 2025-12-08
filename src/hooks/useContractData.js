import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { contractConfig as fallbackConfig } from '../config/contractConfig'; // Fallback for dev/offline


export function useContractData() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [config, setConfig] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);

                // 1. Fetch Property (assume we want the first one the user has access to, or hardcoded for now)
                // Ideally we would pass a propertyId or slug. For this generator, we grab the first one found.
                const { data: properties, error: propError } = await supabase
                    .from('properties')
                    .select('*')
                    .limit(1);

                if (propError) throw propError;

                let property = properties?.[0];

                // If no property found in DB, use fallback (during dev or if empty)
                if (!property) {
                    console.warn('No property found in database, using fallback config');
                    setConfig(fallbackConfig);
                    setLoading(false);
                    return;
                }

                // 2. Fetch Rental Units for this property
                const { data: units, error: unitsError } = await supabase
                    .from('rental_units')
                    .select('*')
                    .eq('property_id', property.id)
                    .order('monthly_rent', { ascending: true }); // Sort by rent or id

                if (unitsError) throw unitsError;

                // 3. Construct Config Object matching the structure expected by the app
                // Note: snake_case from DB needs to be mapped to camelCase if strictly needed, 
                // or we adapt the app to use DB structure. 
                // Adapting the app is better for long term, but mapping here is faster for migration.
                // Let's map to existing structure to minimize app refactoring for now.

                const newConfig = {
                    landlord: property.landlord_info,
                    property: property.address,
                    roomVariants: units.map(u => ({
                        id: u.id, // Using DB ID (int) instead of string 'small'/'large' - might need check in app
                        name: u.name,
                        maxOccupants: u.max_occupants,
                        monthlyRent: u.monthly_rent,
                        feePerPerson: u.fee_per_person,
                        description: u.description,
                        area: u.area_m2,
                        features: u.features
                    })),
                    meterReadings: units[0]?.meter_readings || {}, // Fallback to first unit's meter readings or property default? Config has it global.
                    // Note: DB has meter readings PER UNIT. Config had it GLOBAL.
                    // We should probably pick the specific unit's readings when generating content, 
                    // but the app structure expects global `contractConfig.meterReadings`.
                    // For MVP, we can pick the first one, or we might need to change the app logic 
                    // to pull readings from the selected variant.

                    securityDeposit: property.settings.securityDeposit,
                    rentDueDay: property.settings.rentDueDay,
                    noticePeriodMonths: property.settings.noticePeriodMonths,
                    servicesBreakdown: property.settings.servicesBreakdown,
                    defaultContractDuration: property.settings.defaultContractDuration,

                    // Templates - passed through from fallback or could be stored in DB later
                    contractTemplate: fallbackConfig.contractTemplate,
                    subtenantSection: fallbackConfig.subtenantSection,
                    subtenantSignature: fallbackConfig.subtenantSignature,
                    handoverProtocolTemplate: fallbackConfig.handoverProtocolTemplate,
                    subtenantProtocolSection: fallbackConfig.subtenantProtocolSection
                };

                setConfig(newConfig);

            } catch (err) {
                console.error('Error fetching contract data:', err);
                setError(err);
                // On error, we could fall back or show error
                setConfig(fallbackConfig);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    return { loading, error, config };
}
