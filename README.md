# Generátor nájemních smluv

Webová aplikace pro generování nájemních smluv a předávacích protokolů pro podnájem pokojů.

## 📋 Funkce (Fáze 1 - MVP)

- ✅ Výběr varianty pokoje (malý/velký pokoj)
- ✅ Vyplnění osobních údajů nájemníka
- ✅ Podmíněné vyplnění údajů podnájemníka (pro velký pokoj)
- ✅ Nastavení období nájmu (datum od-do)
- ✅ Volba data podpisu smlouvy
- ✅ Náhled výsledných dokumentů (smlouva + předávací protokol)
- ✅ Export do PDF
- ✅ Automatický výpočet celkových nákladů podle počtu osob

## 🚀 Technologie

- **Frontend**: Vite + React
- **PDF generování**: pdfmake
- **Styling**: Vanilla CSS s premium designem
- **Date handling**: date-fns
- **Deployment**: GitHub Actions + FTPS

## 💻 Instalace a spuštění

### Prerekvizity

- Node.js 20+
- npm

### Lokální vývoj

```bash
# Instalace závislostí
npm install

# Spuštění dev serveru
npm run dev

# Build pro production
npm run build

# Preview production buildu
npm run preview
```

Aplikace bude dostupná na `http://localhost:5173`

## 📁 Struktura projektu

```
generator-najemnich-smluv/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions FTPS deployment
├── src/
│   ├── components/
│   │   ├── ContractForm.jsx    # Hlavní wizard formulář
│   │   ├── ContractPreview.jsx # Náhled dokumentů
│   │   ├── PersonForm.jsx      # Formulář osobních údajů
│   │   ├── RoomVariantSelector.jsx
│   │   ├── DateRangeSelector.jsx
│   │   └── SigningDateSelector.jsx
│   ├── config/
│   │   └── contractConfig.js   # Konfigurace smluv a variant pokojů
│   ├── utils/
│   │   ├── contractGenerator.js # Generování textů smluv
│   │   ├── pdfGenerator.js      # PDF export pomocí pdfmake
│   │   └── validation.js        # Validační funkce
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css               # Design system
├── index.html
├── package.json
└── README.md
```

## ⚙️ Konfigurace

Aktualizujte `src/config/contractConfig.js` pro úpravu:

- Údajů pronajímatele
- Variant pokojů a cen
- Textů smluv a protokolů
- Stavů měřičů
- Adresy pronajímaného prostoru

## 🚢 Deployment

Aplikace používá GitHub Actions pro automatický deployment přes FTPS.

### Nastavení GitHub Secrets

V nastavení GitHub repository přidejte následující secrets:

- `FTP_SERVER` - adresa FTP serveru (např. `ftp.example.com`)
- `FTP_USERNAME` - FTP uživatelské jméno
- `FTP_PASSWORD` - FTP heslo

### Deployment proces

1. Push do `main` branch
2. GitHub Actions automaticky:
   - Nainstaluje závislosti
   - Vytvoří production build
   - Nahraje `dist` složku na server přes FTPS

## 🔮 Plánované rozšíření

### Fáze 2: Databáze a autentizace
- PHP backend (Nette framework)
- REST/GraphQL API
- MySQL databáze
- SSO přihlášení (Google, Apple, Seznam.cz)
- Správa uživatelů s rolemi
- CRUD pro nájemníky a smlouvy

### Fáze 3: Platforma pro správu nájmu
- Evidence plateb
- Sledování výdajů
- Dashboard s přehledy
- Kalkulace zisku
- Reporting a export

## 📄 License

© 2025 Generátor nájemních smluv

## 👨‍💻 Autor

Vytvořeno pomocí Antigravity AI
