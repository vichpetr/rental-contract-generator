import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { Building, Plus, ArrowRight } from 'lucide-react';

const PropertiesList = ({ user }) => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user) {
            fetchProperties();
        }
    }, [user]);

    const fetchProperties = async () => {
        try {
            setLoading(true);
            // Fetch properties where user is owner OR has a role
            // We can use the view or function, but direct select works as RLS handles filtering
            const { data, error } = await supabase
                .from('properties')
                .select('*')
                .order('name');

            if (error) throw error;
            setProperties(data || []);
        } catch (err) {
            console.error('Error fetching properties:', err);
            setError('Nepodařilo se načíst nemovitosti.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Načítám nemovitosti...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="properties-list">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Moje nemovitosti</h2>
                <Link to="new" className="button primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={16} /> Přidat nemovitost
                </Link>
            </div>

            {properties.length === 0 ? (
                <div className="empty-state" style={{ textAlign: 'center', padding: '40px', background: '#f5f5f5', borderRadius: '8px' }}>
                    <Building size={48} style={{ opacity: 0.3, marginBottom: '10px' }} />
                    <h3>Zatím nemáte žádné nemovitosti</h3>
                    <p>Přidejte svou první nemovitost pro správu nájemních jednotek a smluv.</p>
                </div>
            ) : (
                <div className="grid">
                    {properties.map(property => (
                        <div key={property.id} className="card" style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div>
                                    <h3 style={{ marginTop: 0 }}>{property.name}</h3>
                                    <p style={{ color: '#666', fontSize: '0.9rem' }}>
                                        {property.address?.street}, {property.address?.city}
                                    </p>
                                </div>
                                <Link to={`${property.id}`} className="button secondary" style={{ padding: '5px 10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    Detail <ArrowRight size={14} />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PropertiesList;
