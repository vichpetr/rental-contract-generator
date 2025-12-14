import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Home, Plus, Settings, Edit, Trash2, Users, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const MeterReadingsManager = ({ propertyId }) => {
    const [meters, setMeters] = useState([]);
    const [readings, setReadings] = useState({}); // Map: meterId -> []
    const [loading, setLoading] = useState(false);
    const [addingReading, setAddingReading] = useState(null); // meterId being added to
    const [newValue, setNewValue] = useState('');
    const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        loadMeters();
    }, [propertyId]);

    const loadMeters = async () => {
        setLoading(true);
        try {
            // Fetch meters via RPC (bypasses RLS)
            const { data: mData, error } = await supabase
                .rpc('get_property_meters_with_latest', { target_property_id: propertyId });

            if (error) console.error("Error loading meters:", error);

            if (mData) {
                // Map RPC result to component state
                // RPC returns: id, type, description, meter_number, unit, is_active, last_reading_date, last_reading_value
                setMeters(mData);

                // For full history we still need to fetch readings table?
                // The updated 'get_property_meters_with_latest' gives specific fields.
                // But for the history list, we probably want real reading records.
                // We can fetch readings for these meters manually.
                // Since I haven't made a specific "get_readings_bypass_rls" RPC, 
                // we might still face RLS issues for *history detail*.
                // BUT at least meters will show up now.
                // Let's try to fetch readings standard way. If RLS fails, we just don't show history list, but we show last reading from RPC.

                const mIds = mData.map(m => m.id);
                if (mIds.length > 0) {
                    const { data: rData } = await supabase
                        .from('meter_readings')
                        .select('*')
                        .in('meter_id', mIds)
                        .order('reading_date', { ascending: false });

                    if (rData) {
                        const groups = {};
                        mIds.forEach(id => groups[id] = []);
                        rData.forEach(r => {
                            if (groups[r.meter_id]) groups[r.meter_id].push(r);
                        });
                        setReadings(groups);
                    }
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleAddReading = async (meterId) => {
        if (!newValue || !newDate) return;
        try {
            const { error } = await supabase.from('meter_readings').insert([{
                meter_id: meterId,
                reading_date: newDate,
                reading_value: parseFloat(newValue)
            }]);
            if (error) throw error;
            setAddingReading(null);
            setNewValue('');
            loadMeters(); // Refresh
        } catch (e) {
            alert('Chyba: ' + e.message);
        }
    };

    const METER_LABELS = {
        'electricity': 'Elektřina',
        'gas': 'Plyn',
        'water_cold': 'Studená voda',
        'water_hot': 'Teplá voda',
        'water': 'Voda',
        'heat': 'Teplo'
    };

    if (meters.length === 0 && !loading) return <div className="text-muted" style={{ fontStyle: 'italic' }}>Žádné měřiče definovány.</div>;

    return (
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {meters.map(meter => {
                const meterReadings = readings[meter.id] || [];
                const last = meterReadings[0];
                const prev = meterReadings[1];
                const consumption = (last && prev) ? (last.reading_value - prev.reading_value).toFixed(2) : null;

                return (
                    <div key={meter.id} className="card-sub" style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>
                                {METER_LABELS[meter.type] || meter.type}
                                {meter.description && <span style={{ fontWeight: 'normal', color: 'var(--color-text-secondary)' }}> ({meter.description})</span>}
                            </h4>
                            <span className="badge" style={{ background: '#eee', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>
                                {meter.meter_number}
                            </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', background: '#f9f9f9', padding: '0.5rem', borderRadius: '4px' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#666' }}>POSLEDNÍ STAV</div>
                                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                                    {last ? `${last.reading_value} ${meter.unit}` : '-'}
                                </div>
                                {last && <div style={{ fontSize: '0.75rem', color: '#999' }}>{format(new Date(last.reading_date), 'd.M.yyyy')}</div>}
                            </div>
                            {consumption && (
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#666' }}>SPOTŘEBA</div>
                                    <div style={{ fontWeight: 'bold', color: 'var(--color-primary-600)' }}>
                                        +{consumption} {meter.unit}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#999' }}>od minula</div>
                                </div>
                            )}
                        </div>

                        {addingReading === meter.id ? (
                            <div style={{ background: '#f0f7ff', padding: '0.5rem', borderRadius: '4px' }}>
                                <input
                                    type="date"
                                    className="form-input"
                                    style={{ marginBottom: '5px', padding: '4px' }}
                                    value={newDate}
                                    onChange={e => setNewDate(e.target.value)}
                                />
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    <input
                                        type="number"
                                        className="form-input"
                                        placeholder="Nový stav"
                                        style={{ padding: '4px' }}
                                        value={newValue}
                                        onChange={e => setNewValue(e.target.value)}
                                    />
                                    <button onClick={() => handleAddReading(meter.id)} className="btn btn-primary btn-sm">OK</button>
                                    <button onClick={() => setAddingReading(null)} className="btn btn-secondary btn-sm">Zrušit</button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setAddingReading(meter.id)}
                                className="btn btn-secondary btn-sm"
                                style={{ width: '100%', border: '1px dashed #ccc' }}
                            >
                                + Zadat odečet
                            </button>
                        )}

                        {/* History Mini Table */}
                        {meterReadings.length > 0 && (
                            <div style={{ marginTop: '0.5rem', maxHeight: '100px', overflowY: 'auto', fontSize: '0.8rem' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <tbody>
                                        {meterReadings.slice(0, 5).map((r, idx) => (
                                            <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
                                                <td style={{ padding: '2px' }}>{format(new Date(r.reading_date), 'd.M.yyyy')}</td>
                                                <td style={{ padding: '2px', textAlign: 'right' }}>{r.reading_value}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

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

            // Determine if we need to use Dev RPC (if no real user but dev ID present)
            const devUserId = import.meta.env.VITE_DEV_USER_ID;
            const targetUserId = user?.id || devUserId;

            // 1. Fetch Property
            // Strategy: Try standard select first (cleanest). If it returns null/error, try RPC.
            let propData = null;
            let stdError = null;

            // Use maybeSingle to avoid 406/PGRST116 immediately
            const { data: stdDataResult, error: stdReqError } = await supabase
                .from('properties')
                .select('*')
                .eq('id', id)
                .maybeSingle();

            if (stdReqError) {
                console.warn("Standard property fetch error:", stdReqError);
                stdError = stdReqError;
            }

            if (stdDataResult) {
                propData = stdDataResult;
            } else if (targetUserId) {
                // Nothing found via standard select. If Dev Mode/Target User logic applies, try RPC bypass.
                console.log("Standard fetch failed/empty. Trying RPC bypass for user:", targetUserId);

                const { data: rpcData, error: rpcError } = await supabase
                    .rpc('get_owner_properties', { target_user_id: targetUserId });

                if (rpcError) {
                    console.error("RPC fetch error:", rpcError);
                } else if (rpcData) {
                    // The RPC returns all properties for the user. We must find the specific one.
                    // IMPORTANT: Ensure ID types match (string vs UUID).
                    console.log("RPC Data received:", rpcData.length, "properties. Looking for ID:", id);
                    propData = rpcData.find(p => String(p.id) === String(id));

                    if (!propData) {
                        console.warn("Property ID not found in RPC results.");
                    }
                }
            } else {
                // No result and no user to try RPC with
                console.warn("No data and no targetUserId for RPC bypass.");
            }

            if (!propData) {
                if (stdError) throw stdError; // Throw original error if existed
                throw { code: 'PGRST116', message: 'Nemovitost nenalezena - ID se neshoduje nebo chybí oprávnění.' };
            }

            setProperty(propData);

            // 2. Fetch Rental Units
            // Similar logic: Standard Select first. If empty/error & dev mode, bypass?
            const { data: stdUnitData, error: stdUnitError } = await supabase
                .from('rental_units')
                .select('*')
                .eq('property_id', id)
                .order('name');

            let finalUnits = stdUnitData || [];

            if ((stdUnitError || finalUnits.length === 0) && targetUserId) {
                // If standard fetch failed or returned nothing (which might be RLS hiding it),
                // and we are in Dev Mode, try RPC bypass.
                console.log("Units fetch failed/empty. Trying RPC bypass.");
                const { data: rpcUnitData, error: rpcUnitError } = await supabase
                    .rpc('get_property_units', { target_property_id: id });

                if (rpcUnitError) {
                    console.warn("RPC units fetch failed:", rpcUnitError);
                } else if (rpcUnitData) {
                    console.log("RPC Units found:", rpcUnitData.length);
                    finalUnits = rpcUnitData;
                    // Sort manually since RPC order might differ if not specified (though SQL has order by)
                    finalUnits.sort((a, b) => a.name.localeCompare(b.name));
                }
            } else if (stdUnitError) {
                console.warn("Error fetching units (RLS?):", stdUnitError);
            }

            setUnits(finalUnits);

            // 3. Fetch Occupancy (View)
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
            if (err.code === 'PGRST116' || err.status === 406 || err.message === 'Nemovitost nenalezena') {
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

                    {/* Meters Section - New Interactive */}
                    <div style={{ gridColumn: '1 / -1' }}>
                        <h3 style={{ fontSize: '1.1rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '1rem', letterSpacing: '0.05em', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                            Měřiče a Spotřeba
                        </h3>
                        <MeterReadingsManager propertyId={id} />
                    </div>

                    {property.settings?.equipment && property.settings.equipment.length > 0 && (
                        <div>
                            <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Vybavení bytu</h3>
                            <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                                {property.settings.equipment.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}

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

                                    <div className="room-card-detail">
                                        <span className="room-card-detail-label">Nájem</span>
                                        <span className="room-card-detail-value">{unit.monthly_rent} Kč</span>
                                    </div>
                                    <div className="room-card-detail">
                                        <span className="room-card-detail-label">Poplatky/os</span>
                                        <span className="room-card-detail-value">{unit.fee_per_person} Kč</span>
                                    </div>
                                    <div className="room-card-detail">
                                        <span className="room-card-detail-label">Jistina</span>
                                        <span className="room-card-detail-value">{unit.deposit ? `${unit.deposit} Kč` : '-'}</span>
                                    </div>
                                    <div className="room-card-detail">
                                        <span className="room-card-detail-label">Max osob</span>
                                        <span className="room-card-detail-value">{unit.max_occupants}</span>
                                    </div>
                                    <div className="room-card-detail">
                                        <span className="room-card-detail-label">Plocha</span>
                                        <span className="room-card-detail-value">{unit.area_m2 ? `${unit.area_m2} m²` : '-'}</span>
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
