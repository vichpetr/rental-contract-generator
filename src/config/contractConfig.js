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
  
  <div style="text-align: center; font-size: 20pt; font-weight: bold; margin: 10px 0;">
    Nájemní smlouva – pronájem bytu
    <p style="text-align: center; font-size: 9pt; margin-bottom: 10px;">
    dle § 2235 a násl. zákona č. 89/2012 Sb., občanského zákoníku, ve znění pozdějších předpisů
  </p>
  </div>

  <table cellspacing="0" cellpadding="3" style="width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 9pt;">
    <tr>
      <td colspan="2" style="border-bottom: 1pt solid #000; padding: 5px; font-weight: bold; font-size: 10pt;">
        1. SMLUVNÍ STRANY
      </td>
    </tr>
    <tr>
      <td style="width: 20%; padding: 3px 5px; vertical-align: top;"><strong>Pronajímatel:</strong></td>
      <td style="padding: 3px 5px;">{{LANDLORD_NAME}}, narozen(a) {{LANDLORD_BIRTH_NUMBER}}<br>
      Trvale bytem: {{LANDLORD_ADDRESS}}<br>
      Telefon: {{LANDLORD_PHONE}}, e-mail: {{LANDLORD_EMAIL}}</td>
    </tr>
    <tr>
      <td style="padding: 3px 5px; vertical-align: top;"><strong>Nájemce:</strong></td>
      <td style="padding: 3px 5px;">{{TENANT_NAME}}, narozen(a) {{TENANT_BIRTH_NUMBER}}, číslo dokladu: {{TENANT_BIRTH_NUMBER}}<br>
      Trvale bytem: {{TENANT_ADDRESS}}<br>
      Telefon: {{TENANT_PHONE}}, e-mail: {{TENANT_EMAIL}}</td>
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

  <p style="text-align: center; font-weight: bold; margin: 10px 0 5px 0; font-size: 10pt;">Úvod</p>

  <ol style="margin: 5px 0 5px 20px; font-size: 9pt;">
    <li style="margin-bottom: 5px;">První strana této smlouvy je členěna do částí oddělených očíslovanými nadpisy, které jsou v následujícím textu značeny jako „oddíly".</li>
    <li style="margin-bottom: 5px;">Tuto nájemní smlouvu uzavřeli dle vlastního prohlášení svéprávní účastníci (dále jen smluvní strany) uvedení na první straně této smlouvy v oddílu „1. SMLUVNÍ STRANY".</li>
  </ol>

  <p style="text-align: center; font-weight: bold; margin: 8px 0 3px 0; font-size: 10pt;">Článek I.<br>Předmět nájmu</p>

  <ol style="margin: 5px 0 5px 20px; font-size: 9pt;">
    <li style="margin-bottom: 5px;">Pronajímatel je dle výpisu z katastru nemovitostí vedeného příslušným katastrálním úřadem vlastníkem nemovitosti specifikované v položce „Adresa nemovitosti" (dále jen „nemovitost").</li>
    <li style="margin-bottom: 5px;">Pronajímatel přenechává nájemci nemovitost k zajištění svých bytových potřeb na dobu uvedenou v položce „Doba nájmu", a to od data viz položka „Datum začátku nájmu" do data viz položka „Datum konce nájmu". Pronajímatel souhlasí s tím, že v případě nájmu na dobu určitou a řádného plnění povinností nájemce se na žádost nájemce doba nájmu prodlouží automaticky. Dokladem o prodloužení je písemné potvrzení pronajímatele.</li>
    <li style="margin-bottom: 5px;">Smluvní strany výslovně prohlašují, že nemovitost je způsobilá k řádnému užívání (nastěhování a obývání), a že nic nebrání k plnění této smlouvy nastěhováním nájemce. Smluvní strany se dohodly, že o předání nemovitosti bude vyhotoven předávací protokol, který bude jako příloha č. 1 přiložen k této smlouvě.</li>
  </ol>

  <p style="text-align: center; font-weight: bold; margin: 8px 0 3px 0; font-size: 10pt;">Článek II.<br>Nájem a jeho užívání</p>

  <ol style="margin: 5px 0 5px 20px; font-size: 9pt;">
    <li style="margin-bottom: 5px;"><strong>Společné prostory:</strong> Nájemce může užívat společné prostory domu (tedy chodbičku, koupelnu, kuchyni, toaletu a předsíň), a to pouze ke sjednanému účelu, tj. k bydlení, a je povinen se o společné prostory starat.</li>
    <li style="margin-bottom: 5px;">Nájemce nemá nárok na výlučné užívání koupelny či kuchyně. Je povinen se chovat ohleduplně k dalším obyvatelům.</li>
    <li style="margin-bottom: 5px;">V nemovitosti je zakázáno držení domácích mazlíčků a kouření. Porušení zákazu je hrubým porušením povinností nájemce.</li>
    <li style="margin-bottom: 5px;">Pronajímatel má právo v případě nutnosti vstoupit do nemovitosti bez souhlasu nájemce. Dále má právo za přiměřeného předchozího upozornění vstoupit do nemovitosti v doprovodu dalších osob.</li>
    <li style="margin-bottom: 5px;">Drobné opravy nemovitosti související s jejím užíváním a náklady spojené s běžnou údržbou (do 1000 Kč) hradí nájemce.</li>
    <li style="margin-bottom: 5px;">Změny na nemovitosti, včetně stavebních úprav, je nájemce oprávněn provádět jen s písemným souhlasem pronajímatele.</li>
  </ol>

  <p style="text-align: center; font-weight: bold; margin: 8px 0 3px 0; font-size: 10pt;">Článek III.<br>Nájemné a placení</p>

  <ol style="margin: 5px 0 5px 20px; font-size: 9pt;">
    <li style="margin-bottom: 5px;">Nájemce se zavazuje platit pronajímateli za pronájem nemovitosti nájemné ve výši stanovené v položce „Výše čistého nájemného".</li>
    <li style="margin-bottom: 5px;">Splatnost nájemného: Nájemné je splatné k datu uvedenému v položce „Splatnost nájmu" daného měsíce, a to předem.</li>
    <li style="margin-bottom: 5px;">Způsob placení nájemného: Platby se uskutečňují převodem na bankovní účet uvedený v položce „Číslo účtu pronajímatele".</li>
    <li style="margin-bottom: 5px;">Kromě nájemného se nájemce zavazuje hradit zálohy na služby spojené s užíváním nemovitosti.</li>
  </ol>

  <p style="text-align: center; font-weight: bold; margin: 8px 0 3px 0; font-size: 10pt;">Článek IV.<br>Práva a povinnosti stran</p>

  <ol style="margin: 5px 0 5px 20px; font-size: 9pt;">
    <li style="margin-bottom: 5px;">Nájemce je povinen užívat nemovitost řádně a v souladu s povahou nemovitosti.</li>
    <li style="margin-bottom: 5px;">Nájemce je povinen dodržovat domovní řád a ustanovení občanského zákoníku.</li>
    <li style="margin-bottom: 5px;">Po celou dobu trvání nájmu je nájemce povinen udržovat nemovitost včetně vybavení ve stavu odpovídajícímu řádnému užívání.</li>
  </ol>

  <p style="text-align: center; font-weight: bold; margin: 8px 0 3px 0; font-size: 10pt;">Článek V.<br>Skončení nájmu</p>

  <ol style="margin: 5px 0 5px 20px; font-size: 9pt;">
    <li style="margin-bottom: 5px;">Nájem nemovitosti na základě této smlouvy je sjednán na dobu uvedenou v položce „Doba nájmu".</li>
    <li style="margin-bottom: 5px;">Nájem zanikne písemnou dohodou mezi pronajímatelem a nájemcem. Výpověď je možné poslat emailem.</li>
    <li style="margin-bottom: 5px;">Pro případ výpovědi se sjednává {{NOTICE_PERIOD}}-měsíční výpovědní doba.</li>
  </ol>

  <p style="text-align: center; font-weight: bold; margin: 8px 0 3px 0; font-size: 10pt;">Článek VI.<br>Doručování</p>

  <ol style="margin: 5px 0 5px 20px; font-size: 9pt;">
    <li style="margin-bottom: 5px;">Nájemce je povinen doručovat pronajímateli písemnosti na adresu uvedenou v záhlaví této smlouvy.</li>
    <li style="margin-bottom: 5px;">Pronajímatel je povinen doručovat nájemci písemnosti na adresu budovy nebo na adresu bydliště.</li>
  </ol>

  <p style="text-align: center; font-weight: bold; margin: 8px 0 3px 0; font-size: 10pt;">Článek VII.<br>Závěrečná ustanovení</p>

  <ol style="margin: 5px 0 5px 20px; font-size: 9pt;">
    <li style="margin-bottom: 5px;">Tato smlouva nabývá platnosti a účinnosti dnem podpisu smluvních stran.</li>
    <li style="margin-bottom: 5px;">Smluvní strany se dohodly, že v náležitostech touto smlouvou přímo neupravených se jejich vzájemné vztahy budou řídit příslušnými ustanoveními občanského zákoníku.</li>
    <li style="margin-bottom: 5px;">Tato smlouva se vyhotovuje ve {{COPIES_COUNT}} stejnopisech s platností originálu, po {{COPIES_PER_PARTY}} výtisku pro každou ze smluvních stran.</li>
    <li style="margin-bottom: 5px;">Přílohou této smlouvy je Předávací protokol (Příloha č. 1).</li>
    <li style="margin-bottom: 5px;">Smluvní strany prohlašují, že před podpisem tuto smlouvu řádně projednaly a přečetly, že je sepsána podle jejich pravé a svobodné vůle.</li>
  </ol>

  <div style="margin: 30px 0 10px 0;">
    <p style="margin-bottom: 30px;">V {{SIGNING_PLACE}} dne {{SIGNING_DATE}}</p>
    
    <table style="width: 100%; margin-top: 40px; border-collapse: collapse;">
      <tr>
        <td style="width: 50%; text-align: center; vertical-align: top;">
          <div style="border-top: 1px solid #000; padding-top: 5px; margin: 0 10px;">
            <p style="margin: 0; font-size: 9pt;">{{LANDLORD_NAME}}</p>
            <p style="margin: 0; font-size: 9pt;">Pronajímatel</p>
          </div>
        </td>
        <td style="width: 50%; text-align: center; vertical-align: top;">
          <div style="border-top: 1px solid #000; padding-top: 5px; margin: 0 10px;">
            <p style="margin: 0; font-size: 9pt;">{{TENANT_NAME}}</p>
            <p style="margin: 0; font-size: 9pt;">Nájemce</p>
          </div>
        </td>
      </tr>
    </table>
  </div>

  {{SUBTENANT_SIGNATURE}}

