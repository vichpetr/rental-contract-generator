import { format } from 'date-fns';
import { cs } from 'date-fns/locale';


/**
 * Nahradí placeholdery v šabloně skutečnými daty
 */
export function fillTemplate(template, data) {
    let result = template;

    Object.entries(data).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        result = result.replace(new RegExp(placeholder, 'g'), value || '');
    });

    return result;
}

/**
 * Vypočítá celkové měsíční poplatky za služby
 */
export function calculateTotalFee(roomVariant, numberOfOccupants) {
    return roomVariant.feePerPerson * numberOfOccupants;
}

/**
 * Vypočítá celkovou měsíční platbu (nájem + poplatky)
 */
export function calculateTotalMonthly(roomVariant, numberOfOccupants) {
    const fees = calculateTotalFee(roomVariant, numberOfOccupants);
    return roomVariant.monthlyRent + fees;
}

/**
 * Formátuje adresu do jednoho řetězce
 */
export function formatAddress(address) {
    return `${address.street}, ${address.postalCode} ${address.city}`;
}

/**
 * Formátuje bankovní účet
 */
export function formatBankAccount(account) {
    return `${account.accountNumber}/${account.bankCode}`;
}

/**
 * Formátuje datum do českého formátu
 */
export function formatDate(date) {
    if (!date) return '';
    return format(new Date(date), 'd. MMMM yyyy', { locale: cs });
}

/**
 * Vrátí slovo "osobu" nebo "osoby" podle počtu
 */
export function getPersonWord(count) {
    if (count === 1) return 'osobu';
    if (count >= 2 && count <= 4) return 'osoby';
    return 'osob';
}


/**
 * Připraví data pro vyplnění šablony smlouvy
 */
