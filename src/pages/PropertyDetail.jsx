import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Home, Plus, Settings, Edit, Trash2 } from 'lucide-react';

const PropertyDetail = ({ user }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user && id) {
            fetchPropertyData();
        }
    }, [user, id]);

    const fetchPropertyData = async () => {
        try {
            setLoading(true);

            // 1. Fetch Property
            const { data: propData, error: propError } = await supabase
                .from('properties')
                .select('*')
                .eq('id', id)
                .single();

            if (propError) throw propError;
            setProperty(propData);

            // 2. Fetch Rental Units
            const { data: unitData, error: unitError } = await supabase
                .from('rental_units')
                .select('*')
                .eq('property_id', id)
                .order('name');

            if (unitError) throw unitError;
            setUnits(unitData || []);

        } catch (err) {
            console.error('Error loading property data:', err);
            setError('Nepodařilo se načíst detail nemovitosti.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUnit = async (unitId) => {
        if (!window.confirm('Opravdu chcete smazat tuto jednotku?')) return;
        try {
            const { error } = await supabase
                .from('rental_units')
                .delete()
                .eq('id', unitId);

            if (error) throw error;
            // Refresh list
            setUnits(units.filter(u => u.id !== unitId));
        } catch (err) {
            alert('Chyba při mazání: ' + err.message);
        }
    };

    if (loading) return <div>Načítám detail...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!property) return <div className="error">Nemovitost nenalezena.</div>;

    return (
        <div className="container fade-in" style={{ paddingBottom: '2rem' }}>
            <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
                <Link to=".." relative="path" className="btn btn-secondary" style={{ display: 'inline-flex' }}>
                    <ArrowLeft size={16} /> Zpět na seznam
                </Link>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--color-primary-800)' }}>{property.name}</h1>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>
                            <Home size={18} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'text-bottom' }} />
                            {property.address?.street}, {property.address?.city} {property.address?.zip}
                        </p>
                    </div>
                    <Link to="edit" className="btn btn-primary">
                        <Edit size={16} /> Upravit nemovitost
                    </Link>
                </div>

                <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', background: 'var(--color-bg)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                    <div>
                        <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Detaily nemovitosti</h3>
                        <p><strong>Sdílená plocha:</strong> {property.shared_area_m2 ? `${property.shared_area_m2} m²` : 'Nezadáno'}</p>
                    </div>

                    {property.landlord_info && (
                        <div>
                            <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Pronajímatel</h3>
                            <p><strong>{property.landlord_info.name}</strong></p>
                            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                                {property.landlord_info.contact?.email}<br />
                                {property.landlord_info.contact?.phone}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="units-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Nájemní jednotky</h2>
                    <Link to="units/new" className="btn btn-primary">
                        <Plus size={16} /> Přidat jednotku
                    </Link>
                </div>

                {units.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
                        <div style={{ marginBottom: '1rem', opacity: 0.5 }}><Home size={48} /></div>
                        <h3>Zatím zde nejsou žádné jednotky</h3>
                        <p>Přidejte pokoje nebo byty, které chcete pronajímat.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {units.map(unit => (
                            <div key={unit.id} className="card room-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <h3 className="room-card-title">{unit.name}</h3>
                                    <div className="btn-group" style={{ gap: '0.5rem' }}>
                                        <Link to={`units/${unit.id}`} className="btn btn-secondary" style={{ padding: '0.4rem', border: 'none', background: 'transparent' }} title="Upravit">
                                            <Edit size={18} style={{ color: 'var(--color-primary-600)' }} />
                                        </Link>
                                        <button onClick={() => handleDeleteUnit(unit.id)} className="btn btn-secondary" style={{ padding: '0.4rem', border: 'none', background: 'transparent' }} title="Smazat">
                                            <Trash2 size={18} style={{ color: 'var(--color-error)' }} />
                                        </button>
                                    </div>
                                </div>

                                <div className="room-card-details">
                                    <div className="room-card-detail">
                                        <span className="room-card-detail-label">Nájem</span>
                                        <span className="room-card-detail-value">{unit.monthly_rent} Kč</span>
                                    </div>
                                    <div className="room-card-detail">
                                        <span className="room-card-detail-label">Poplatky/os</span>
                                        <span className="room-card-detail-value">{unit.fee_per_person} Kč</span>
                                    </div>
                                    <div className="room-card-detail">
                                        <span className="room-card-detail-label">Max osob</span>
                                        <span className="room-card-detail-value">{unit.max_occupants}</span>
                                    </div>
                                    <div className="room-card-detail">
                                        <span className="room-card-detail-label">Plocha</span>
                                        <span className="room-card-detail-value">{unit.area_m2 ? `${unit.area_m2} m²` : '-'}</span>
                                    </div>
                                </div>
                                {unit.features && unit.features.length > 0 && (
                                    <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                                        {unit.features.slice(0, 3).join(', ')}{unit.features.length > 3 ? '...' : ''}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PropertyDetail;
