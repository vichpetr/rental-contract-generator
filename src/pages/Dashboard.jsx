import React from 'react';
import { useProperty } from '../context/PropertyContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { properties, selectedProperty, selectProperty } = useProperty();
    const navigate = useNavigate();

    const handlePropertySelect = (property) => {
        selectProperty(property);
        navigate('properties/' + property.id); // Navigate to property detail or generic generator page?
        // Or stay on dashboard but now context is set? 
        // User asked: "choose property and allow to choose another pages..."
        // Let's just set context and showing available actions is good.
    };

    return (
        <div className="dashboard fade-in">
            <h1 className="mb-4">Vítejte ve správě bytů</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Moje Nemovitosti</h2>
                        <p className="card-description">Vyberte nemovitost pro správu</p>
                    </div>
                    <div className="property-list">
                        {properties.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <p>Zatím nemáte žádné nemovitosti.</p>
                                <button className="btn btn-primary mt-4" onClick={() => navigate('properties/new')}>
                                    + Přidat první nemovitost
                                </button>
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {properties.map(p => {
                                    const isSelected = selectedProperty?.id === p.id;
                                    return (
                                        <div
                                            key={p.id}
                                            className={`p-4 border rounded-lg transition-all ${isSelected ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="font-bold text-lg">{p.name}</h3>
                                                {isSelected && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">Vybráno</span>}
                                            </div>
                                            <div className="text-sm text-gray-600 mb-3">
                                                {p.address?.street}, {p.address?.city}
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handlePropertySelect(p)}
                                                    className={`btn btn-sm flex-1 ${isSelected ? 'btn-primary' : 'btn-outline-primary'}`}
                                                >
                                                    {isSelected ? 'Spravovat' : 'Vybrat'}
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); navigate(`properties/${p.id}`); }}
                                                    className="btn btn-sm btn-outline-secondary"
                                                >
                                                    Detail
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        {properties.length > 0 && (
                            <button className="btn btn-secondary w-full mt-4 border-dashed" onClick={() => navigate('properties/new')}>
                                + Přidat další nemovitost
                            </button>
                        )}
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h2 className="card-title">Přehled</h2>
                        <p className="card-description">Souhrnné statistiky</p>
                    </div>
                    <div className="stats">
                        <div className="stat-item flex justify-between py-2 border-b border-gray-100">
                            <span>Počet nemovitostí:</span>
                            <span className="font-bold">{properties.length}</span>
                        </div>
                        <div className="stat-item flex justify-between py-2 border-b border-gray-100">
                            <span>Aktivní nájemníci:</span>
                            <span className="font-muted">-</span>
                        </div>
                        <div className="stat-item flex justify-between py-2">
                            <span>Končící smlouvy:</span>
                            <span className="font-muted">-</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