export function formatContractData(formData, config) {
    const { tenant, subtenant, roomVariantId, dateFrom, dateTo, signingDate, hasSubtenant } = formData;

    // Ensure config is provided
    if (!config) {
        throw new Error('Konfigurace smlouvy nebyla načtena');
    }

    // Najdi variantu pokoje
    const roomVariant = config.roomVariants.find(r => r.id === roomVariantId);
    if (!roomVariant) {
        throw new Error('Nenalezena varianta pokoje');
    }

    // Počet osob - použij hasSubtenant z formData
    const numberOfOccupants = hasSubtenant ? 2 : 1;

    // Výpočty
    const totalFee = calculateTotalFee(roomVariant, numberOfOccupants);
    const totalMonthly = calculateTotalMonthly(roomVariant, numberOfOccupants);

    // Počet kopií smlouvy
    const copiesCount = hasSubtenant ? 3 : 2;
    const copiesPerParty = hasSubtenant ? '1' : '1';

    // Základní data
    const templateData = {
        // Pronajímatel
        LANDLORD_NAME: config.landlord.name,
        LANDLORD_BIRTH_NUMBER: config.landlord.birthNumber,
        LANDLORD_ADDRESS: formatAddress(config.landlord.address),
        LANDLORD_PHONE: config.landlord.contact.phone,
        LANDLORD_EMAIL: config.landlord.contact.email,

        // Nájemce
        TENANT_NAME: `${tenant.firstName} ${tenant.lastName}`,
        TENANT_BIRTH_NUMBER: tenant.birthNumber,
        TENANT_ADDRESS: tenant.address,
        TENANT_PHONE: tenant.phone,
        TENANT_EMAIL: tenant.email,

        // Pokoj
        ROOM_NAME: roomVariant.name,
        ROOM_AREA: roomVariant.area,
        PROPERTY_ADDRESS: `${config.property.street}, ${config.property.specificLocation}, ${config.property.postalCode} ${config.property.city}`,

        // Období
        DATE_FROM: formatDate(dateFrom),
        DATE_TO: formatDate(dateTo),

        // Finanční údaje
        MONTHLY_RENT: roomVariant.monthlyRent.toLocaleString('cs-CZ'),
        MONTHLY_FEES: totalFee.toLocaleString('cs-CZ'),
        TOTAL_MONTHLY: totalMonthly.toLocaleString('cs-CZ'),
        OCCUPANTS_COUNT: numberOfOccupants,
        PERSON_WORD: getPersonWord(numberOfOccupants),
        BANK_ACCOUNT: formatBankAccount(config.landlord.bankAccount),
        SECURITY_DEPOSIT: config.securityDeposit.amount.toLocaleString('cs-CZ'),
        RENT_DUE_DAY: config.rentDueDay,

        // Rozpad služeb
        SERVICE_GAS: config.servicesBreakdown.gas.toLocaleString('cs-CZ'),
        SERVICE_ELECTRICITY: config.servicesBreakdown.electricity.toLocaleString('cs-CZ'),
        SERVICE_WATER: config.servicesBreakdown.coldWater.toLocaleString('cs-CZ'),
        SERVICE_BUILDING: config.servicesBreakdown.buildingServices.toLocaleString('cs-CZ'),

        // Ostatní
        NOTICE_PERIOD: config.noticePeriodMonths,

        // Podpis
        SIGNING_PLACE: config.property.city,
        SIGNING_DATE: formatDate(signingDate || new Date()),

        // Počty kopií
        COPIES_COUNT: copiesCount,
        COPIES_PER_PARTY: copiesPerParty,
    };

    // Přidej sekci pro podnájemníka, pouze pokud má user zaškrtnutý checkbox
    if (hasSubtenant && subtenant) {
        const subtenantData = {
            SUBTENANT_NAME: `${subtenant.firstName} ${subtenant.lastName}`,
            SUBTENANT_BIRTH_NUMBER: subtenant.birthNumber,
            SUBTENANT_ADDRESS: subtenant.address,
            SUBTENANT_PHONE: subtenant.phone,
            SUBTENANT_EMAIL: subtenant.email,
        };

        templateData.SUBTENANT_SECTION = fillTemplate(config.subtenantSection, subtenantData);
        templateData.SUBTENANT_SIGNATURE = fillTemplate(config.subtenantSignature, subtenantData);
        templateData.SUBTENANT_PROTOCOL_SECTION = fillTemplate(
            config.subtenantProtocolSection,
            subtenantData
        );
    } else {
        // Pokud není podnájemce, vynech tyto sekce úplně
        templateData.SUBTENANT_SECTION = '';
        templateData.SUBTENANT_SIGNATURE = '';
        templateData.SUBTENANT_PROTOCOL_SECTION = '';
    }

    return templateData;
}

/**
 * Připraví data pro předávací protokol
 */
export function formatHandoverProtocolData(formData, config) {
    const contractData = formatContractData(formData, config);
    const roomVariant = config.roomVariants.find(r => r.id === formData.roomVariantId);

    // Using specific unit meter readings from DB if available, else falling back to global config structure
    // Since useContractData maps unit[0] to global config.meterReadings, we use that as per current structure.
    // Ideally we would check roomVariant.meter_readings if the DB structure was fully adapted here.
    // But config.meterReadings is what the hook provides.
    const meters = roomVariant.meter_readings || config.meterReadings;

    return {
        ...contractData,
        ROOM_FEATURES: roomVariant.features.map((f, i) => `${i + 1}. ${f}`).join('\n'),
        ELECTRICITY_METER: meters.electricity.meterNumber,
        ELECTRICITY_UNIT: meters.electricity.unit,
        COLD_WATER_METER: meters.water.cold.meterNumber,
        COLD_WATER_UNIT: meters.water.cold.unit,
        HOT_WATER_METER: meters.water.hot.meterNumber,
        HOT_WATER_UNIT: meters.water.hot.unit,
        GAS_METER: meters.gas.meterNumber,
        GAS_UNIT: meters.gas.unit,
    };
}

/**
 * Vygeneruje text smlouvy
 */
export function generateContractText(formData, config) {
    const data = formatContractData(formData, config);
    return fillTemplate(config.contractTemplate, data);
}

/**
 * Vygeneruje text předávacího protokolu
 */
export function generateHandoverProtocolText(formData, config) {
    const data = formatHandoverProtocolData(formData, config);
    return fillTemplate(config.handoverProtocolTemplate, data);
}
