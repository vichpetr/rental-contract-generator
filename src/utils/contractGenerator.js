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
/**
 * Připraví data pro vyplnění šablony smlouvy
 */
export function formatContractData(formData, config, qrCodeDataUrl) {
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
    // Výpočty
    // 1. Calculate services sum (per person)
    const services = config.servicesBreakdown || { gas: 0, electricity: 0, coldWater: 0, buildingServices: 0 };
    const serviceSumPerPerson = (services.gas || 0) + (services.electricity || 0) + (services.coldWater || 0) + (services.buildingServices || 0);

    // 2. Total Fee = Service Sum * Occupants
    // Fallback: If serviceSum is 0, usage roomVariant.feePerPerson (legacy support)
    const totalFee = serviceSumPerPerson > 0
        ? serviceSumPerPerson * numberOfOccupants
        : (roomVariant.feePerPerson * numberOfOccupants);

    const totalMonthly = roomVariant.monthlyRent + totalFee;

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
        TENANT_BIRTH_DATE: formatDate(tenant.dateOfBirth),
        TENANT_ADDRESS: tenant.address,
        TENANT_PHONE: tenant.phone,
        TENANT_EMAIL: tenant.email,

        // Pokoj
        ROOM_NAME: roomVariant.name,
        ROOM_AREA: roomVariant.area,
        PROPERTY_ADDRESS: `${config.property.street}, ${config.property.zip} ${config.property.city}`,

        // Extended Property Details (Parametry Smlouvy)
        UNIT_NUMBER: config.propertyDetails?.unitNumber || '',
        FLOOR: config.propertyDetails?.floor || '',
        LAYOUT: config.propertyDetails?.layout || '',

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
        SECURITY_DEPOSIT: (roomVariant.deposit && roomVariant.deposit > 0
            ? roomVariant.deposit
            : config.securityDeposit.amount).toLocaleString('cs-CZ'),
        RENT_DUE_DAY: config.rentDueDay,

        // QR Platba
        QR_PAYMENT: qrCodeDataUrl
            ? `<img src="${qrCodeDataUrl}" alt="QR Platba" style="width: 150px; height: 150px; border: 1px solid #ddd; padding: 5px;">`
            : '',

        // Rozpad služeb - display calculated totals (per person * occupants)
        SERVICE_GAS: ((services.gas || 0) * numberOfOccupants).toLocaleString('cs-CZ'),
        SERVICE_ELECTRICITY: ((services.electricity || 0) * numberOfOccupants).toLocaleString('cs-CZ'),
        SERVICE_WATER: ((services.coldWater || 0) * numberOfOccupants).toLocaleString('cs-CZ'),
        SERVICE_BUILDING: ((services.buildingServices || 0) * numberOfOccupants).toLocaleString('cs-CZ'),

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
            SUBTENANT_BIRTH_DATE: formatDate(subtenant.dateOfBirth),
            SUBTENANT_ADDRESS: subtenant.address,
            SUBTENANT_CONTACT: [
                subtenant.phone ? `Tel.: ${subtenant.phone}` : '',
                subtenant.email ? `e-mail: ${subtenant.email}` : ''
            ].filter(Boolean).join(', '),
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
    const contractData = formatContractData(formData, config); // Pass undefined for QR, not needed in protocol yet? Or maybe passing it is safe.
    // ... existing ... but wait, formatHandoverProtocolData depends on formatContractData. 
    // I should probably update formatHandoverProtocolData generic usage too, but it doesn't use QR.
    // However, I need to update generateContractText to pass the argument.
    // Let's finish the replacement of formatContractData first.
    // Wait, create separate tools calls for separate functions if needed.
    // This replacement covers formatContractData fully.

    const roomVariant = config.roomVariants.find(r => r.id === formData.roomVariantId);

    // Configurable Sections
    let sections = [];
    let sectionIndex = 2; // Start from II. (I. is fixed "STAV POKOJE")

    // 1. Flat Equipment (Vybavení bytu)
    // Check if property has equipment defined in config (it might be in property object or separate)
    // User asked to add "flat equipment", checking config.flatEquipment (mapped from settings.equipment)
    const flatEquipment = config.flatEquipment || config.property.equipment || [];
    let flatEquipmentHtml = '';
    if (flatEquipment && flatEquipment.length > 0) {
        flatEquipmentHtml = `
            <div style="page-break-inside: avoid;">
                <p style="font-weight: bold; margin: 10px 0 5px 0; font-size: 10pt;">${romanize(sectionIndex)}. VYBAVENÍ BYTU</p>
                <ul style="margin: 0 0 10px 20px; font-size: 9pt; padding-left: 1rem;">
                    ${flatEquipment.map(f => `<li>${f}</li>`).join('')}
                </ul>
            </div>`;
        sectionIndex++;
    }

    // 2. Room Equipment (Vybavení pokoje)
    let roomEquipmentHtml = '';
    if (roomVariant.features && roomVariant.features.length > 0) {
        roomEquipmentHtml = `
            <div style="page-break-inside: avoid;">
                <p style="font-weight: bold; margin: 10px 0 5px 0; font-size: 10pt;">${romanize(sectionIndex)}. VYBAVENÍ POKOJE</p>
                <div style="margin: 0 0 10px 20px; font-size: 9pt;">
                    ${roomVariant.features.map((f, i) => `${i + 1}. ${f}`).join('<br>')}
                </div>
            </div>`;
        sectionIndex++;
    }

    // 3. Meters (Stavy měřičů)
    // Ensure we prioritize valid meters list. roomVariant.meter_readings might be empty object if legacy.
    let unitMeters = config.meterReadings || [];
    if (roomVariant.meter_readings && Object.keys(roomVariant.meter_readings).length > 0) {
        // Only override if really has keys. 
        // NOTE: If roomVariant.meter_readings is array (legacy array?) or object.
        if (Array.isArray(roomVariant.meter_readings)) {
            if (roomVariant.meter_readings.length > 0) unitMeters = roomVariant.meter_readings;
        } else {
            unitMeters = roomVariant.meter_readings;
        }
    }
    let metersHtml = '';

    // Helper to extract meters list
    const getMetersList = (metersSource) => {
        if (!metersSource) return [];

        // If it's already the new array format
        if (Array.isArray(metersSource)) {
            // Map types to user-friendly labels if missing
            const LABEL_MAP = {
                'electricity': 'Elektřina',
                'gas': 'Plyn',
                'water_cold': 'Studená voda',
                'water_hot': 'Teplá voda',
                'water': 'Voda',
                'heat': 'Teplo'
            };

            return metersSource.map(m => {
                const baseLabel = LABEL_MAP[m.type] || m.type;
                const finalLabel = m.description ? `${baseLabel} (${m.description})` : baseLabel;
                return {
                    ...m,
                    label: m.label || finalLabel
                };
            });
        }

        // Old Object Format Fallback
        let list = [];
        if (metersSource.electricity) list.push({ label: 'Elektřina', ...metersSource.electricity });
        if (metersSource.gas) list.push({ label: 'Plyn', ...metersSource.gas });
        if (metersSource.water) {
            if (metersSource.water.cold) list.push({ label: 'Studená voda', ...metersSource.water.cold });
            if (metersSource.water.hot) list.push({ label: 'Teplá voda', ...metersSource.water.hot });
            if (metersSource.water.meterNumber) list.push({ label: 'Voda', ...metersSource.water });
        }
        return list;
    };

    const activeMeters = getMetersList(unitMeters);

    if (activeMeters.length > 0) {
        const rows = activeMeters.map(m => `
            <tr>
                <td style="padding: 3px 5px; border-bottom: 1px solid #ccc;">${m.label} (č. měřiče: ${m.meterNumber || m.meter_number || ''}):</td>
                <td style="padding: 3px 5px; border-bottom: 1px solid #ccc; width: 30%;">__________ ${m.unit || ''}</td>
            </tr>
        `).join('');

        metersHtml = `
            <div style="page-break-inside: avoid;">
                <p style="font-weight: bold; margin: 10px 0 5px 0; font-size: 10pt;">${romanize(sectionIndex)}. STAVY MĚŘIČŮ</p>
                <table style="width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 9pt;">
                    ${rows}
                </table>
            </div>`;
        sectionIndex++;
    }

    // 4. Keys (Predani klicu) -> Update the number for this section in template?
    // Actually template has fixed "IV. PŘEDÁNÍ KLÍČŮ" and "V. ZÁVĚRY"
    // To make it fully dynamic, we should probably replacing the whole body or just these sections.
    // For now, let's keep it simple: formatting logic replaces specific placeholders.
    // If the user wants fully dynamic numbering for all sections, I'd need to replace the static "IV" and "V" in template too.
    // Let's assume for now 2&3 are dynamic, and 4&5 are fixed or we update them too using replace.
    // To do that clean, I'll update the config template to use {{KEYS_SECTION_TITLE}} and {{CONCLUSION_SECTION_TITLE}}.

    // Wait, I can't easily change the template static text from here without changing config.js again.
    // But I can do a hack: pass "IV." and "V." as variables if I change config.js.
    // Or I can just replace the hardcoded "IV." and "V." in the result string if I don't want to touch config.
    // Better: Update Config to use placeholders for section numbers or Titles.

    return {
        ...contractData,
        FLAT_EQUIPMENT_SECTION: flatEquipmentHtml,
        ROOM_EQUIPMENT_SECTION: roomEquipmentHtml,
        METER_READINGS_SECTION: metersHtml,
        KEYS_SECTION_NUMBER: romanize(sectionIndex),
        CONCLUSION_SECTION_NUMBER: romanize(sectionIndex + 1)
    };
}

function romanize(num) {
    if (isNaN(num)) return NaN;
    var digits = String(+num).split(""),
        key = ["", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM",
            "", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC",
            "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"],
        roman = "",
        i = 3;
    while (i--)
        roman = (key[+digits.pop() + (i * 10)] || "") + roman;
    return Array(+digits.join("") + 1).join("M") + roman; // basic support
}

/**
 * Vygeneruje text smlouvy
 */
export function generateContractText(formData, config, qrCodeDataUrl) {
    const data = formatContractData(formData, config, qrCodeDataUrl);
    return fillTemplate(config.contractTemplate, data);
}

/**
 * Vygeneruje text předávacího protokolu
 */
export function generateHandoverProtocolText(formData, config) {
    const data = formatHandoverProtocolData(formData, config);
    return fillTemplate(config.handoverProtocolTemplate, data);
}
