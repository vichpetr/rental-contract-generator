import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Save, Building } from 'lucide-react';

// Helper for array inputs
const ArrayInput = ({ label, items = [], onChange, placeholder }) => {
    const handleAdd = () => {
        onChange([...items, '']);
    };

    const handleRemove = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        onChange(newItems);
    };

    const handleChange = (index, value) => {
        const newItems = [...items];
        newItems[index] = value;
        onChange(newItems);
    };

    return (
        <div className="form-group">
            <label className="form-label">{label}</label>
            {items.map((item, index) => (
                <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                        type="text"
                        value={item}
                        onChange={(e) => handleChange(index, e.target.value)}
                        className="form-input"
                        placeholder={placeholder}
                    />
                    <button type="button" onClick={() => handleRemove(index)} className="btn btn-secondary" style={{ padding: '0.5rem' }}>
                        ×
                    </button>
                </div>
            ))}
            <button type="button" onClick={handleAdd} className="btn btn-secondary btn-sm">
                + Přidat položku
            </button>
        </div>
    );
};

// Helper for Meter List
const MeterList = ({ meters = [], onChange }) => {
    const METER_TYPES = [
        { value: 'electricity', label: 'Elektřina', defaultUnit: 'kWh' },
        { value: 'gas', label: 'Plyn', defaultUnit: 'm³' },
        { value: 'water_cold', label: 'Studená voda', defaultUnit: 'm³' },
        { value: 'water_hot', label: 'Teplá voda', defaultUnit: 'm³' },
        { value: 'water', label: 'Voda (obecná)', defaultUnit: 'm³' },
        { value: 'heat', label: 'Teplo', defaultUnit: 'GJ' },
    ];

    const handleAdd = () => {
        onChange([...meters, { type: 'electricity', description: '', meterNumber: '', unit: 'kWh' }]);
    };

    const handleRemove = (index) => {
        const newMeters = meters.filter((_, i) => i !== index);
        onChange(newMeters);
    };

    const handleChange = (index, field, value) => {
        const newMeters = [...meters];
        newMeters[index] = { ...newMeters[index], [field]: value };

        // Auto-set unit if type changes and unit is empty or default
        if (field === 'type') {
            const typeDef = METER_TYPES.find(t => t.value === value);
            if (typeDef) {
                newMeters[index].unit = typeDef.defaultUnit;
            }
        }

        onChange(newMeters);
    };

    return (
        <div className="form-group">
            <label className="form-label">Seznam měřičů</label>
            {meters.map((meter, index) => (
                <div key={index} className="card-sub" style={{ background: '#f9f9f9', padding: '10px', borderRadius: '5px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <strong>Měřič #{index + 1}</strong>
                        <button type="button" onClick={() => handleRemove(index)} className="btn btn-secondary btn-sm" style={{ color: 'var(--color-error)' }}>
                            Odstranit
                        </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(150px, 1fr) minmax(150px, 1fr) minmax(150px, 1fr) 100px', gap: '10px', alignItems: 'end' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontSize: '0.85rem' }}>Typ</label>
                            <select
                                className="form-input"
                                value={meter.type}
                                onChange={(e) => handleChange(index, 'type', e.target.value)}
                            >
                                {METER_TYPES.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontSize: '0.85rem' }}>Upřesnění</label>
                            <input
                                type="text"
                                className="form-input"
                                value={meter.description || ''}
                                onChange={(e) => handleChange(index, 'description', e.target.value)}
                                placeholder="např. VT"
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontSize: '0.85rem' }}>Číslo měřiče</label>
                            <input
                                type="text"
                                className="form-input"
                                value={meter.meterNumber}
                                onChange={(e) => handleChange(index, 'meterNumber', e.target.value)}
                                placeholder="123456"
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontSize: '0.85rem' }}>Jednotka</label>
                            <input
                                type="text"
                                className="form-input"
                                value={meter.unit}
                                onChange={(e) => handleChange(index, 'unit', e.target.value)}
                                placeholder="kWh"
                            />
                        </div>
                    </div>
                </div>
            ))}
            <button type="button" onClick={handleAdd} className="btn btn-secondary btn-sm">
                + Přidat měřič
            </button>
        </div>
    );
};

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
        landlord_bank_code: '',
        // Settings
        flat_equipment: [],
        meters: [], // Changed to array
        servicesBreakdown: {
            gas: 0,
            electricity: 0,
            coldWater: 0,
            buildingServices: 0
        },
        propertyDetails: {
            unitNumber: '',
            floor: '',
            layout: ''
        }
    });

    useEffect(() => {
        if (!isNew) {
            fetchProperty();
        }
    }, [user, id]);

    const fetchProperty = async () => {
        try {
            setLoading(true);

            // Fetch Standard (Cleaned up)
            let { data: propData, error: propError } = await supabase
                .from('properties')
                .select('*')
                .eq('id', id)
                .maybeSingle();

            // RPC Fallback for Dev Mode
            if (!propData) {
                const devUserId = import.meta.env.VITE_DEV_USER_ID;
                const { data: { session } } = await supabase.auth.getSession();
                const targetUserId = session?.user?.id || devUserId;
                if (targetUserId) {
                    const { data: rpcData } = await supabase.rpc('get_owner_properties', { target_user_id: targetUserId });
                    if (rpcData) propData = rpcData.find(p => String(p.id) === String(id));
                }
            }

            if (!propData) throw new Error('Nemovitost nenalezena.');

            // Fetch Meters from SQL Table (v15)
            // Strategy: Use RPC to bypass RLS in case of Dev Mode
            const { data: sqlMeters } = await supabase
                .rpc('get_property_meters_with_latest', { target_property_id: id });

            let meters = [];
            if (sqlMeters && sqlMeters.length > 0) {
                meters = sqlMeters.map(m => ({
                    id: m.id,
                    type: m.type,
                    description: m.description,
                    meterNumber: m.meter_number,
                    unit: m.unit,
                    is_active: m.is_active
                }));
            } else {
                // Fallback to JSON settings (Old Data)
                const settings = propData.settings || {};
                if (Array.isArray(settings.meters)) {
                    meters = settings.meters;
                } else if (settings.meters) {
                    const old = settings.meters;
                    if (old.electricity?.active) meters.push({ type: 'electricity', meterNumber: old.electricity.meterNumber, unit: old.electricity.unit });
                    if (old.gas?.active) meters.push({ type: 'gas', meterNumber: old.gas.meterNumber, unit: old.gas.unit });
                    if (old.water?.cold?.active) meters.push({ type: 'water_cold', meterNumber: old.water.cold.meterNumber, unit: old.water.cold.unit });
                    if (old.water?.hot?.active) meters.push({ type: 'water_hot', meterNumber: old.water.hot.meterNumber, unit: old.water.hot.unit });
                }
            }

            const landlord = propData.landlord_info || {};
            const landlordAddress = landlord.address || {};
            const landlordContact = landlord.contact || {};
            const landlordBank = landlord.bankAccount || {};

            setFormData({
                name: propData.name || '',
                street: propData.address?.street || '',
                city: propData.address?.city || '',
                zip: propData.address?.zip || '',
                shared_area_m2: propData.shared_area_m2 || '',
                landlord_name: landlord.name || '',
                landlord_birth_number: landlord.birthNumber || '',
                landlord_street: landlordAddress.street || '',
                landlord_city: landlordAddress.city || '',
                landlord_zip: landlordAddress.postalCode || '',
                landlord_email: landlordContact.email || '',
                landlord_phone: landlordContact.phone || '',
                landlord_account_number: landlordBank.accountNumber || '',
                landlord_bank_code: landlordBank.bankCode || '',
                flat_equipment: propData.settings?.equipment || [],
                flat_equipment: propData.settings?.equipment || [],
                flat_equipment: propData.settings?.equipment || [],
                meters: meters,
                servicesBreakdown: propData.settings?.servicesBreakdown || { gas: 0, electricity: 0, coldWater: 0, buildingServices: 0 },
                propertyDetails: propData.settings?.propertyDetails || { unitNumber: '', floor: '', layout: '' }
            });
        } catch (err) {
            console.error('Error fetching property:', err);
            setError('Nepodařilo se načíst data.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMetersChange = (newMeters) => {
        setFormData(prev => ({ ...prev, meters: newMeters }));
    };

    const handleEquipmentChange = (newEquipment) => {
        setFormData(prev => ({ ...prev, flat_equipment: newEquipment }));
    };

    const handleServicesChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            servicesBreakdown: {
                ...prev.servicesBreakdown,
                [name]: Number(value)
            }
        }));
    };

    const handlePropertyDetailsChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            propertyDetails: {
                ...prev.propertyDetails,
                [name]: value
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Prepare Property Payload (JSON part)
            // Existing settings logic
            let existingSettings = {};
            if (!isNew) {
                const { data: currentProp } = await supabase.from('properties').select('settings').eq('id', id).maybeSingle();
                if (currentProp) existingSettings = currentProp.settings || {};
            }

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
                settings: {
                    ...existingSettings,
                    equipment: formData.flat_equipment,
                    meters: [], // DEPRECATED: Clearing legacy array so we rely on SQL. Or keep for backup? Let's clear to avoid sync issues.
                    // Keep defaults
                    rentDueDay: existingSettings.rentDueDay || 15,
                    noticePeriodMonths: existingSettings.noticePeriodMonths || 2,
                    securityDeposit: existingSettings.securityDeposit || { amount: 15000, currency: 'Kč' },
                    servicesBreakdown: formData.servicesBreakdown,
                    propertyDetails: formData.propertyDetails
                },
                owner_id: user?.id
            };
            let resultError;

            // 2. Save Property
            let propertyId = id;
            if (isNew) {
                // INSERT works fine usually as RLS often allows insert if owner_id = auth.uid.
                // But for robust dev mode we might need create_property RPC later.
                // For now, assume INSERT works or user is owner.
                const { data: newProp, error } = await supabase.from('properties').insert([payload]).select().single();
                resultError = error;
                if (newProp) propertyId = newProp.id;
            } else {
                // UPDATE via RPC to ensure settings (equipment) are saved even if RLS is strict/mismatched
                const { error } = await supabase.rpc('update_property_content', {
                    p_property_id: id,
                    p_name: payload.name,
                    p_address: payload.address,
                    p_shared_area_m2: payload.shared_area_m2,
                    p_landlord_info: payload.landlord_info,
                    p_settings: payload.settings
                });
                resultError = error;
            }

            if (resultError) throw resultError;

            // 3. Save Meters to SQL Table via RPC (Robust)
            const metersForRpc = formData.meters.map(m => ({
                id: m.id, // Can be undefined for new
                type: m.type,
                description: m.description,
                meter_number: m.meterNumber,
                unit: m.unit,
                is_active: true
            }));

            const { error: rpcError } = await supabase.rpc('upsert_property_meters', {
                p_property_id: propertyId,
                p_meters: metersForRpc
            });

            if (rpcError) throw rpcError;

            navigate('/properties');

        } catch (err) {
            console.error('Error saving property:', err);
            setError('Chyba při ukládání: ' + (err.message || err));
        } finally {
            setLoading(false);
        }
    };

    if (loading && !isNew && !formData.name) return <div>Načítám...</div>;

    return (
        <div className="container fade-in" style={{ paddingBottom: '2rem' }}>
            <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
                <Link to={isNew ? "/properties" : `/properties/${id}`} className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
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



                    <div className="form-group">
                        <label className="form-label">Doplňující údaje o jednotce (do smlouvy)</label>
                        <div className="form-grid form-grid-3">
                            <div className="form-group">
                                <label className="form-label" style={{ fontSize: '0.85rem' }}>Číslo jednotky (např. 2033/74)</label>
                                <input
                                    type="text"
                                    name="unitNumber"
                                    value={formData.propertyDetails.unitNumber}
                                    onChange={handlePropertyDetailsChange}
                                    className="form-input"
                                    placeholder="2033/74"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label" style={{ fontSize: '0.85rem' }}>Podlaží</label>
                                <input
                                    type="text"
                                    name="floor"
                                    value={formData.propertyDetails.floor}
                                    onChange={handlePropertyDetailsChange}
                                    className="form-input"
                                    placeholder="8"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label" style={{ fontSize: '0.85rem' }}>Dispozice (vč. výměry)</label>
                                <input
                                    type="text"
                                    name="layout"
                                    value={formData.propertyDetails.layout}
                                    onChange={handlePropertyDetailsChange}
                                    className="form-input"
                                    placeholder="155 m2, 7+kk"
                                />
                            </div>
                        </div>
                    </div>

                    <hr style={{ margin: '2rem 0', borderTop: '1px solid var(--color-border)' }} />


                    {/* Meters Section */}
                    <h2 style={{ fontSize: '1.2rem', margin: '1rem 0 1rem 0', color: 'var(--color-primary-700)' }}>Měřiče a Vybavení</h2>

                    <MeterList
                        meters={formData.meters}
                        onChange={handleMetersChange}
                    />

                    <div className="form-group" style={{ marginTop: '1.5rem' }}>
                        <ArrayInput
                            label="Vybavení bytu"
                            items={formData.flat_equipment}
                            onChange={handleEquipmentChange}
                            placeholder="např. Kuchyňská linka s vestavěnými spotřebiči"
                        />
                        <small className="form-hint">Toto vybavení se zobrazí v předávacím protokolu v sekci "VYBAVENÍ BYTU".</small>
                    </div>

                    <hr style={{ margin: '2rem 0', borderTop: '1px solid var(--color-border)' }} />

                    <h2 style={{ fontSize: '1.2rem', margin: '1rem 0 1rem 0', color: 'var(--color-primary-700)' }}>Rozpis záloh na služby</h2>
                    <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>Definujte výši záloh pro jednotlivé služby. Tyto částky se zobrazí ve smlouvě v tabulce "VÝPOČET ZÁLOH NA SLUŽBY".</p>

                    <div className="form-grid form-grid-2">
                        <div className="form-group">
                            <label className="form-label">Plyn</label>
                            <input
                                type="number"
                                name="gas"
                                value={formData.servicesBreakdown.gas}
                                onChange={handleServicesChange}
                                className="form-input"
                                placeholder="0"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Elektřina</label>
                            <input
                                type="number"
                                name="electricity"
                                value={formData.servicesBreakdown.electricity}
                                onChange={handleServicesChange}
                                className="form-input"
                                placeholder="0"
                            />
                        </div>
                    </div>
                    <div className="form-grid form-grid-2">
                        <div className="form-group">
                            <label className="form-label">Studená voda</label>
                            <input
                                type="number"
                                name="coldWater"
                                value={formData.servicesBreakdown.coldWater}
                                onChange={handleServicesChange}
                                className="form-input"
                                placeholder="0"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Služby SVJ (Úklid atd.)</label>
                            <input
                                type="number"
                                name="buildingServices"
                                value={formData.servicesBreakdown.buildingServices}
                                onChange={handleServicesChange}
                                className="form-input"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <hr style={{ margin: '2rem 0', borderTop: '1px solid var(--color-border)' }} />


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
                </form >
            </div >
        </div >
    );
};

export default PropertyEdit;
