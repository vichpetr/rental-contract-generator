import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Home, Plus, Settings, Edit, Trash2, Users, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const PropertyDetail = ({ user }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [units, setUnits] = useState([]);
    const [occupancy, setOccupancy] = useState([]);
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

            // 3. Fetch Occupancy (View)
            // Note: This view might not exist yet if migration wasn't run. Handle gracefully.
            try {
                const { data: occData, error: occError } = await supabase
                    .from('view_unit_occupancy')
                    .select('*')
                    .eq('property_id', id);

                if (!occError) {
                    setOccupancy(occData || []);
                }
            } catch (ignore) {
                console.warn("Could not fetch occupancy view. Migration might be missing.");
            }

        } catch (err) {
            console.error('Error loading property data:', err);
            // PGRST116 is the code for "0 rows" when using .single()
            if (err.code === 'PGRST116' || err.status === 406) {
                setError('Nemovitost nebyla nalezena.');
            } else {
                setError('Nepodařilo se načíst detail nemovitosti.');
            }
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

    const getUnitOccupants = (unitId) => {
        return occupancy.filter(o => o.unit_id === unitId);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '?';
        return format(new Date(dateStr), 'd.M.yyyy');
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
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                        {units.map(unit => {
                            const unitOccupants = getUnitOccupants(unit.id);
                            return (
                                <div key={unit.id} className="card room-card" style={{ display: 'flex', flexDirection: 'column' }}>
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

                                    {/* Occupants List */}
                                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                                        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            <Users size={14} /> Obyvatelé
                                        </h4>

                                        {unitOccupants.length > 0 ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                {unitOccupants.map((occ, idx) => (
                                                    <div key={idx} style={{ fontSize: '0.9rem', background: 'var(--color-bg)', padding: '0.5rem', borderRadius: '4px' }}>
                                                        <div style={{ fontWeight: 'bold' }}>{occ.first_name} {occ.last_name}</div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                            <Calendar size={12} />
                                                            {formatDate(occ.date_from)} - {occ.date_to ? formatDate(occ.date_to) : 'neurčito'}
                                                            {!occ.is_currently_active && <span style={{ marginLeft: '5px', color: 'orange' }}>(neaktivní)</span>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                                                Nikdo zde nebydlí.
                                            </div>
                                        )}
                                    </div>

                                    {unit.features && unit.features.length > 0 && (
                                        <div style={{ marginTop: 'auto', paddingTop: '1rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                                            <small>{unit.features.slice(0, 3).join(', ')}{unit.features.length > 3 ? '...' : ''}</small>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PropertyDetail;
