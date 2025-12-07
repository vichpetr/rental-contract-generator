import { useEffect, useState } from 'react';
import ContractForm from './components/ContractForm';
import './index.css';

function App({ user }) {
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // If user is provided (from Portal), we are authorized
    if (user) {
      setAuthorized(true);
      return;
    }

    // Checking environment to allow local dev without redirect loop if needed
    // For now, we strictly redirect to production Portal
    const PORTAL_URL = import.meta.env.VITE_PORTAL_URL || 'https://home-portal.apps.petrvich.eu/';

    // Safety check to avoid redirecting if we are already ON the portal (shouldn't happen if embedded correctly but good for safety)
    if (window.location.hostname !== 'localhost' && !window.location.hostname.includes('home-portal')) {
      window.location.href = PORTAL_URL;
    } else if (window.location.hostname === 'localhost') {
      // Optional: Allow local dev? Or force login?
      // For now let's just show a message to not break dev entirely
      console.warn('Running in standalone mode without user. In production this would redirect.');
    } else {
      // Standalone deployment on same domain? Redirect.
      window.location.href = PORTAL_URL;
    }
  }, [user]);

  if (!user && !authorized) {
    // Standalone mode - Redirecting...
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '20px' }}>
        <h2>Přístup odepřen</h2>
        <p>Tato aplikace je dostupná pouze přes hlavní portál.</p>
        <a href={import.meta.env.VITE_PORTAL_URL || 'https://home-portal.apps.petrvich.eu/'} className="button">Přejít na Portál</a>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="container">
          <h1>Generátor nájemních smluv</h1>
          <p>Jednoduché vytvoření nájemní smlouvy a předávacího protokolu</p>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          <ContractForm />
        </div>
      </main>

      <footer className="app-footer">
        <div className="container">
          <p>© 2025 Generátor nájemních smluv • Verze 1.0</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
