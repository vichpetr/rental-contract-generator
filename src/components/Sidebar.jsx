import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ basePath, isCollapsed, toggleCollapse }) => {
    // Helper to join paths safely
    const resolvePath = (path) => {
        const base = basePath || '';
        const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
        const cleanPath = path.startsWith('/') ? path.slice(1) : path;
        return `${cleanBase}/${cleanPath}`;
    };

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div className="logo-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                </div>
                {!isCollapsed && <span className="logo-text">Správa bytů</span>}
            </div>

            <nav className="sidebar-nav">
                <NavLink to={resolvePath('properties')} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="Nemovitosti">
                    <span className="icon">🏠</span>
                    {!isCollapsed && <span>Nemovitosti</span>}
                </NavLink>
                <NavLink to={resolvePath('tenants')} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="Nájemníci">
                    <span className="icon">👥</span>
                    {!isCollapsed && <span>Nájemníci</span>}
                </NavLink>
                <NavLink to={resolvePath('generator')} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} title="Generátor">
                    <span className="icon">🎎</span>
                    {!isCollapsed && <span>Generátor</span>}
                </NavLink>
            </nav>

            <button className="sidebar-toggle" onClick={toggleCollapse} title={isCollapsed ? "Rozbalit menu" : "Sbalit menu"}>
                {isCollapsed ? '›' : '‹'}
            </button>
        </aside>
    );
};

export default Sidebar;
