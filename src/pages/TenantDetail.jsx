import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import { FileText, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { DOCUMENT_TYPES } from '../components/DocumentUploader';

export default function TenantDetail({ user }) {
    const { id } = useParams();

    const [tenant, setTenant] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTenant();
    }, [id, user]);

    const fetchTenant = async () => {
        try {
            setLoading(true);
            const devUserId = import.meta.env.VITE_DEV_USER_ID;
            const targetUserId = user?.id || devUserId;

            if (!targetUserId) {
                setError("Uživatel není přihlášen");
                return;
            }

            // 1. Fetch tenant basic info
            const { data, error } = await supabase
                .rpc('get_owner_tenants', { target_owner_id: targetUserId });

            if (error) throw error;

            const foundTenant = data?.find(t => String(t.id) === String(id));
            if (!foundTenant) {
                setError('Nájemník nenalezen');
                return;
            }

            setTenant(foundTenant);

            // 2. Fetch Documents
            // Use RPC exclusively to bypass RLS in dev environment
            const { data: docsData, error: docsError } = await supabase
                .rpc('get_tenant_documents', { target_tenant_id: parseInt(id) });

            if (docsError) throw docsError;

            // 3. Generate Signed URLs
            const docsWithUrls = await Promise.all(docsData.map(async (doc) => {
                let signedUrl = null;
                if (doc.file_path) {
                    const { data: signedData } = await supabase.storage
                        .from('id_cards')
                        .createSignedUrl(doc.file_path, 3600);
                    signedUrl = signedData?.signedUrl;
                }
                return { ...doc, signedUrl };
            }));

            setDocuments(docsWithUrls);

        } catch (err) {
            console.error('Error fetching tenant detail:', err);
            setError('Nepodařilo se načíst detaily nájemníka.');
        } finally {
            setLoading(false);
        }
    };

    const getTypeLabel = (type) => {
        const found = DOCUMENT_TYPES.find(t => t.value === type);
        return found ? found.label : type;
    };

    const isImage = (path) => {
        if (!path) return false;
        const lower = path.toLowerCase();
        return lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.endsWith('.webp');
    };

    if (loading) return <div className="loading">Načítám detaily...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!tenant) return <div className="error">Nájemník nenalezen</div>;

    return (
        <div className="fade-in">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <Link to="/tenants" className="btn btn-secondary">
                        ← Zpět
                    </Link>
                    <h2 className="card-title" style={{ marginBottom: 0 }}>{tenant.first_name} {tenant.last_name}</h2>
                </div>
                <Link to="edit" className="btn btn-primary">
                    Upravit
                </Link>
            </div>

            <div className="card">
                <div className="room-card-details" style={{ fontSize: '1rem' }}>

                    <div className="room-card-detail">
                        <span className="room-card-detail-label">Jméno a příjmení</span>
                        <span className="room-card-detail-value">{tenant.first_name} {tenant.last_name}</span>
                    </div>

                    <div className="room-card-detail">
                        <span className="room-card-detail-label">Email</span>
                        <span className="room-card-detail-value">
                            <a href={`mailto:${tenant.email}`} style={{ color: 'var(--color-primary)' }}>{tenant.email}</a>
                        </span>
                    </div>

                    <div className="room-card-detail">
                        <span className="room-card-detail-label">Telefon</span>
                        <span className="room-card-detail-value">{tenant.phone}</span>
                    </div>

                    <div className="room-card-detail">
                        <span className="room-card-detail-label">Adresa trvalého bydliště</span>
                        <span className="room-card-detail-value">
                            {tenant.address_street}
                            {(tenant.address_city || tenant.address_zip) && `, ${tenant.address_zip} ${tenant.address_city}`}
                        </span>
                    </div>

                    <div className="room-card-detail">
                        <span className="room-card-detail-label">Datum narození</span>
                        <span className="room-card-detail-value">
                            {tenant.date_of_birth
                                ? format(new Date(tenant.date_of_birth), 'd. MMMM yyyy', { locale: cs })
                                : <span style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>Nezadáno</span>
                            }
                        </span>
                    </div>

                    <div className="room-card-detail">
                        <span className="room-card-detail-label">Rodné číslo / Číslo dokladu</span>
                        <span className="room-card-detail-value">{tenant.birth_number}</span>
                    </div>

                </div>

                <hr style={{ margin: 'var(--space-xl) 0', borderColor: 'var(--color-border)' }} />

                <h3 className="card-title" style={{ fontSize: '1.25rem', marginBottom: 'var(--space-md)' }}>
                    Dokumenty a doklady
                </h3>

                {documents.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-lg)' }}>
                        {documents.map(doc => (
                            <div key={doc.id} style={{
                                background: 'var(--color-surface-sunken)',
                                padding: 'var(--space-md)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--color-border)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--space-sm)' }}>
                                    <div>
                                        <p style={{ fontWeight: 500 }}>{getTypeLabel(doc.document_type)}</p>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{doc.file_name}</p>
                                    </div>
                                    <a
                                        href={doc.signedUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-outline"
                                        style={{ padding: '4px 8px' }}
                                    >
                                        <ExternalLink size={16} />
                                    </a>
                                </div>

                                {isImage(doc.file_path) && doc.signedUrl ? (
                                    <div style={{ height: '200px', background: '#fff', borderRadius: 'var(--radius-sm)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <img
                                            src={doc.signedUrl}
                                            alt={doc.file_name}
                                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                        />
                                    </div>
                                ) : (
                                    <div style={{ height: '200px', background: 'var(--color-surface)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
                                        <FileText size={48} style={{ opacity: 0.5, marginBottom: 'var(--space-sm)' }} />
                                        <span>Náhled není k dispozici</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--color-text-secondary)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                        Nejsou nahrány žádné dokumenty.
                    </div>
                )}

            </div>
        </div>
    );
}
