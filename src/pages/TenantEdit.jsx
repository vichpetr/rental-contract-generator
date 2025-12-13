import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import PersonForm from '../components/PersonForm';
import DocumentUploader, { DOCUMENT_TYPES } from '../components/DocumentUploader';
import { validatePersonField } from '../utils/validation';
import { Trash2, FileText, ExternalLink } from 'lucide-react';

export default function TenantEdit({ user }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [errors, setErrors] = useState({});

    // Form State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        birthNumber: '',
        address: '',
        phone: '',
        email: '',
        dateOfBirth: ''
    });

    // Documents State
    const [existingDocuments, setExistingDocuments] = useState([]);
    const [newDocuments, setNewDocuments] = useState([]); // Array from DocumentUploader

    useEffect(() => {
        if (!isNew) {
            fetchTenantData();
        } else {
            setLoading(false);
        }
    }, [id, user]);

    const fetchTenantData = async () => {
        try {
            const devUserId = import.meta.env.VITE_DEV_USER_ID;
            const targetUserId = user?.id || devUserId;

            // 1. Fetch Tenant Basic Info
            const { data: tenantData, error: tenantError } = await supabase
                .rpc('get_owner_tenants', { target_owner_id: targetUserId });

            if (tenantError) throw tenantError;

            const tenant = tenantData.find(t => String(t.id) === String(id));
            if (!tenant) throw new Error('Tenant not found');

            setFormData({
                firstName: tenant.first_name,
                lastName: tenant.last_name,
                birthNumber: tenant.birth_number || '',
                address: tenant.address_street || '',
                phone: tenant.phone || '',
                email: tenant.email || '',
                dateOfBirth: tenant.date_of_birth || ''
            });

            // 2. Fetch Tenant Documents (New Table)
            // Use RPC exclusively to bypass RLS in dev environment
            const { data: docs, error: docsError } = await supabase
                .rpc('get_tenant_documents', { target_tenant_id: parseInt(id) });

            if (docsError) throw docsError;
            setExistingDocuments(docs || []);

        } catch (err) {
            console.error('Error fetching tenant data:', err);
            setError('Nepodařilo se načíst údaje nájemníka.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteExistingDocument = async (docId) => {
        if (!window.confirm("Opravdu chcete smazat tento dokument?")) return;
        try {
            const { error } = await supabase
                .from('tenant_documents')
                .delete()
                .eq('id', docId);

            if (error) throw error;
            setExistingDocuments(prev => prev.filter(d => d.id !== docId));
        } catch (err) {
            console.error(err);
            alert("Chyba při mazání dokumentu");
        }
    };

    const uploadFile = async (file, path) => {
        if (!file) return null;
        const { data, error } = await supabase.storage
            .from('id_cards')
            .upload(path, file, { upsert: true });
        if (error) throw error;
        return data.path;
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

            // 1. Save Tenant Data (Create or Update)
            let tenantId = id;

            const commonPayload = {
                first_name: formData.firstName,
                last_name: formData.lastName,
                birth_number: formData.birthNumber,
                address_street: formData.address,
                address_city: '',
                address_zip: '',
                email: formData.email,
                phone: formData.phone,
                date_of_birth: formData.dateOfBirth || null,
                // Legacy columns - keep them as is or null. v12 RPC expects them in jsonb if used. 
                // We should pass them to satisfy strict parsing or just ignore if RPC allows missing keys.
                // Our v12 RPC uses `COALESCE(data->>key, column)` so missing key = no change.
                id_card_front_url: null,
                id_card_back_url: null
            };

            if (isNew) {
                const createPayload = {
                    ...commonPayload,
                    owner_id: targetUserId
                };
                const { data: newTenant, error: createError } = await supabase.rpc('create_tenant_as_owner', { tenant_data: createPayload });
                if (createError) throw createError;
                tenantId = newTenant.id; // Assuming RPC returns the row as defined in v12
            } else {
                const { error: updateError } = await supabase.rpc('update_tenant_as_owner', {
                    tenant_id: parseInt(id),
                    tenant_data: commonPayload
                });
                if (updateError) throw updateError;
            }

            // 2. Upload and Save New Documents
            if (newDocuments.length > 0) {
                for (const doc of newDocuments) {
                    const fileName = `${targetUserId}/${Date.now()}_${Math.random().toString(36).substr(2, 5)}_${doc.file.name}`;
                    const items = await uploadFile(doc.file, fileName);

                    // Insert into tenant_documents using RPC to bypass RLS
                    const { error: insertError } = await supabase
                        .rpc('save_tenant_document', {
                            p_tenant_id: tenantId,
                            p_document_type: doc.type,
                            p_file_path: items, // upload returns path in data.path, but my helper returns data.path
                            p_file_name: doc.file.name
                        });

                    if (insertError) throw insertError;
                }
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

    const getTypeLabel = (type) => {
        const found = DOCUMENT_TYPES.find(t => t.value === type);
        return found ? found.label : type;
    };

    if (loading) return <div className="loading">Načítám...</div>;

    return (
        <div className="fade-in">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="card-title">{isNew ? 'Nový nájemník' : 'Úprava nájemníka'}</h2>
                <div className="btn-group" style={{ gap: 'var(--space-sm)' }}>
                    <Link to="/tenants" className="btn btn-secondary">
                        Zrušit
                    </Link>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                        {saving ? 'Ukládám...' : 'Uložit nájemníka'}
                    </button>
                </div>
            </div>

            <div className="card">
                {error && <div className="error" style={{ marginBottom: 'var(--space-lg)' }}>{error}</div>}

                <PersonForm
                    person={formData}
                    onChange={setFormData}
                    errors={errors}
                    onValidate={handleValidate}
                    showDateOfBirth={true}
                />

                <hr style={{ margin: 'var(--space-xl) 0', borderColor: 'var(--color-border)' }} />

                <h3 className="card-title" style={{ fontSize: '1.25rem', marginBottom: 'var(--space-md)' }}>
                    Dokumenty a doklady
                </h3>

                {/* Uploder for New Files */}
                <DocumentUploader
                    files={newDocuments}
                    onFilesChange={setNewDocuments}
                />

                {/* Existing Documents List */}
                {existingDocuments.length > 0 && (
                    <div style={{ marginTop: 'var(--space-lg)' }}>
                        <h4 style={{ fontSize: '1rem', marginBottom: 'var(--space-sm)', color: 'var(--color-text-secondary)' }}>
                            Uložené dokumenty
                        </h4>
                        <div className="file-list" style={{ display: 'grid', gap: 'var(--space-sm)' }}>
                            {existingDocuments.map(doc => (
                                <div key={doc.id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: 'var(--space-sm) var(--space-md)',
                                    background: 'var(--color-surface)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-md)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                                        <div style={{ padding: '6px', background: 'var(--color-primary-50)', borderRadius: 'var(--radius-sm)' }}>
                                            <FileText size={20} color="var(--color-primary)" />
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 500, fontSize: '0.9rem' }}>{doc.file_name || 'Dokument bez názvu'}</p>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                                                {getTypeLabel(doc.document_type)}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDeleteExistingDocument(doc.id)}
                                        className="btn btn-outline"
                                        style={{ padding: '4px 8px', color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
