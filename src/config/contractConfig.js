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

  // Šablona nájemní smlouvy
  contractTemplate: `SMLOUVA O PODNÁJMU POKOJE

uzavřená podle § 2235 a násl. občanského zákoníku

1. SMLUVNÍ STRANY

Pronajímatel:
Jméno: {{LANDLORD_NAME}}
Číslo dokladu: {{LANDLORD_BIRTH_NUMBER}}
Trvalé bydliště: {{LANDLORD_ADDRESS}}
Telefon: {{LANDLORD_PHONE}}
E-mail: {{LANDLORD_EMAIL}}

Nájemce:
Jméno: {{TENANT_NAME}}
Číslo dokladu: {{TENANT_BIRTH_NUMBER}}
Trvalé bydliště: {{TENANT_ADDRESS}}
Telefon: {{TENANT_PHONE}}
E-mail: {{TENANT_EMAIL}}

{{SUBTENANT_SECTION}}

2. PARAMETRY SMLOUVY

<table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%; font-size: 0.9em;">
<tr><td><strong>Adresa nemovitosti:</strong></td><td>{{PROPERTY_ADDRESS}}</td></tr>
<tr><td><strong>Doba nájmu na:</strong></td><td>Dobu určitou</td></tr>
<tr><td><strong>Datum začátku nájmu:</strong></td><td>{{DATE_FROM}}</td></tr>
<tr><td><strong>Datum konce nájmu:</strong></td><td>{{DATE_TO}}</td></tr>
<tr><td><strong>Celkem osob:</strong></td><td>{{OCCUPANTS_COUNT}}</td></tr>
<tr><td><strong>Výše čistého nájemného:</strong></td><td>{{MONTHLY_RENT}} Kč</td></tr>
<tr><td><strong>Číslo účtu pronajímatele:</strong></td><td>{{BANK_ACCOUNT}}</td></tr>
<tr><td><strong>Splatnost nájmu:</strong></td><td>{{RENT_DUE_DAY}}. den v daném měsíci</td></tr>
<tr><td><strong>Výše jistoty:</strong></td><td>{{SECURITY_DEPOSIT}} Kč</td></tr>
</table>

3. VÝPOČET ZÁLOH NA SLUŽBY

<table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%; font-size: 0.9em;">
<tr>
  <td>Plyn</td><td>{{SERVICE_GAS}} Kč</td>
  <td>Služby SVJ</td><td>{{SERVICE_BUILDING}} Kč</td>
  <td rowspan="2"><strong>CELKEM SLUŽBY:</strong></td><td rowspan="2"><strong>{{MONTHLY_FEES}} Kč</strong></td>
</tr>
<tr>
  <td>Elektřina</td><td>{{SERVICE_ELECTRICITY}} Kč</td>
  <td>Studená voda</td><td>{{SERVICE_WATER}} Kč</td>
</tr>
<tr>
  <td colspan="4"></td>
  <td><strong>ČISTÉ NÁJEMNÉ:</strong></td><td><strong>{{MONTHLY_RENT}} Kč</strong></td>
</tr>
<tr>
  <td colspan="4"></td>
  <td><strong>CELKEM:</strong></td><td><strong>{{TOTAL_MONTHLY}} Kč</strong></td>
</tr>
</table>

Úvod

1. První strana této smlouvy je členěna do částí oddělených očíslovanými nadpisy, které jsou v následujícím textu značeny jako „oddíly".

2. Tuto nájemní smlouvu uzavřeli dle vlastního prohlášení svéprávní účastníci (dále jen smluvní strany) uvedení na první straně této smlouvy v oddílu „1. SMLUVNÍ STRANY".

Článek I.
Předmět nájmu

1. Pronajímatel je dle výpisu z katastru nemovitostí vedeného příslušným katastrálním úřadem vlastníkem nemovitosti specifikované v položce „Adresa nemovitosti" (dále jen „nemovitost").

2. Pronajímatel přenechává nájemci nemovitost k zajištění svých bytových potřeb na dobu uvedenou v položce „Doba nájmu", a to od data viz položka „Datum začátku nájmu" do data viz položka „Datum konce nájmu". Pronajímatel souhlasí s tím, že v případě nájmu na dobu určitou a řádného plnění povinností nájemce se na žádost nájemce doba nájmu prodlouží automaticky. Dokladem o prodloužení je písemné potvrzení pronajímatele.

3. Smluvní strany výslovně prohlašují, že nemovitost je způsobilá k řádnému užívání (nastěhování a obývání), a že nic nebrání k plnění této smlouvy nastěhováním nájemce. Smluvní strany se dohodly, že o předání nemovitosti bude vyhotoven předávací protokol, který bude jako příloha č. 1 přiložen k této smlouvě.

Článek II.
Nájem a jeho užívání

1. Společné prostory: Nájemce může užívat společné prostory domu (tedy chodbičku, koupelnu, kuchyni, toaletu a předsíň), a to pouze ke sjednanému účelu, tj. k bydlení, a je povinen se o společné prostory starat. Pokud nájemce nezabezpečí řádný úklid společných prostor, bude tuto povinnost plnit pronajímatel ve smyslu odst. § 2257 občanského zákoníku, přičemž náklady s tím spojené ponese nájemce.

2. Nájemce nemá nárok na výlučné užívání koupelny či kuchyně. Je povinen se chovat ohleduplně k dalším obyvatelům a používat společné prostory tak, aby nerušil klid dalších obyvatel domu.

3. V nemovitosti je zakázáno držení domácích mazlíčků a kouření. Porušení zákazu je hrubým porušením povinností nájemce a vzniklé náklady na vrácení nemovitosti do původního stavu hradí nájemce.

4. Nájemce bere na vědomí, že v nemovitosti, resp. společných prostorách, bydlí mimo něj i další nájemci.

5. Pronajímatel má právo v případě nutnosti, resp. nebezpečí z prodlení vstoupit do nemovitosti bez souhlasu nájemce. Dále má právo za přiměřeného předchozího upozornění nájemce vstoupit do nemovitosti v doprovodu dalších osob (zejména kupujícího v případě prodeje nemovitosti, dodavatele služeb atd.).

6. Nájemce je povinen s pronajímatelem nebo jím zmocněnou osobou spolupracovat zejména při instalaci internetu či připojení energií (poskytnout potřebné informace pronajímateli typu datum narození či podpis smlouvy).

7. Veškeré potřebné smlouvy s dodavateli energií uzavře pronajímatel, přičemž náklady na dodávku energií a služeb je oprávněn přefakturovat úměrně nájemci (ve vztahu k počtu osob žijících v dané nemovitosti). Pokud nájemce svým zaviněním zmaří uzavření smlouvy či přihlášku odběrného místa k dodávce elektřiny, plynu, vody či jiných potřebných komodit k bydlení, je pronajímatel oprávněn nájem vypovědět bez výpovědní doby.

8. Nájemce je oprávněn ke konci nájmu navrhnout pronajímateli osoby (zájemce), u nichž má za to, že by byly vhodné pro nájemní vztah s pronajímatelem, pronajímatel však není povinen s takovými osobami nájem uzavřít. Pokud má pronajímatel zájem, provede s danými osobami jednání za účasti nájemce. Odmítne-li pronajímatel návrh nájemce, je nájemce povinen poskytnout k tomu potřebnou součinnost, zejména umožnit prohlídky se zájemci za účasti pronajímatele nebo jím zplnomocněné osoby. V opačném případě odpovídá za škodu, kterou tím pronajímateli způsobí.

9. Drobné opravy nemovitosti související s jejím užíváním a náklady spojené s běžnou údržbou (do 1000 Kč) hradí nájemce.

10. Změny na nemovitosti, včetně stavebních úprav, je nájemce oprávněn provádět jen s písemným souhlasem pronajímatele. Úhradu nákladů s tím spojených může nájemce požadovat jen v případě, že se k tomu pronajímatel písemně zavázal. Provede-li nájemce změny na nemovitosti bez souhlasu pronajímatele, je povinen po skončení nájmu uvést nemovitost na své náklady do původního stavu. V opačném případě odpovídá za škodu, kterou svým jednáním pronajímateli způsobil.

11. Nájemce je povinen písemně oznámit pronajímateli veškeré změny v počtu osob, které žijí s nájemcem v nemovitosti, a to do 15 dnů ode dne, kdy ke změně došlo.

12. Nájemce není oprávněn bez předchozího písemného souhlasu pronajímatele přenechat nemovitost ani její část do podnájmu třetí osobě.

13. Nájemce odpovídá za veškeré škody, které způsobí na nemovitost a společných prostorách on, osoby s ním bydlící či jeho návštěvy.

14. Nájemce je povinen odstranit závady a poškození, které způsobil na nemovitosti a společných prostorách sám nebo ti, kdo s ním bydlí. Nestane-li se tak, má pronajímatel právo po předchozím upozornění nájemce závady a poškození odstranit a požadovat od nájemce náhradu.

15. Porušuje-li nájemce své povinnosti vyplývající z nájmu nemovitosti, je pronajímatel oprávněn nájem vypovědět.

16. V případě, že nájemce svým zaviněním způsobí odpojení zařízení pro přívod energií dodavatelem energií (např. elektroměr či plynoměr), je povinen uhradit pronajímateli veškeré účelně vynaložené náklady na uvedení do původního stavu.

17. K datu skončení nájmu je nájemce povinen smluvní odběr všech dalších užívaných služeb (např. služby kabelové televize, internetu apod.) s příslušným dodavatelem v součinnosti s pronajímatelem ukončit, pokud se strany nedohodnou jinak (např. převod na nového nájemce), jinak je oprávněn tak učinit pronajímatel, k čemuž ho nájemce touto smlouvou výslovně zmocňuje.

18. V případě vytápění pomocí plynového kotle umístěného v nemovitosti je pronajímatel po dohodě s nájemci zajistit revizi tohoto zařízení, jakožto i příslušné spalinové cesty (komína). Revizi plynového kotle i spalinových cest hradí pronajímatel. Protokol o revizi je k nahlédnutí po domluvě.

19. Nájemce se zavazuje uzavřít na nemovitost pojištění domácnosti s pojištěním své odpovědnosti související s užíváním nemovitosti.

20. Nájemce se zavazuje informovat (např. na domovních vývěskách) o plánovaných údržbářských prací (výměna vodoměrů, plynoměrů apod.), přičemž je povinen poskytnout součinnost pro tyto úkony. Nájemce je povinen o případné součinnosti (zpřístupnění nemovitosti) komunikovat přímo s osobou odpovědnou v dané nemovitosti.

Článek III.
Nájemné a placení

1. Nájemce se zavazuje platit pronajímateli za pronájem nemovitosti nájemné ve výši stanovené v položce „Výše čistého nájemného" (dále jen „nájemné").

2. Splatnost nájemného: Nájemné je splatné k datu uvedenému v položce „Splatnost nájmu" daného měsíce, a to předem.

3. Způsob placení nájemného: Platby se uskutečňují převodem na bankovní účet uvedený v položce „Číslo účtu pronajímatele".

4. Kromě nájemného se nájemce zavazuje hradit zálohy na služby spojené s užíváním nemovitosti. Částka záloh na služby je uvedena v oddílu „3. VÝPOČET ZÁLOH NA SLUŽBY". Tato částka je splatná společně s nájemným, tj. k datu uvedenému v položce „Splatnost nájmu".

5. Vyúčtování: Nejpozději do 4 měsíců po skončení roku pronajímatel provede vyúčtování záloh složených nájemcem za předchozí rok, přičemž nájemce má právo do vyúčtování nahlédnout a činit ohledně něho připomínky. Přeplatek vrátí pronajímatel nájemci do 30 dnů od vyúčtování, nedoplatek je nájemce povinen uhradit na účet pronajímatele ve lhůtě 14 dní od doručení vyúčtování.

6. Zaplacením nájemného a záloh na služby se rozumí připsání platby na účet pronajímatele.

7. V případě opožděného placení je pronajímatel oprávněn požadovat od nájemce úrok z prodlení dle občanského zákoníku.

Článek IV.
Práva a povinnosti stran

1. Nájemce je povinen užívat nemovitost řádně a v souladu s povahou nemovitosti a zacházet s nemovitostí šetrným způsobem.

2. Nájemce je povinen dodržovat domovní řád a ustanovení občanského zákoníku týkající se nájmu nemovitosti.

3. Nájemce je povinen oznámit pronajímateli bez zbytečného odkladu potřebu provedení oprav, které je povinen provést pronajímatel, jinak odpovídá za škodu, která tím vznikne.

4. Po celou dobu trvání nájmu dle této smlouvy je nájemce povinen udržovat nemovitost včetně vybavení ve stavu odpovídajícímu řádnému užívání.

5. Úhrada provozních nákladů (energie apod.) se řídí odstavcem Článku III. této smlouvy. Jistina složená nájemcem nemůže být použita na úhradu nájemného či jiných nákladů spojených s užíváním nemovitosti.

6. V případě prodlení s úhradou nájemného delším než 14 dnů je pronajímatel oprávněn nájem vypovědět bez výpovědní lhůty.

7. Pokud bude nájemce v prodlení s úhradou nájemného, nedisponuje nájemce řádně plněnou smlouvou ve smyslu Článku I. odstavce 2. této smlouvy a nemá nárok na prodloužení nájmu.

Článek V.
Skončení nájmu

1. Nájem nemovitosti na základě této smlouvy je sjednán na dobu uvedenou v položce „Doba nájmu". V případě nájmu na dobu určitou nájem skončí uplynutím této doby.

2. Nájem zanikne písemnou dohodou mezi pronajímatelem a nájemcem. Výpověď je možné poslat emailem.

3. Nájemce je oprávněn nájem vypovědět.

4. Pro případ výpovědi, ať již ze strany pronajímatele či nájemce, se sjednává {{NOTICE_PERIOD}}-měsíční výpovědní doba, jejíž běh počíná prvého dne měsíce následujícího po měsíci, ve kterém byla výpověď doručena. Pronajímatel má právo vypovědět nájem bez výpovědní lhůty a požadovat, aby mu nájemce nemovitost odevzdal bez zbytečného odkladu, v případě, že nájemce poruší svou povinnost zvlášť závažným způsobem, a dále v případě, kdy tak stanoví občanský zákoník.

5. V případě skončení nájmu je nájemce povinen pronajatý pokoj uklidit a vyklidit, odstranit závady a předat ji pronajímateli. Při prodlení se splněním této povinnosti dává nájemce pronajímateli výslovný souhlas k tomu, aby pokoj otevřel, nechal vyklidit, případně věci v ní nalezené uskladnil, to vše na náklady nájemce. V případě porušení této povinnosti je nájemce povinen uhradit pronajímateli smluvní pokutu dle § 2254 občanského zákoníku až ve výši 5000 Kč a účelně vynaložené náklady na uvedení do původního stavu.

Článek VI.
Doručování

1. Nájemce je povinen doručovat pronajímateli písemnosti na adresu uvedenou v záhlaví této smlouvy.

2. Pronajímatel je povinen doručovat nájemci písemnosti na adresu budovy, nebo na adresu bydliště uvedenou v záhlaví této smlouvy.

Článek VII.
Závěrečná ustanovení

1. Tato smlouva nabývá platnosti a účinnosti dnem podpisu smluvních stran.

2. Smluvní strany se dohodly, že v náležitostech touto smlouvou přímo neupravených se jejich vzájemné vztahy budou řídit příslušnými ustanoveními občanského zákoníku a předpisů souvisejících.

3. Tato smlouva se vyhotovuje ve {{COPIES_COUNT}} stejnopisech s platností originálu, po {{COPIES_PER_PARTY}} výtisku pro každou ze smluvních stran.

4. Smluvní strany se dohodly, že obsah této smlouvy lze měnit nebo doplňovat pouze na základě písemných vzájemně odsouhlasených vzestupně číslovaných dodatků. Pronajímatel je oprávněn jednostranným prohlášením prodloužit dobu trvání nájemní smlouvy.

5. Nájemce svým podpisem dále stvrzuje, že spolu s touto smlouvou převzal i kompletní energetický průkaz budovy, v níž se nemovitost nachází.

6. Přílohou této smlouvy je Předávací protokol (Příloha č. 1).

7. Smluvní strany prohlašují, že před podpisem tuto smlouvu řádně projednaly a přečetly, že je sepsána podle jejich pravé a svobodné vůle, určitě, vážně a srozumitelně, nikoli pod nátlakem, v tísni nebo za nápadně nevýhodných podmínek a na důkaz toho připojují svoje vlastnoruční podpisy.

V {{SIGNING_PLACE}} dne {{SIGNING_DATE}}


___________________________          ___________________________
Podpis pronajímatele                 Podpis nájemce

{{SUBTENANT_SIGNATURE}}`,

  // Šablona pro sekci podnájemníka
  subtenantSection: `
Podnájemce:
Jméno: {{SUBTENANT_NAME}}
Číslo dokladu: {{SUBTENANT_BIRTH_NUMBER}}
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
