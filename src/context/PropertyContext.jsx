import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const PropertyContext = createContext();

export const PropertyProvider = ({ children }) => {
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            setLoading(true);

            // Get current user or dev user
            const session = await supabase.auth.getSession();
            const user = session?.data?.session?.user;
            const devUserId = import.meta.env.VITE_DEV_USER_ID;
            const targetUserId = user?.id || devUserId;

            if (!targetUserId) {
                console.warn('No user/dev ID found for properties');
                setProperties([]);
                setLoading(false);
                return;
            }

            // Try RPC first for dev/RLS bypass
            const { data, error } = await supabase
                .rpc('get_owner_properties', { target_user_id: targetUserId });

            if (error) {
                console.warn('RPC failed, trying standard select', error);

                // Fallback to standard select if RPC fails
                // Note: This relies on RLS allowing access to auth.uid()
                const { data: stdData, error: stdError } = await supabase
                    .from('properties')
                    .select('*')
                    .order('name');

                if (stdError) throw stdError;
                setProperties(stdData || []);
            } else {
                setProperties(data || []);
            }

            // Auto-select if only one property or restore from localStorage?
            // For now, simple logic: leave null to force dashboard choice or sidebar choice
        } catch (error) {
            console.error('Error loading properties:', error);
        } finally {
            setLoading(false);
        }
    };

    const selectProperty = (property) => {
        setSelectedProperty(property);
        // Persist to localStorage if needed
        if (property) {
            localStorage.setItem('selectedPropertyId', property.id);
        } else {
            localStorage.removeItem('selectedPropertyId');
        }
    };

    // Restore selection on load
    useEffect(() => {
        if (!loading && properties.length > 0) {
            const savedId = localStorage.getItem('selectedPropertyId');
            if (savedId) {
                const found = properties.find(p => p.id.toString() === savedId);
                if (found) setSelectedProperty(found);
            }
        }
    }, [loading, properties]);

    return (
        <PropertyContext.Provider value={{ selectedProperty, selectProperty, properties, loading }}>
            {children}
        </PropertyContext.Provider>
    );
};

export const useProperty = () => {
    const context = useContext(PropertyContext);
    if (!context) {
        throw new Error('useProperty must be used within a PropertyProvider');
    }
    return context;
};
