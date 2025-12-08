import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Save } from 'lucide-react';

const UnitEdit = ({ user }) => {
    const { propertyId, unitId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        monthly_rent: 0,
        fee_per_person: 0,
        max_occupants: 1,
        area_m2: 0,
        features: '', // Joined by comma for UI
        property_id: propertyId
    });

    const isNew = !unitId || unitId === 'new';

    useEffect(() => {
        if (user && !isNew) {
            fetchUnit();
        }
    }, [user, unitId]);

    const fetchUnit = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('rental_units')
                .select('*')
                .eq('id', unitId)
                .single();

            if (error) throw error;

            setFormData({
                ...data,
                features: data.features ? data.features.join(', ') : ''
            });
        } catch (err) {
            console.error('Error fetching unit:', err);
            setError('Nepodařilo se načíst jednotku.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Prepare data
            const featuresArray = formData.features.split(',').map(s => s.trim()).filter(Boolean);
            const payload = {
                property_id: propertyId,
                name: formData.name,
                description: formData.description,
                monthly_rent: parseInt(formData.monthly_rent),
                fee_per_person: parseInt(formData.fee_per_person),
                max_occupants: parseInt(formData.max_occupants),
                area_m2: parseFloat(formData.area_m2) || 0,
                features: featuresArray
            };

            let resultError;

            if (isNew) {
                const { error } = await supabase.from('rental_units').insert([payload]);
                resultError = error;
            } else {
                const { error } = await supabase.from('rental_units').update(payload).eq('id', unitId);
                resultError = error;
            }

            if (resultError) throw resultError;

            // Redirect back to property detail
            navigate('../..', { relative: 'path' });

        } catch (err) {
            console.error('Error saving unit:', err);
            // Determine if it's RLS error (often 401 or 403 equivalents in Supabase/Postgres)
            // Supabase JS often returns objects like { message: "...", code: "..." }
            if (err.code === '42501') {
                setError('Nemáte oprávnění upravovat tuto jednotku. (RLS Permission Denied)');
            } else {
                setError('Chyba při ukládání: ' + (err.message || String(err)));
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading && !isNew && !formData.name) return <div>Načítám...</div>;

    return (

        <div className="container fade-in" style={{ paddingBottom: '2rem' }}>
            <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
                <Link to="../.." relative="path" className="btn btn-secondary" style={{ display: 'inline-flex' }}>
                    <ArrowLeft size={16} /> Zpět na detail nemovitosti
                </Link>
            </div>

            <div className="card">
                <h1 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>{isNew ? 'Nová jednotka' : 'Upravit jednotku'}</h1>

                {error && <div className="error-banner" style={{ background: 'var(--color-error-light)', color: 'var(--color-error)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label required">Název jednotky (např. "Malý pokoj")</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="form-input" />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Popis</label>
                        <textarea name="description" value={formData.description || ''} onChange={handleChange} className="form-input" rows={3} />
                    </div>

                    <div className="form-grid form-grid-2">
                        <div className="form-group">
                            <label className="form-label required">Měsíční nájem (Kč)</label>
                            <input type="number" name="monthly_rent" value={formData.monthly_rent} onChange={handleChange} required className="form-input" />
                        </div>
                        <div className="form-group">
                            <label className="form-label required">Poplatky na osobu (Kč)</label>
                            <input type="number" name="fee_per_person" value={formData.fee_per_person} onChange={handleChange} required className="form-input" />
                        </div>
                    </div>

                    <div className="form-grid form-grid-2">
                        <div className="form-group">
                            <label className="form-label required">Max. počet osob</label>
                            <input type="number" name="max_occupants" value={formData.max_occupants} onChange={handleChange} required className="form-input" min="1" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Plocha (m²)</label>
                            <input type="number" name="area_m2" value={formData.area_m2} onChange={handleChange} className="form-input" step="0.1" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Vybavení (oddělené čárkou)</label>
                        <input type="text" name="features" value={formData.features} onChange={handleChange} placeholder="postel, stůl, skříň" className="form-input" />
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            <Save size={18} /> {loading ? 'Ukládám...' : 'Uložit jednotku'}
                        </button>
                        <Link to="../.." relative="path" className="btn btn-secondary">
                            Zrušit
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UnitEdit;
