import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ContractForm from './components/ContractForm';
import Layout from './components/Layout';
import PropertiesList from './pages/PropertiesList';
import PropertyDetail from './pages/PropertyDetail';
import UnitEdit from './pages/UnitEdit';
import PropertyEdit from './pages/PropertyEdit';
import './index.css';

const AppRoutes = ({ user, authorized }) => (
  <Routes>
    <Route element={<Layout authorized={authorized} />}>
      {/* Redirect root to Properties if authorized, else Generator */}
      {/* Use relative path "" for root match */}
      <Route path="" element={<Navigate to="/properties" replace />} />

      {/* Properties Management */}
      <Route path="properties/new" element={<PropertyEdit user={user} />} />
      <Route path="properties/:id/edit" element={<PropertyEdit user={user} />} />

      <Route path="properties" element={<PropertiesList user={user} />} />
      <Route path="properties/:id" element={<PropertyDetail user={user} />} />

      {/* Unit Management */}
      <Route path="properties/:propertyId/units/:unitId" element={<UnitEdit user={user} />} />

      {/* Original Generator */}
      <Route path="generator" element={<ContractForm />} />

      {/* Fallback - use absolute path to avoid loop */}
      <Route path="*" element={<Navigate to="/properties" replace />} />
    </Route>
  </Routes>
);

function App({ user, basename }) {
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
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
  }, [user]);

  if (!user && !authorized) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '20px' }}>
        <h2>Přístup odepřen</h2>
        <p>Tato aplikace je dostupná pouze přes hlavní portál.</p>
        <a href={import.meta.env.VITE_PORTAL_URL || 'https://home-portal.apps.petrvich.eu/'} className="button">Přejít na Portál</a>
      </div>
    );
  }

  const currentUser = user || (import.meta.env.MODE === 'development' ? { id: 'dev-user-id', email: 'dev@example.com' } : null);
  const isEmbedded = !!user || !!basename; // Proxy for embedded mode

  // If embedded, we use the Parent Router (shared context). 
  // We just render Layout > Routes.
  if (isEmbedded) {
    return (
      <AppRoutes user={currentUser} authorized={authorized} />
    );
  }

  // Standalone mode: We need a Router.
  return (
    <Router basename={basename}>
      <AppRoutes user={currentUser} authorized={authorized} />
    </Router>
  );
}

export default App;