</div>`,

  // Šablona pro sekci podnájemníka (HTML) - zjednodušená
  subtenantSection: `
  <table cellspacing="0" cellpadding="3" style="width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 9pt;">
    <tr>
      <td style="width: 20%; padding: 3px 5px; vertical-align: top;"><strong>Podnájemce:</strong></td>
      <td style="padding: 3px 5px;">{{SUBTENANT_NAME}}, narozen(a) {{SUBTENANT_BIRTH_NUMBER}}<br>
      {{SUBTENANT_ADDRESS}}<br>
      Tel.: {{SUBTENANT_PHONE}}, email: {{SUBTENANT_EMAIL}}</td>
    </tr>
  </table>
  `,

  subtenantSignature: `
  <div style="text-align: center; margin-top: 20px;">
    <div style="display: inline-block; border-top: 1px solid #000; padding-top: 5px; min-width: 200px;">
      <p style="margin: 0; font-size: 9pt;">{{SUBTENANT_NAME}}</p>
      <p style="margin: 0; font-size: 9pt;">Podnájemce</p>
    </div>
  </div>
  `,

  // Šablona předávacího protokolu (HTML)
  handoverProtocolTemplate: `
<div style="font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.5; color: #000;">
  
  <div style="text-align: center; font-size: 20pt; font-weight: bold; margin: 10px 0;">
    Předávací protokol
    <p style="text-align: center; font-size: 10pt; margin: 5px 0;">
      k nájemní smlouvě uzavřené dne {{SIGNING_DATE}}
    </p>
  </div>

  <table cellspacing="0" cellpadding="3" style="width: 100%; border: 2pt solid #000; border-collapse: collapse; margin: 10px 0; font-size: 9pt;">
    <tr>
      <td style="width: 20%; padding: 3px 5px;"><strong>Pronajímatel:</strong></td>
      <td style="padding: 3px 5px;">{{LANDLORD_NAME}}</td>
    </tr>
    <tr>
      <td style="padding: 3px 5px;"><strong>Nájemce:</strong></td>
      <td style="padding: 3px 5px;">{{TENANT_NAME}}</td>
    </tr>
    {{SUBTENANT_PROTOCOL_SECTION}}
    <tr>
      <td style="padding: 3px 5px;"><strong>Předmět nájmu:</strong></td>
      <td style="padding: 3px 5px;">{{ROOM_NAME}}, {{PROPERTY_ADDRESS}}</td>
    </tr>
  </table>

  <p style="font-weight: bold; margin: 10px 0 5px 0; font-size: 10pt;">I. STAV POKOJE PŘI PŘEDÁNÍ</p>
  <p style="margin: 0 0 10px 0; font-size: 9pt;">Pokoj je předáván v řádném stavu, čistý a funkční.</p>

  <p style="font-weight: bold; margin: 10px 0 5px 0; font-size: 10pt;">II. VYBAVENÍ POKOJE</p>
  <div style="margin: 0 0 10px 20px; font-size: 9pt;">{{ROOM_FEATURES}}</div>

  <p style="font-weight: bold; margin: 10px 0 5px 0; font-size: 10pt;">III. STAVY MĚŘIČŮ</p>
  <table style="width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 9pt;">
    <tr>
      <td style="padding: 3px 5px; border-bottom: 1px solid #ccc;">Elektřina (číslo měřiče: {{ELECTRICITY_METER}}):</td>
      <td style="padding: 3px 5px; border-bottom: 1px solid #ccc; width: 30%;">__________ {{ELECTRICITY_UNIT}}</td>
    </tr>
    <tr>
      <td style="padding: 3px 5px; border-bottom: 1px solid #ccc;">Studená voda (číslo měřiče: {{COLD_WATER_METER}}):</td>
      <td style="padding: 3px 5px; border-bottom: 1px solid #ccc; width: 30%;">__________ {{COLD_WATER_UNIT}}</td>
    </tr>
    <tr>
      <td style="padding: 3px 5px; border-bottom: 1px solid #ccc;">Teplá voda (číslo měřiče: {{HOT_WATER_METER}}):</td>
      <td style="padding: 3px 5px; border-bottom: 1px solid #ccc; width: 30%;">__________ {{HOT_WATER_UNIT}}</td>
    </tr>
    <tr>
      <td style="padding: 3px 5px; border-bottom: 1px solid #ccc;">Plyn (číslo měřiče: {{GAS_METER}}):</td>
      <td style="padding: 3px 5px; border-bottom: 1px solid #ccc; width: 30%;">__________ {{GAS_UNIT}}</td>
    </tr>
  </table>

  <p style="font-weight: bold; margin: 10px 0 5px 0; font-size: 10pt;">IV. PŘEDÁNÍ KLÍČŮ</p>
  <table style="width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 9pt;">
    <tr>
      <td style="padding: 3px 5px;">Počet předaných klíčů od pokoje:</td>
      <td style="padding: 3px 5px; width: 30%;">__________</td>
    </tr>
    <tr>
      <td style="padding: 3px 5px;">Počet předaných klíčů od vchodu:</td>
      <td style="padding: 3px 5px; width: 30%;">__________</td>
    </tr>
  </table>

  <p style="font-weight: bold; margin: 10px 0 5px 0; font-size: 10pt;">V. ZÁVĚRY</p>
  <p style="margin: 0 0 20px 0; font-size: 9pt;">Nájemce stvrzuje převzetí pokoje ve výše uvedeném stavu a zavazuje se jej v tomto stavu udržovat.</p>

  <div style="margin: 30px 0 10px 0;">
    <p style="margin-bottom: 30px;">V {{SIGNING_PLACE}} dne {{SIGNING_DATE}}</p>
    
    <table style="width: 100%; margin-top: 40px; border-collapse: collapse;">
      <tr>
        <td style="width: 50%; text-align: center; vertical-align: top;">
          <div style="border-top: 1px solid #000; padding-top: 5px; margin: 0 10px;">
            <p style="margin: 0; font-size: 9pt;">{{LANDLORD_NAME}}</p>
            <p style="margin: 0; font-size: 9pt;">Pronajímatel</p>
          </div>
        </td>
        <td style="width: 50%; text-align: center; vertical-align: top;">
          <div style="border-top: 1px solid #000; padding-top: 5px; margin: 0 10px;">
            <p style="margin: 0; font-size: 9pt;">{{TENANT_NAME}}</p>
            <p style="margin: 0; font-size: 9pt;">Nájemce</p>
          </div>
        </td>
      </tr>
    </table>
  </div>

  {{SUBTENANT_SIGNATURE}}

</div>`,

  subtenantProtocolSection: `<tr>
      <td style="padding: 3px 5px;"><strong>Podnájemce:</strong></td>
      <td style="padding: 3px 5px;">{{SUBTENANT_NAME}}</td>
    </tr>`
};
