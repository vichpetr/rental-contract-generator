/**
 * Centrální konfigurace pro generátor nájemních smluv
 */

export const contractConfig = {
  // Údaje pronajímatele
  landlord: {
    name: "Jméno Příjmení",
    birthNumber: "123456/7890",
    address: {
      street: "Ulice 123",
      city: "Praha 1",
      postalCode: "110 00"
    },
    contact: {
      phone: "+420 123 456 789",
      email: "pronajimatel@email.cz"
    },
    bankAccount: {
      accountNumber: "1234567890",
      bankCode: "0100"
    }
  },

  // Adresa pronajímaného prostoru
  property: {
    street: "Pronajímaná ulice 456",
    city: "Praha 2",
    postalCode: "120 00",
    specificLocation: "2. patro, vchod B"
  },

  // Varianty pokojů
  roomVariants: [
    {
      id: "small",
      name: "Malý pokoj",
      maxOccupants: 1,
      monthlyRent: 8000,
      feePerPerson: 2000,
      description: "Pokoj pro jednu osobu",
      area: 12, // m²
      features: ["postel", "stůl", "židle", "skříň"]
    },
    {
      id: "large",
      name: "Velký pokoj",
      maxOccupants: 2,
      monthlyRent: 12000,
      feePerPerson: 2500,
      description: "Pokoj pro jednu až dvě osoby",
      area: 20, // m²
      features: ["2× postel", "2× stůl", "2× židle", "vestavěné skříně"]
    }
  ],

  // Čísla měřičů pro předávací protokol
  meterReadings: {
    electricity: {
      meterNumber: "EL123456",
      unit: "kWh"
    },
    water: {
      cold: {
        meterNumber: "V-STU123",
        unit: "m³"
      },
      hot: {
        meterNumber: "V-TEP456",
        unit: "m³"
      }
    },
    gas: {
      meterNumber: "PL789012",
      unit: "m³"
    }
  },

  // Výše vratné kauce
  securityDeposit: {
    amount: 20000,
    currency: "Kč"
  },

  // Šablona nájemní smlouvy
  contractTemplate: `SMLOUVA O PODNÁJMU BYTU

uzavřená podle § 2235 a násl. občanského zákoníku

I. SMLUVNÍ STRANY

1. Pronajímatel
Jméno: {{LANDLORD_NAME}}
Rodné číslo: {{LANDLORD_BIRTH_NUMBER}}
Trvalé bydliště: {{LANDLORD_ADDRESS}}
Telefon: {{LANDLORD_PHONE}}
E-mail: {{LANDLORD_EMAIL}}

2. Nájemce
Jméno: {{TENANT_NAME}}
Rodné číslo: {{TENANT_BIRTH_NUMBER}}
Trvalé bydliště: {{TENANT_ADDRESS}}
Telefon: {{TENANT_PHONE}}
E-mail: {{TENANT_EMAIL}}

{{SUBTENANT_SECTION}}

II. PŘEDMĚT SMLOUVY

Pronajímatel přenechává nájemci do podnájmu část bytu, a to pokoj {{ROOM_NAME}} o výměře {{ROOM_AREA}} m², který se nachází na adrese:

{{PROPERTY_ADDRESS}}

III. DOBA NÁJMU

Smlouva se uzavírá na dobu určitou od {{DATE_FROM}} do {{DATE_TO}}.

IV. NÁJEMNÉ A ÚHRADY

1. Měsíční nájemné činí: {{MONTHLY_RENT}} Kč
2. Měsíční zálohy na služby: {{MONTHLY_FEES}} Kč
   (Zálohy jsou stanoveny za {{OCCUPANTS_COUNT}} {{PERSON_WORD}})
3. Celková měsíční platba: {{TOTAL_MONTHLY}} Kč

Platba je splatná vždy k 1. dni kalendářního měsíce předem na účet pronajímatele:
{{BANK_ACCOUNT}}

V. VRATNÁ KAUCE

Nájemce složí při podpisu této smlouvy vratnou kauci ve výši {{SECURITY_DEPOSIT}} Kč.
Kauce bude vrácena po ukončení nájmu a řádném předání pokoje bez závad.

VI. PRÁVA A POVINNOSTI STRAN

1. Nájemce je oprávněn užívat pronajatý pokoj k bydlení.
2. Nájemce je povinen udržovat pronajatý prostor v řádném stavu.
3. Nájemce je povinen hradit včas nájemné a zálohy na služby.
4. Nájemce není oprávněn pronajatý prostor dále podnajímat.

VII. VÝPOVĚDNÍ DŮVODY

Pronajímatel může smlouvu vypovědět mimo jiné z následujících důvodů:
- neplacení nájemného či záloh po dobu delší než 1 měsíc
- hrubé porušování domovního řádu
- přenechání pokoje třetí osobě bez souhlasu pronajímatele

VIII. ZÁVĚREČNÁ USTANOVENÍ

Smlouva se vyhotovuje ve 2 ({{COPIES_COUNT}}) vyhotoveních, z nichž každá strana obdrží po 1 ({{COPIES_PER_PARTY}}) vyhotovení.

Smlouva nabývá platnosti dnem podpisu oběma smluvními stranami.

V {{SIGNING_PLACE}} dne {{SIGNING_DATE}}


___________________________          ___________________________
Podpis pronajímatele                 Podpis nájemce

{{SUBTENANT_SIGNATURE}}`,

  // Šablona pro sekci podnájemníka
  subtenantSection: `
3. Podnájemce
Jméno: {{SUBTENANT_NAME}}
Rodné číslo: {{SUBTENANT_BIRTH_NUMBER}}
Trvalé bydliště: {{SUBTENANT_ADDRESS}}
Telefon: {{SUBTENANT_PHONE}}
E-mail: {{SUBTENANT_EMAIL}}`,

  subtenantSignature: `

___________________________
Podpis podnájemce`,

  // Šablona předávacího protokolu
  handoverProtocolTemplate: `PŘEDÁVACÍ PROTOKOL

k nájemní smlouvě uzavřené dne {{SIGNING_DATE}}

Pronajímatel: {{LANDLORD_NAME}}
Nájemce: {{TENANT_NAME}}
{{SUBTENANT_PROTOCOL_SECTION}}

Předmět nájmu: {{ROOM_NAME}}, {{PROPERTY_ADDRESS}}

I. STAV POKOJE PŘI PŘEDÁNÍ

Pokoj je předáván v řádném stavu, čistý a funkční.

II. VYBAVENÍ POKOJE

{{ROOM_FEATURES}}

III. STAVY MĚŘIČŮ

Elektřina (číslo měřiče: {{ELECTRICITY_METER}}): __________ {{ELECTRICITY_UNIT}}
Studená voda (číslo měřiče: {{COLD_WATER_METER}}): __________ {{COLD_WATER_UNIT}}
Teplá voda (číslo měřiče: {{HOT_WATER_METER}}): __________ {{HOT_WATER_UNIT}}
Plyn (číslo měřiče: {{GAS_METER}}): __________ {{GAS_UNIT}}

IV. PŘEDÁNÍ KLÍČŮ

Počet předaných klíčů od pokoje: __________
Počet předaných klíčů od vchodu: __________

V. ZÁVĚRY

Nájemce stvrzuje převzetí pokoje ve výše uvedeném stavu a zavazuje se jej v tomto stavu udržovat.

V {{SIGNING_PLACE}} dne {{SIGNING_DATE}}


___________________________          ___________________________
Podpis pronajímatele                 Podpis nájemce

{{SUBTENANT_SIGNATURE}}`,

  subtenantProtocolSection: `Podnájemce: {{SUBTENANT_NAME}}`
};
