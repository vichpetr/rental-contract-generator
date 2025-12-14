import React, { useState } from 'react';
import { useLocation, Outlet } from 'react-router-dom';

import Sidebar from './Sidebar';

const Layout = ({ authorized, basePath, isEmbedded }) => {
    const location = useLocation();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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

            <div className={`main - wrapper ${isSidebarCollapsed ? 'collapsed' : ''} `}>
                <header className="top-header">
                    <div className="header-title">
                        <h2 style={{ margin: 0 }}></h2>
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
