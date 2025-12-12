import { useState } from 'react';

export default function PropertySelector({ properties, onSelect, loading }) {
    const [searchTerm, setSearchTerm] = useState('');

    if (loading) {
        return <div className="loading">Načítám nemovitosti...</div>;
    }

    if (!properties || properties.length === 0) {
        return (
            <div className="empty-state">
                <p>Nemáte přístup k žádným nemovitostem.</p>
                <small>Kontaktujte administrátora pokud si myslíte, že je to chyba.</small>
            </div>
        );
    }

    const filteredProperties = properties.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.address?.street?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.address?.city?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="property-selector">
            <h2 className="step-title">Vyberte nemovitost</h2>
            <p className="step-description">Zvolte dům nebo byt, pro který chcete vytvořit smlouvu.</p>

            <div className="search-bar" style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="hledat podle názvu nebo adresy..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="form-input"
                />
            </div>

            <div className="properties-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {filteredProperties.map(property => (
                    <div
                        key={property.id}
                        className="card property-card"
                        style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                        onClick={() => onSelect(property.id)}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                    >
                        <h3 style={{ margin: '0 0 8px 0' }}>{property.name}</h3>
                        <div className="property-address" style={{ fontSize: '0.9em', color: '#666' }}>
                            {property.address?.street}, {property.address?.city}
                        </div>
                    </div>
                ))}
            </div>

            {filteredProperties.length === 0 && (
                <p style={{ textAlign: 'center', color: '#888', marginTop: '20px' }}>
                    Žádná nemovitost nenalezena.
                </p>
            )}
        </div>
    );
}
