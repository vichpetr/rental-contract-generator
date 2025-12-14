import React, { useState } from 'react';
import { useLocation, Outlet, Link } from 'react-router-dom';
import { useProperty } from '../context/PropertyContext';

import Sidebar from './Sidebar';

const Layout = ({ authorized, basePath, isEmbedded }) => {
    const location = useLocation();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const { selectedProperty } = useProperty();

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    // If not authorized, we probably show a simple unauthorized view or let the routes handle it.
    // But assuming Layout is used inside authorized routes mainly.
    // If we want to show Sidebar, we should do it here.

    return (
        <div className="app">
            <Sidebar
                basePath={basePath}
                isCollapsed={isSidebarCollapsed}
                toggleCollapse={toggleSidebar}
            />

            <div className={`main-wrapper ${isSidebarCollapsed ? 'collapsed' : ''}`}>
                <header className="top-header">
                    <div className="header-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <div className="header-title">
                            <h2 style={{ margin: 0 }}>Správa bytů</h2>
                        </div>
                        {selectedProperty && (
                            <div className="header-property-status" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Vybraná nemovitost</div>
                                    <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{selectedProperty.name}</div>
                                </div>
                                <Link to="" className="btn btn-sm btn-outline-primary" style={{ textDecoration: 'none', fontSize: '0.8rem', padding: '4px 10px' }}>
                                    Změnit
                                </Link>
                            </div>
                        )}
                    </div>
                </header>

                <main className="app-main">
                    <div className="container">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
