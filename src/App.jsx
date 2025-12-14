import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import ContractForm from './components/ContractForm';
import Layout from './components/Layout';
import PropertiesList from './pages/PropertiesList';
import PropertyDetail from './pages/PropertyDetail';
import UnitEdit from './pages/UnitEdit';
import PropertyEdit from './pages/PropertyEdit';
import TenantList from './pages/TenantList';
import TenantEdit from './pages/TenantEdit';
import TenantDetail from './pages/TenantDetail';
import './index.css';

import { PropertyProvider } from './context/PropertyContext';
import Dashboard from './pages/Dashboard';

const AppRoutes = ({ user, authorized, basePath, isEmbedded }) => (
  <PropertyProvider>
    <Routes>
      <Route element={<Layout authorized={authorized} basePath={basePath} isEmbedded={isEmbedded} />}>
        {/* Root - Dashboard */}
        <Route path="" element={<Dashboard />} />

        {/* Properties Management */}
        <Route path="properties/new" element={<PropertyEdit user={user} />} />
        <Route path="properties/:id/edit" element={<PropertyEdit user={user} />} />

        <Route path="properties" element={<PropertiesList user={user} />} />
        <Route path="properties/:id" element={<PropertyDetail user={user} />} />

        {/* Unit Management */}
        <Route path="properties/:propertyId/units/:unitId" element={<UnitEdit user={user} />} />

        {/* Tenant Management */}
        <Route path="tenants" element={<TenantList user={user} />} />
        <Route path="tenants/new" element={<TenantEdit user={user} />} />
        <Route path="tenants/:id" element={<TenantDetail user={user} />} />
        <Route path="tenants/:id/edit" element={<TenantEdit user={user} />} />

        {/* Original Generator */}
        <Route path="generator" element={<ContractForm user={user} />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="" replace />} />
      </Route>
    </Routes>
  </PropertyProvider>
);

import { setSession } from './lib/supabase';

// ... (other imports)

// ... (AppRoutes)

function App({ user, session, basename }) {
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // 1. Sync Session if provided (Embedded Mode)
    if (session) {
      setSession(session).catch(console.error);
    }

    // 2. Authorization Logic
    if (user) {
      setAuthorized(true);
      return;
    }
    const PORTAL_URL = import.meta.env.VITE_PORTAL_URL || 'https://home-portal.apps.petrvich.eu/';
    const isDev = import.meta.env.MODE === 'development';
    if (window.location.hostname !== 'localhost' && !window.location.hostname.includes('home-portal') && !isDev) {
      window.location.href = PORTAL_URL;
    } else if (isDev) {
      console.warn('Running in standalone/dev mode.');
      if (!user) setAuthorized(true);
    } else {
      window.location.href = PORTAL_URL;
    }
  }, [user, session]);

  if (!user && !authorized) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '20px' }}>
        <h2>Přístup odepřen</h2>
        <p>Tato aplikace je dostupná pouze přes hlavní portál.</p>
        <a href={import.meta.env.VITE_PORTAL_URL || 'https://home-portal.apps.petrvich.eu/'} className="button">Přejít na Portál</a>
      </div>
    );
  }

  const defaultDevUserId = import.meta.env.VITE_DEV_USER_ID || '00000000-0000-0000-0000-000000000000';
  const currentUser = user || (import.meta.env.MODE === 'development' ? { id: defaultDevUserId, email: 'dev@example.com' } : null);
  const isEmbedded = !!user || !!basename; // Proxy for embedded mode

  // If embedded, we use the Parent Router (shared context). 
  // We just render Layout > Routes.
  const appBasePath = isEmbedded ? (basename || '/app/generator') : '';

  if (isEmbedded) {
    return (
      <AppRoutes user={currentUser} authorized={authorized} basePath={appBasePath} isEmbedded={isEmbedded} />
    );
  }

  // Standalone mode: We need a Router.
  return (
    <Router basename={basename}>
      <AppRoutes user={currentUser} authorized={authorized} basePath={appBasePath} isEmbedded={isEmbedded} />
    </Router>
  );
}

export default App;
