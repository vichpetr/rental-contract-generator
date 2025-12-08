import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Save, Building } from 'lucide-react';

const PropertyEdit = ({ user }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const isNew = !id || id === 'new';

    const [formData, setFormData] = useState({
        name: '',
        street: '',
        city: '',
        zip: '',
        shared_area_m2: '',
        // Landlord Info
        landlord_name: '',
        landlord_birth_number: '',
        landlord_street: '',
        landlord_city: '',
        landlord_zip: '',
        landlord_email: '',
        landlord_phone: '',
        landlord_account_number: '',
        landlord_bank_code: ''
    });

    useEffect(() => {
        if (user && !isNew) {
            fetchProperty();
        }
    }, [user, id]);

    const fetchProperty = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('properties')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            const landlord = data.landlord_info || {};
            const landlordAddress = landlord.address || {};
            const landlordContact = landlord.contact || {};
            const landlordBank = landlord.bankAccount || {};

            setFormData({
                name: data.name || '',
                street: data.address?.street || '',
                city: data.address?.city || '',
                zip: data.address?.zip || '',
                shared_area_m2: data.shared_area_m2 || '',

                landlord_name: landlord.name || '',
                landlord_birth_number: landlord.birthNumber || '',
                landlord_street: landlordAddress.street || '',
                landlord_city: landlordAddress.city || '',
                landlord_zip: landlordAddress.postalCode || '',
                landlord_email: landlordContact.email || '',
                landlord_phone: landlordContact.phone || '',
                landlord_account_number: landlordBank.accountNumber || '',
                landlord_bank_code: landlordBank.bankCode || ''
            });
        } catch (err) {
            console.error('Error fetching property:', err);
            setError('Nepodařilo se načíst data nemovitosti.');
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
            const payload = {
                name: formData.name,
                address: {
                    street: formData.street,
                    city: formData.city,
                    zip: formData.zip
                },
                shared_area_m2: parseFloat(formData.shared_area_m2) || 0,
                landlord_info: {
                    name: formData.landlord_name,
                    birthNumber: formData.landlord_birth_number,
                    address: {
                        street: formData.landlord_street,
                        city: formData.landlord_city,
                        postalCode: formData.landlord_zip
                    },
                    contact: {
                        email: formData.landlord_email,
                        phone: formData.landlord_phone
                    },
                    bankAccount: {
                        accountNumber: formData.landlord_account_number,
                        bankCode: formData.landlord_bank_code
                    }
                },
                owner_id: user?.id
            };

            if (!isNew) {
                delete payload.owner_id;
            }

            let resultError;

            if (isNew) {
                const { error } = await supabase.from('properties').insert([payload]);
                resultError = error;
            } else {
                const { error } = await supabase.from('properties').update(payload).eq('id', id);
                resultError = error;
            }

            if (resultError) throw resultError;

            navigate('/properties');

        } catch (err) {
            console.error('Error saving property:', err);
            if (err.code === '42501') {
                setError('Nemáte oprávnění upravovat tuto nemovitost.');
            } else if (err.code === '23503' || (err.message && err.message.includes('foreign key constraint'))) {
                // Check if it's the dev user
                if (user?.id === '00000000-0000-0000-0000-000000000000') {
                    setError('V režimu vývoje (Standalone) nelze ukládat data s fiktivním uživatelem. Prosím spusťte aplikaci přes Portál.');
                } else {
                    setError('Chyba integrity dat: ' + err.message);
                }
            } else {
                setError('Chyba při ukládání: ' + err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading && !isNew && !formData.name) return <div>Načítám...</div>;

    return (
        <div className="container fade-in" style={{ paddingBottom: '2rem' }}>
            <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
                <Link to={isNew ? "/properties" : `/properties/${id}`} className="btn btn-secondary" style={{ display: 'inline-flex' }}>
                    <ArrowLeft size={16} /> {isNew ? 'Zpět na seznam' : 'Zpět na detail'}
                </Link>
            </div>

            <div className="card">
                <h1 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>{isNew ? 'Nová nemovitost' : 'Upravit nemovitost'}</h1>

                {error && <div className="error-banner" style={{ background: 'var(--color-error-light)', color: 'var(--color-error)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>

                    {/* Property Details */}
                    <h2 style={{ fontSize: '1.2rem', margin: '1rem 0 1rem 0', color: 'var(--color-primary-700)' }}>Základní informace</h2>
                    <div className="form-grid form-grid-2">
                        <div className="form-group">
                            <label className="form-label required">Název nemovitosti</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="form-input"
                                placeholder="např. Byt Praha 2"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Sdílená plocha (m²)</label>
                            <input
                                type="number"
                                name="shared_area_m2"
                                value={formData.shared_area_m2}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="0"
                                step="0.1"
                            />
                            <small className="form-hint">Pro výpočet podílů nákladů na sdílené prostory.</small>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Adresa nemovitosti</label>
                        <div className="form-grid form-grid-3">
                            <div className="form-group">
                                <label className="form-label" style={{ fontSize: '0.85rem' }}>Ulice a číslo</label>
                                <input
                                    type="text"
                                    name="street"
                                    value={formData.street}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                    placeholder="Vodičkova 123"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label" style={{ fontSize: '0.85rem' }}>Město</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                    placeholder="Praha"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label" style={{ fontSize: '0.85rem' }}>PSČ</label>
                                <input
                                    type="text"
                                    name="zip"
                                    value={formData.zip}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                    placeholder="110 00"
                                />
                            </div>
                        </div>
                    </div>

                    <hr style={{ margin: '2rem 0', borderTop: '1px solid var(--color-border)' }} />

                    {/* Landlord Details */}
                    <h2 style={{ fontSize: '1.2rem', margin: '1rem 0 1rem 0', color: 'var(--color-primary-700)' }}>Údaje o pronajímateli</h2>
                    <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Tyto údaje se budou automaticky doplňovat do nájemních smluv.</p>

                    <div className="form-grid form-grid-2">
                        <div className="form-group">
                            <label className="form-label">Jméno a Příjmení / Firma</label>
                            <input
                                type="text"
                                name="landlord_name"
                                value={formData.landlord_name}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Jan Novák"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">IČO / Datum narození</label>
                            <input
                                type="text"
                                name="landlord_birth_number"
                                value={formData.landlord_birth_number}
                                onChange={handleChange}
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Adresa pronajímatele</label>
                        <div className="form-grid form-grid-3">
                            <div className="form-group">
                                <input
                                    type="text"
                                    name="landlord_street"
                                    value={formData.landlord_street}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Ulice"
                                />
                            </div>
                            <div className="form-group">
                                <input
                                    type="text"
                                    name="landlord_city"
                                    value={formData.landlord_city}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Město"
                                />
                            </div>
                            <div className="form-group">
                                <input
                                    type="text"
                                    name="landlord_zip"
                                    value={formData.landlord_zip}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="PSČ"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-grid form-grid-2">
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                name="landlord_email"
                                value={formData.landlord_email}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="jan.novak@example.com"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Telefon</label>
                            <input
                                type="text"
                                name="landlord_phone"
                                value={formData.landlord_phone}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="+420 777 123 456"
                            />
                        </div>
                    </div>

                    <div className="form-grid form-grid-2">
                        <div className="form-group">
                            <label className="form-label">Číslo účtu</label>
                            <input
                                type="text"
                                name="landlord_account_number"
                                value={formData.landlord_account_number}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="123456789/0800"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Kód banky (nepovinné)</label>
                            <input
                                type="text"
                                name="landlord_bank_code"
                                value={formData.landlord_bank_code}
                                onChange={handleChange}
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            <Save size={18} /> {loading ? 'Ukládám...' : 'Uložit změny'}
                        </button>
                        <Link to={isNew ? "/properties" : `/properties/${id}`} className="btn btn-secondary">
                            Zrušit
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PropertyEdit;
