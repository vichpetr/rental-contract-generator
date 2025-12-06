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

  // Splatnost nájmu
  rentDueDay: 10, // den v měsíci

  // Výpovědní doba
  noticePeriodMonths: 2,

  // Rozpad záloha na služby (měsíčně v Kč)
  servicesBreakdown: {
    gas: 800,
    electricity: 800,
    coldWater: 500,
    buildingServices: 600, // služby SVJ
  },

  // Výchozí doba trvání nájmu (v letech)
  defaultContractDuration: 2,

  // Šablona nájemní smlouvy (HTML)
  contractTemplate: `
<div style="font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.5; color: #000;">
  
  <p style="text-align: center; font-size: 14pt; font-weight: bold; margin: 20px 0;">
    Nájemní smlouva – pronájem bytu
  </p>
  
  <p style="text-align: center; font-size: 9pt; margin-bottom: 20px;">
    dle § 2235 a násl. zákona č. 89/2012 Sb., občanského zákoníku, ve znění pozdějších předpisů
  </p>

  <table cellspacing="0" cellpadding="5" style="width: 100%; border: 2pt solid #000; border-collapse: collapse; margin: 20px 0; font-size: 10pt;">
    <tr>
      <td colspan="2" style="border-bottom: 1pt solid #000; padding: 7px 5px; font-weight: bold; font-size: 10pt;">
        1. SMLUVNÍ STRANY
      </td>
    </tr>
    <tr>
      <td style="width: 25%; border-bottom: 1pt solid #000; padding: 5px; font-weight: bold; vertical-align: top;">
        Pronajímatel:
      </td>
      <td style="border-bottom: 1pt solid #000; padding: 5px; font-size: 9pt;">
        {{LANDLORD_NAME}}, narozen(a) {{LANDLORD_BIRTH_NUMBER}}<br>
        Trvale bytem: {{LANDLORD_ADDRESS}}<br>
        Telefon: {{LANDLORD_PHONE}}, e-mail: {{LANDLORD_EMAIL}}
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 2pt solid #000; padding: 5px; font-weight: bold; vertical-align: top;">
        Nájemce:
      </td>
      <td style="border-bottom: 2pt solid #000; padding: 5px;">
        <p style="margin: 3px 0; font-size: 10pt;">Jméno: {{TENANT_NAME}}</p>
        <p style="margin: 3px 0; font-size: 10pt;">Trvale bytem: {{TENANT_ADDRESS}}</p>
        <p style="margin: 3px 0; font-size: 10pt;">Narozen(a): {{TENANT_BIRTH_NUMBER}} | Číslo dokladu: {{TENANT_BIRTH_NUMBER}}</p>
        <p style="margin: 3px 0; font-size: 10pt;">Telefon: {{TENANT_PHONE}} | E-mail: {{TENANT_EMAIL}}</p>
      </td>
    </tr>
  </table>

  {{SUBTENANT_SECTION}}

  <table cellspacing="0" cellpadding="5" style="width: 100%; border: 2pt solid #000; border-collapse: collapse; margin: 20px 0; font-size: 10pt;">
    <tr>
      <td colspan="2" style="border-bottom: 1pt solid #000; padding: 7px 5px; font-weight: bold;">
        2. PARAMETRY SMLOUVY
      </td>
    </tr>
    <tr>
      <td style="width: 35%; border-right: 1pt solid #ccc; border-bottom: 1pt solid #ccc; padding: 5px;">Adresa nemovitosti:</td>
      <td style="border-bottom: 1pt solid #ccc; padding: 5px;">{{PROPERTY_ADDRESS}}</td>
    </tr>
    <tr>
      <td style="border-right: 1pt solid #ccc; border-bottom: 1pt solid #ccc; padding: 5px;">Doba nájmu na:</td>
      <td style="border-bottom: 1pt solid #ccc; padding: 5px;">Dobu určitou</td>
    </tr>
    <tr>
      <td style="border-right: 1pt solid #ccc; border-bottom: 1pt solid #ccc; padding: 5px;">Datum začátku nájmu:</td>
      <td style="border-bottom: 1pt solid #ccc; padding: 5px; font-weight: bold;">{{DATE_FROM}}</td>
    </tr>
    <tr>
      <td style="border-right: 1pt solid #ccc; border-bottom: 1pt solid #ccc; padding: 5px;">Ukončení nájmu:</td>
      <td style="border-bottom: 1pt solid #ccc; padding: 5px; font-weight: bold;">{{DATE_TO}}</td>
    </tr>
    <tr>
      <td style="border-right: 1pt solid #ccc; border-bottom: 1pt solid #ccc; padding: 5px;">Celkem osob:</td>
      <td style="border-bottom: 1pt solid #ccc; padding: 5px; font-weight: bold;">{{OCCUPANTS_COUNT}}</td>
    </tr>
    <tr>
      <td style="border-right: 1pt solid #ccc; border-bottom: 1pt solid #ccc; padding: 5px;">Výše čistého nájemného:</td>
      <td style="border-bottom: 1pt solid #ccc; padding: 5px; font-weight: bold;">{{MONTHLY_RENT}} Kč</td>
    </tr>
    <tr>
      <td style="border-right: 1pt solid #ccc; border-bottom: 1pt solid #ccc; padding: 5px;">Číslo účtu pronajímatele:</td>
      <td style="border-bottom: 1pt solid #ccc; padding: 5px;">{{BANK_ACCOUNT}}</td>
    </tr>
    <tr>
      <td style="border-right: 1pt solid #ccc; border-bottom: 1pt solid #ccc; padding: 5px;">Splatnost nájmu:</td>
      <td style="border-bottom: 1pt solid #ccc; padding: 5px; font-weight: bold;">{{RENT_DUE_DAY}}. den v daném měsíci</td>
    </tr>
    <tr>
      <td style="border-right: 1pt solid #ccc; padding: 5px;">Výše jistoty:</td>
      <td style="padding: 5px; font-weight: bold;">{{SECURITY_DEPOSIT}} Kč</td>
    </tr>
  </table>

  <table cellspacing="0" cellpadding="5" style="width: 100%; border: 2pt solid #000; border-collapse: collapse; margin: 20px 0; font-size: 9pt;">
    <tr>
      <td colspan="6" style="border-bottom: 1pt solid #000; padding: 7px 5px; font-weight: bold; font-size: 10pt;">
        3. VÝPOČET ZÁLOH NA SLUŽBY
      </td>
    </tr>
    <tr>
      <td style="border: 1pt solid #ccc; padding: 5px;">Plyn</td>
      <td style="border: 1pt solid #ccc; padding: 5px;">{{SERVICE_GAS}} Kč</td>
      <td style="border: 1pt solid #ccc; padding: 5px;">Služby SVJ</td>
      <td style="border: 1pt solid #ccc; padding: 5px;">{{SERVICE_BUILDING}} Kč</td>
      <td rowspan="2" style="border: 1pt solid #ccc; padding: 5px; font-weight: bold;">CELKEM SLUŽBY:</td>
      <td rowspan="2" style="border: 1pt solid #ccc; padding: 5px; font-weight: bold;">{{MONTHLY_FEES}} Kč</td>
    </tr>
    <tr>
      <td style="border: 1pt solid #ccc; padding: 5px;">Elektřina</td>
      <td style="border: 1pt solid #ccc; padding: 5px;">{{SERVICE_ELECTRICITY}} Kč</td>
      <td style="border: 1pt solid #ccc; padding: 5px;">Studená voda</td>
      <td style="border: 1pt solid #ccc; padding: 5px;">{{SERVICE_WATER}} Kč</td>
    </tr>
    <tr>
      <td colspan="4"></td>
      <td style="border: 1pt solid #ccc; padding: 5px; font-weight: bold;">ČISTÉ NÁJEMNÉ:</td>
      <td style="border: 1pt solid #ccc; padding: 5px; font-weight: bold;">{{MONTHLY_RENT}} Kč</td>
    </tr>
    <tr>
      <td colspan="4"></td>
      <td style="border: 1pt solid #ccc; padding: 5px; font-weight: bold;">CELKEM:</td>
      <td style="border: 1pt solid #ccc; padding: 5px; font-weight: bold;">{{TOTAL_MONTHLY}} Kč</td>
    </tr>
  </table>

  <p style="text-align: center; font-weight: bold; margin: 20px 0 10px 0; font-size: 10pt;">Úvod</p>

  <ol style="margin-left: 20px; font-size: 9pt;">
    <li style="margin-bottom: 10px;">První strana této smlouvy je členěna do částí oddělených očíslovanými nadpisy, které jsou v následujícím textu značeny jako „oddíly".</li>
    <li style="margin-bottom: 10px;">Tuto nájemní smlouvu uzavřeli dle vlastního prohlášení svéprávní účastníci (dále jen smluvní strany) uvedení na první straně této smlouvy v oddílu „1. SMLUVNÍ STRANY".</li>
  </ol>

  <p style="text-align: center; font-weight: bold; margin: 15px 0 5px 0; font-size: 10pt;">Článek I.<br>Předmět nájmu</p>

  <ol style="margin-left: 20px; font-size: 9pt;">
    <li style="margin-bottom: 10px;">Pronajímatel je dle výpisu z katastru nemovitostí vedeného příslušným katastrálním úřadem vlastníkem nemovitosti specifikované v položce „Adresa nemovitosti" (dále jen „nemovitost").</li>
    <li style="margin-bottom: 10px;">Pronajímatel přenechává nájemci nemovitost k zajištění svých bytových potřeb na dobu uvedenou v položce „Doba nájmu", a to od data viz položka „Datum začátku nájmu" do data viz položka „Datum konce nájmu". Pronajímatel souhlasí s tím, že v případě nájmu na dobu určitou a řádného plnění povinností nájemce se na žádost nájemce doba nájmu prodlouží automaticky. Dokladem o prodloužení je písemné potvrzení pronajímatele.</li>
    <li style="margin-bottom: 10px;">Smluvní strany výslovně prohlašují, že nemovitost je způsobilá k řádnému užívání (nastěhování a obývání), a že nic nebrání k plnění této smlouvy nastěhováním nájemce. Smluvní strany se dohodly, že o předání nemovitosti bude vyhotoven předávací protokol, který bude jako příloha č. 1 přiložen k této smlouvě.</li>
  </ol>

  <p style="text-align: center; font-weight: bold; margin: 15px 0 5px 0; font-size: 10pt;">Článek II.<br>Nájem a jeho užívání</p>

  <ol style="margin-left: 20px; font-size: 9pt;">
    <li style="margin-bottom: 10px;"><strong>Společné prostory:</strong> Nájemce může užívat společné prostory domu (tedy chodbičku, koupelnu, kuchyni, toaletu a předsíň), a to pouze ke sjednanému účelu, tj. k bydlení, a je povinen se o společné prostory starat.</li>
    <li style="margin-bottom: 10px;">Nájemce nemá nárok na výlučné užívání koupelny či kuchyně. Je povinen se chovat ohleduplně k dalším obyvatelům.</li>
    <li style="margin-bottom: 10px;">V nemovitosti je zakázáno držení domácích mazlíčků a kouření. Porušení zákazu je hrubým porušením povinností nájemce.</li>
    <li style="margin-bottom: 10px;">Pronajímatel má právo v případě nutnosti vstoupit do nemovitosti bez souhlasu nájemce. Dále má právo za přiměřeného předchozího upozornění vstoupit do nemovitosti v doprovodu dalších osob.</li>
    <li style="margin-bottom: 10px;">Drobné opravy nemovitosti související s jejím užíváním a náklady spojené s běžnou údržbou (do 1000 Kč) hradí nájemce.</li>
    <li style="margin-bottom: 10px;">Změny na nemovitosti, včetně stavebních úprav, je nájemce oprávněn provádět jen s písemným souhlasem pronajímatele.</li>
  </ol>

  <p style="text-align: center; font-weight: bold; margin: 15px 0 5px 0; font-size: 10pt;">Článek III.<br>Nájemné a placení</p>

  <ol style="margin-left: 20px; font-size: 9pt;">
    <li style="margin-bottom: 10px;">Nájemce se zavazuje platit pronajímateli za pronájem nemovitosti nájemné ve výši stanovené v položce „Výše čistého nájemného".</li>
    <li style="margin-bottom: 10px;">Splatnost nájemného: Nájemné je splatné k datu uvedenému v položce „Splatnost nájmu" daného měsíce, a to předem.</li>
    <li style="margin-bottom: 10px;">Způsob placení nájemného: Platby se uskutečňují převodem na bankovní účet uvedený v položce „Číslo účtu pronajímatele".</li>
    <li style="margin-bottom: 10px;">Kromě nájemného se nájemce zavazuje hradit zálohy na služby spojené s užíváním nemovitosti.</li>
  </ol>

  <p style="text-align: center; font-weight: bold; margin: 15px 0 5px 0; font-size: 10pt;">Článek IV.<br>Práva a povinnosti stran</p>

  <ol style="margin-left: 20px; font-size: 9pt;">
    <li style="margin-bottom: 10px;">Nájemce je povinen užívat nemovitost řádně a v souladu s povahou nemovitosti.</li>
    <li style="margin-bottom: 10px;">Nájemce je povinen dodržovat domovní řád a ustanovení občanského zákoníku.</li>
    <li style="margin-bottom: 10px;">Po celou dobu trvání nájmu je nájemce povinen udržovat nemovitost včetně vybavení ve stavu odpovídajícímu řádnému užívání.</li>
  </ol>

  <p style="text-align: center; font-weight: bold; margin: 15px 0 5px 0; font-size: 10pt;">Článek V.<br>Skončení nájmu</p>

  <ol style="margin-left: 20px; font-size: 9pt;">
    <li style="margin-bottom: 10px;">Nájem nemovitosti na základě této smlouvy je sjednán na dobu uvedenou v položce „Doba nájmu".</li>
    <li style="margin-bottom: 10px;">Nájem zanikne písemnou dohodou mezi pronajímatelem a nájemcem. Výpověď je možné poslat emailem.</li>
    <li style="margin-bottom: 10px;">Pro případ výpovědi se sjednává {{NOTICE_PERIOD}}-měsíční výpovědní doba.</li>
  </ol>

  <p style="text-align: center; font-weight: bold; margin: 15px 0 5px 0; font-size: 10pt;">Článek VI.<br>Doručování</p>

  <ol style="margin-left: 20px; font-size: 9pt;">
    <li style="margin-bottom: 10px;">Nájemce je povinen doručovat pronajímateli písemnosti na adresu uvedenou v záhlaví této smlouvy.</li>
    <li style="margin-bottom: 10px;">Pronajímatel je povinen doručovat nájemci písemnosti na adresu budovy nebo na adresu bydliště.</li>
  </ol>

  <p style="text-align: center; font-weight: bold; margin: 15px 0 5px 0; font-size: 10pt;">Článek VII.<br>Závěrečná ustanovení</p>

  <ol style="margin-left: 20px; font-size: 9pt;">
    <li style="margin-bottom: 10px;">Tato smlouva nabývá platnosti a účinnosti dnem podpisu smluvních stran.</li>
    <li style="margin-bottom: 10px;">Smluvní strany se dohodly, že v náležitostech touto smlouvou přímo neupravených se jejich vzájemné vztahy budou řídit příslušnými ustanoveními občanského zákoníku.</li>
    <li style="margin-bottom: 10px;">Tato smlouva se vyhotovuje ve {{COPIES_COUNT}} stejnopisech s platností originálu, po {{COPIES_PER_PARTY}} výtisku pro každou ze smluvních stran.</li>
    <li style="margin-bottom: 10px;">Přílohou této smlouvy je Předávací protokol (Příloha č. 1).</li>
    <li style="margin-bottom: 10px;">Smluvní strany prohlašují, že před podpisem tuto smlouvu řádně projednaly a přečetly, že je sepsána podle jejich pravé a svobodné vůle.</li>
  </ol>

  <p style="margin: 40px 0 20px 0;">V {{SIGNING_PLACE}} dne {{SIGNING_DATE}}</p>

  <table style="width: 100%; margin-top: 40px;">
    <tr>
      <td style="width: 50%; text-align: center; border-top: 1px solid #000; padding-top: 5px;">Podpis pronajímatele</td>
      <td style="width: 50%; text-align: center; border-top: 1px solid #000; padding-top: 5px;">Podpis nájemce</td>
    </tr>
  </table>

  {{SUBTENANT_SIGNATURE}}

</div>`,

  // Šablona pro sekci podnájemníka (HTML)
  subtenantSection: `
  <table cellspacing="0" cellpadding="5" style="width: 100%; border: 2pt solid #000; border-collapse: collapse; margin: 20px 0; font-size: 10pt;">
    <tr>
      <td style="width: 25%; border-bottom: 2pt solid #000; padding: 5px; font-weight: bold; vertical-align: top;">
        Podnájemce:
      </td>
      <td style="border-bottom: 2pt solid #000; padding: 5px;">
        <p style="margin: 3px 0; font-size: 10pt;">Jméno: {{SUBTENANT_NAME}}</p>
        <p style="margin: 3px 0; font-size: 10pt;">Trvale bytem: {{SUBTENANT_ADDRESS}}</p>
        <p style="margin: 3px 0; font-size: 10pt;">Narozen(a): {{SUBTENANT_BIRTH_NUMBER}} | Číslo dokladu: {{SUBTENANT_BIRTH_NUMBER}}</p>
        <p style="margin: 3px 0; font-size: 10pt;">Telefon: {{SUBTENANT_PHONE}} | E-mail: {{SUBTENANT_EMAIL}}</p>
      </td>
    </tr>
  </table>
  `,

  subtenantSignature: `
  <table style="width: 100%; margin-top: 20px;">
    <tr>
      <td style="width: 33.33%; text-align: center;"></td>
      <td style="width: 33.33%; text-align: center;"></td>
      <td style="width: 33.33%; text-align: center; border-top: 1px solid #000; padding-top: 5px;">Podpis podnájemce</td>
    </tr>
  </table>
  `,

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
