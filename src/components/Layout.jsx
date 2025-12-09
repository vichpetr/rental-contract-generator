import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';

const Layout = ({ authorized, basePath }) => {
    const location = useLocation();

    // Helper to join paths safely
    const resolvePath = (path) => {
        const base = basePath || '';
        return `${base}/${path}`.replace(/\/\//g, '/');
    };

    const isActive = (path) => {
        // Simple check if current location ends with the target path (handles both relative/absolute nuances)
        return location.pathname.endsWith(path);
    };

    return (
        <div className="app">
            <header className="app-header">
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Správa bytů</h1>
                        <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>Správa nemovitostí, jednotek a smluv</p>
                    </div>
                    {authorized && (
                        <nav style={{ display: 'flex', gap: '20px' }}>
                            <Link
                                to={resolvePath('properties')}
                                className={isActive('properties') ? 'nav-link active' : 'nav-link'}
                            >
                                Nemovitosti
                            </Link>
                            <Link
                                to={resolvePath('generator')}
                                className={isActive('generator') ? 'nav-link active' : 'nav-link'}
                            >
                                Generátor
                            </Link>
                        </nav>
                    )}
                </div>
            </header>

            <main className="app-main">
                <div className="container">
                    <Outlet />
                </div>
            </main>

            <footer className="app-footer">
                <div className="container">
                    <p>© 2025 Správa bytů • Verze 1.0</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
