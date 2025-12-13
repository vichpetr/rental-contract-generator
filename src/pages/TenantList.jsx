import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function TenantList({ user }) {
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTenants();
    }, [user]);

    const fetchTenants = async () => {
        try {
            setLoading(true);
            const devUserId = import.meta.env.VITE_DEV_USER_ID;
            const targetUserId = user?.id || devUserId;

            if (!targetUserId) {
                setTenants([]);
                setLoading(false);
                return;
            }

            // Use RPC to be safe with RLS in dev mode
            const { data, error } = await supabase
                .rpc('get_owner_tenants', { target_owner_id: targetUserId });

            if (error) throw error;
            setTenants(data || []);
        } catch (err) {
            console.error('Error fetching tenants:', err);
            setError('Nepodařilo se načíst seznam nájemníků.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Opravdu chcete smazat tohoto nájemníka?')) return;

        try {
            const devUserId = import.meta.env.VITE_DEV_USER_ID;
            const targetUserId = user?.id || devUserId;

            // Use RPC for delete to be safe
            const { error } = await supabase.rpc('delete_tenant_as_owner', {
                p_tenant_id: id,
                p_owner_id: targetUserId
            });

            if (error) throw error;

            // Refresh list
            fetchTenants();
        } catch (err) {
            console.error('Error deleting tenant:', err);
            alert('Nepodařilo se smazat nájemníka.');
        }
    };

    if (loading) return <div className="loading">Načítám seznam nájemníků...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="fade-in">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 className="card-title">Seznam nájemníků</h2>
                    <p className="card-description">Správa databáze osob pro rychlé vyplňování smluv</p>
                </div>
                <Link to="new" className="btn btn-primary">
                    + Přidat nájemníka
                </Link>
            </div>

            {tenants.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-lg)' }}>
                        Zatím nemáte žádné uložené nájemníky.
                    </p>
                    <Link to="new" className="btn btn-primary">
                        Vytvořit prvního nájemníka
                    </Link>
                </div>
            ) : (
                <div className="room-variants" style={{ gridTemplateColumns: '1fr' }}>
                    {tenants.map(tenant => (
                        <div key={tenant.id} className="room-card" style={{ cursor: 'default' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h3 className="room-card-title">
                                        <Link to={`${tenant.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                            {tenant.first_name} {tenant.last_name}
                                        </Link>
                                    </h3>
                                    <p className="room-card-description">{tenant.email} • {tenant.phone}</p>
                                </div>
                                <div className="btn-group" style={{ gap: 'var(--space-sm)' }}>
                                    <Link to={`${tenant.id}/edit`} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                                        Upravit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(tenant.id)}
                                        className="btn btn-outline"
                                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
                                    >
                                        Smazat
                                    </button>
                                </div>
                            </div>

                            <div className="room-card-details" style={{ marginTop: 'var(--space-md)' }}>
                                <div className="room-card-detail">
                                    <span className="room-card-detail-label">Adresa</span>
                                    <span className="room-card-detail-value">{tenant.address_street}, {tenant.address_city} {tenant.address_zip}</span>
                                </div>
                                <div className="room-card-detail">
                                    <span className="room-card-detail-label">Číslo dokladu</span>
                                    <span className="room-card-detail-value">{tenant.birth_number}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
