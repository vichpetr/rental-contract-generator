import ContractForm from './components/ContractForm';
import './index.css';

function App() {
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
