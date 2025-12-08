import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';

const Layout = ({ authorized }) => {
    const location = useLocation();

    const isActive = (path) => {
        const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
        return location.pathname.endsWith(normalizedPath);
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
                                to="properties"
                                className={isActive('/properties') || isActive('properties') ? 'nav-link active' : 'nav-link'}
                                style={{ color: 'white', textDecoration: 'none', fontWeight: (isActive('/properties') || isActive('properties')) ? 'bold' : 'normal' }}
                            >
                                Nemovitosti
                            </Link>
                            <Link
                                to="generator"
                                className={isActive('/generator') || isActive('generator') ? 'nav-link active' : 'nav-link'}
                                style={{ color: 'white', textDecoration: 'none', fontWeight: (isActive('/generator') || isActive('generator')) ? 'bold' : 'normal' }}
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
