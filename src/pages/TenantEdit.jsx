import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import PersonForm from '../components/PersonForm';
import { validatePersonField } from '../utils/validation';

export default function TenantEdit({ user }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [errors, setErrors] = useState({});

    // Map DB structure to PersonForm structure
    // DB: first_name, last_name, address_street...
    // Form: firstName, lastName, address...

    // We need to transform data back and forth
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        birthNumber: '',
        address: '', // This will map to street + city + zip via some logic or just simple string?
        // Wait, PersonForm uses a single "address" string usually.
        // But DB has 3 fields. 
        // Let's decide: PersonForm usually takes one string "address".
        // In the existing ContractForm, "address" is a string.
        // My DB schema has 3 fields. 
        // Option A: Update PersonForm to handle 3 fields (breaking change for wizard?)
        // Option B: Concat/Split string (fragile).
        // Option C: Update PersonForm to be smarter.

        // Let's look at PersonForm again. lines 123-139: One input for "address".
        // And "address" is usually "Street 123, City 12345".
        // I will stick to single string for UI consistency for now, and parse/store it in DB best effort, 
        // OR just simple mapping.
        // Actually, my `v11_tenants.sql` schema HAS `address_street`, `address_city`, `address_zip`.
        // I should probably simplify the DB for this MVP to just `address` (text) to match the Form, 
        // OR update the Form. 
        // Updating Form might break the wizard logic which expects one field.
        // Let's modify the `TenantEdit` to simply combine/split for now, or just store the whole string in `address_street` and leave others empty/unused if lazy.
        // BETTER: Let's store the full string in `address_street` and use that. Simpler.

        phone: '',
        email: ''
    });

    useEffect(() => {
        if (!isNew) {
            fetchTenant();
        } else {
            setLoading(false);
        }
    }, [id, user]);

    const fetchTenant = async () => {
        try {
            const devUserId = import.meta.env.VITE_DEV_USER_ID;
            const targetUserId = user?.id || devUserId;

            // Use RPC to get list and find (or use simple select if we trust RLS for read)
            // Sticking to RPC pattern for consistency
            const { data, error } = await supabase
                .rpc('get_owner_tenants', { target_owner_id: targetUserId });

            if (error) throw error;

            const tenant = data.find(t => String(t.id) === String(id));
            if (!tenant) throw new Error('Tenant not found');

            // Map DB -> Form
            setFormData({
                firstName: tenant.first_name,
                lastName: tenant.last_name,
                birthNumber: tenant.birth_number,
                address: tenant.address_street, // Check note above
                phone: tenant.phone,
                email: tenant.email
            });
        } catch (err) {
            console.error('Error fetching tenant:', err);
            setError('Nepodařilo se načíst údaje nájemníka.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        // Validate all fields
        const allErrors = {};
        ['firstName', 'lastName', 'birthNumber', 'address'].forEach(field => {
            const fieldError = validatePersonField(formData, field, true);
            Object.assign(allErrors, fieldError);
        });

        if (Object.keys(allErrors).length > 0) {
            setErrors(allErrors);
            return;
        }

        setSaving(true);
        try {
            const devUserId = import.meta.env.VITE_DEV_USER_ID;
            const targetUserId = user?.id || devUserId;

            const payload = {
                p_owner_id: targetUserId,
                p_first_name: formData.firstName,
                p_last_name: formData.lastName,
                p_birth_number: formData.birthNumber,
                p_address_street: formData.address, // Storing full string here
                p_address_city: '', // usage simplified
                p_address_zip: '', // usage simplified
                p_email: formData.email,
                p_phone: formData.phone
            };

            if (isNew) {
                const { error } = await supabase.rpc('create_tenant_as_owner', payload);
                if (error) throw error;
            } else {
                const { error } = await supabase.rpc('update_tenant_as_owner', {
                    ...payload,
                    p_tenant_id: parseInt(id)
                });
                if (error) throw error;
            }

            navigate('/tenants');
        } catch (err) {
            console.error('Error saving tenant:', err);
            setError('Chyba při ukládání: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleValidate = (field) => {
        const fieldError = validatePersonField(formData, field, true);
        setErrors(prev => ({ ...prev, ...fieldError }));
    };

    if (loading) return <div className="loading">Načítám...</div>;

    return (
        <div className="fade-in">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="card-title">{isNew ? 'Nový nájemník' : 'Úprava nájemníka'}</h2>
                <Link to="/tenants" className="btn btn-secondary">
                    Zrušit
                </Link>
            </div>

            <div className="card">
                {error && <div className="error" style={{ marginBottom: 'var(--space-lg)' }}>{error}</div>}

                <PersonForm
                    person={formData}
                    onChange={setFormData}
                    errors={errors}
                    onValidate={handleValidate}
                />

                <div className="btn-group" style={{ marginTop: 'var(--space-2xl)', justifyContent: 'flex-end' }}>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                        {saving ? 'Ukládám...' : 'Uložit nájemníka'}
                    </button>
                </div>
            </div>
        </div>
    );
}
