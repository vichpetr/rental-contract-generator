# Generátor nájemních smluv (Module Federation Remote)

Tento projekt slouží jako **modul** (Remote Application) pro hlavní portálovou aplikaci.
Lze jej spouštět i samostatně pro vývoj.

## 🚀 Rychlý Start

Pro spuštění v rámci portálové aplikace je potřeba, aby běžel na portu **5001** v režimu, který vystavuje `remoteEntry.js`.

```bash
npm install
npm run build
npm run serve
```
Aplikace poběží na `http://localhost:5001` a bude připravena pro napojení do Shell aplikace.

## ⚙️ Konfigurace

Aplikace využívá proměnné prostředí pro nastavení chování. V rootu projektu vytvořte soubor `.env` (inspirujte se v `.env.example`).

| Proměnná | Popis | Výchozí hodnota |
|----------|-------|-----------------|
| `VITE_PORTAL_URL` | URL hlavní portálové aplikace pro přesměrování při přímém přístupu. | `https://home-portal.apps.petrvich.eu/` |
| `VITE_SUPABASE_URL` | URL Supabase projektu. | - |
| `VITE_SUPABASE_ANON_KEY` | Anon klíč pro přístup k Supabase API. | - |
| `VITE_CORS_ALLOWED_ORIGINS` | Povolené domény pro CORS (oddělené čárkou nebo regex v /.../). | `*.apps.petrvich.eu`, `localhost` |
| `VITE_DEV_USER_ID` | **Pouze pro dev:** ID uživatele (UUID), kterého aplikace simuluje při vývoji (bypass auth). | `00000000-...` |

## 🛠 Místní Vývoj a Data

Aby aplikace viděla data při lokálním vývoji (kdy nejste přihlášeni přes Portál), je potřeba:

1.  Mít spuštěný lokální Supabase (`supabase start`).
2.  Mít aplikované migrace (včetně `v9_dev_rpc.sql` pro bypass RLS).
3.  Nastavit `VITE_DEV_USER_ID` v `.env` na ID uživatele, který vlastní nemovitosti v DB.
    *   ID zjistíte v Supabase Dashboardu (Authentication) nebo SQL dotazem: `select id, email from auth.users;`.

## 🗄️ Databáze

Schéma databáze a migrační skripty jsou umístěny v adresáři `database/`.
Projekt vyžaduje tabulky properties, rental_units a contracts v Supabase.

---

## 🏗 Architektura

Tato aplikace je součástí modulárního systému (Micro-frontends) postaveného na **Vite Module Federation**.

- **Jméno modulu**: `rental_generator`
- **Exponované komponenty**: `./App` (vstupní bod aplikace)
- **Shared dependencies**: `react`, `react-dom`

### Jak to funguje?
Aplikace se vybuildí do statických souborů, kde vznikne `dist/assets/remoteEntry.js`. Tento soubor si stahuje hlavní aplikace (Portal) a dynamicky načítá komponenty z tohoto projektu.

## 💻 Vývoj

### Samostatný vývoj (Standalone)
Pro běžný vývoj (úpravy formuláře, logiky):
```bash
npm run dev
```
Aplikace poběží na `http://localhost:5173`.

### Integrační vývoj (s Portálem)
Pokud potřebujete testovat propojení s portálem:
1. Spusťte tento projekt: `npm run build && npm run serve`
2. Spusťte `portal-app` vedle v druhém terminálu.

## 📋 Funkce (MVP)

- ✅ Výběr varianty pokoje (malý/velký pokoj)
- ✅ Vyplnění osobních údajů nájemníka
- ✅ Podmíněné vyplnění údajů podnájemníka
- ✅ Nastavení období nájmu a data podpisu
- ✅ Náhled dokumentů a export do PDF
- ✅ Automatický výpočet nákladů


## 🔮 Plánovaný rozvoj
Detailní plán funkcí pro další fáze (správa financí, databáze) najdete v souboru [features.md](./features.md).

## 🚢 Deployment

Aplikace se nasazuje na FTP do podadresáře (např. `/modules/generator`), aby ji hlavní aplikace našla.
Viz `.github/workflows/deploy.yml`.
