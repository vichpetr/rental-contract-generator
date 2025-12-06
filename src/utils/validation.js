/**
 * Validační funkce pro formulářová data
 */

/**
 * Validuje číslo dokladu (rodné číslo nebo číslo pasu)
 * Formát rodného čísla: RRMMDD/XXXX (před 1954) nebo RRMMDD/XXX (po 1954)
 * Formát pasu: alfanumerický kód (např. AB123456)
 */
export function validateBirthNumber(birthNumber) {
    if (!birthNumber) {
        return 'Číslo dokladu je povinné';
    }

    const trimmed = birthNumber.trim();

    // Kontrola minimální délky
    if (trimmed.length < 6) {
        return 'Číslo dokladu je příliš krátké';
    }

    // Odstranění mezer a lomítka pro kontrolu rodného čísla
    const cleaned = birthNumber.replace(/\s/g, '').replace('/', '');

    // Pokud obsahuje pouze číslice, validujeme jako rodné číslo
    if (/^\d+$/.test(cleaned)) {
        // Kontrola délky pro rodné číslo
        if (cleaned.length !== 9 && cleaned.length !== 10) {
            return 'Rodné číslo musí mít 9 nebo 10 číslic (formát: RRMMDD/XXXX)';
        }

        // Pro rodná čísla s 10 číslicemi kontrola dělitelnosti 11
        if (cleaned.length === 10) {
            const num = parseInt(cleaned, 10);
            if (num % 11 !== 0) {
                return 'Rodné číslo není platné (neplatný kontrolní součet)';
            }
        }
    } else {
        // Pro čísla pasů - kontrola alfanumerického formátu
        if (!/^[A-Z0-9]+$/i.test(cleaned)) {
            return 'Číslo pasu může obsahovat pouze písmena a číslice';
        }

        if (cleaned.length > 20) {
            return 'Číslo dokladu je příliš dlouhé';
        }
    }

    return null; // Validní
}

/**
 * Validuje email
 */
export function validateEmail(email) {
    if (!email) {
        return 'Email je povinný';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return 'Neplatný formát emailu';
    }

    return null;
}

/**
 * Validuje telefonní číslo
 */
export function validatePhone(phone) {
    if (!phone) {
        return 'Telefon je povinný';
    }

    // Odstranění mezer a speciálních znaků
    const cleaned = phone.replace(/\s/g, '').replace(/[+()-]/g, '');

    if (cleaned.length < 9) {
        return 'Telefonní číslo je příliš krátké';
    }

    if (!/^\d+$/.test(cleaned)) {
        return 'Telefonní číslo může obsahovat pouze číslice a speciální znaky (+, -, (, ))';
    }

    return null;
}

/**
 * Validuje, že datum není prázdné
 */
export function validateDate(date, fieldName = 'Datum') {
    if (!date) {
        return `${fieldName} je povinné`;
    }
    return null;
}

/**
 * Validuje, že datum "od" je před datem "do"
 */
export function validateDateRange(dateFrom, dateTo) {
    if (!dateFrom || !dateTo) {
        return null; // Nechá validaci jednotlivých polí
    }

    const from = new Date(dateFrom);
    const to = new Date(dateTo);

    if (from >= to) {
        return 'Datum začátku musí být před datem konce nájmu';
    }

    return null;
}

/**
 * Validuje povinné textové pole
 */
export function validateRequired(value, fieldName = 'Pole') {
    if (!value || value.trim() === '') {
        return `${fieldName} je povinné`;
    }
    return null;
}

/**
 * Validuje osobní údaje
 */
export function validatePerson(person, isRequired = true) {
    const errors = {};

    if (isRequired || person.firstName) {
        const firstNameError = validateRequired(person.firstName, 'Jméno');
        if (firstNameError) errors.firstName = firstNameError;
    }

    if (isRequired || person.lastName) {
        const lastNameError = validateRequired(person.lastName, 'Příjmení');
        if (lastNameError) errors.lastName = lastNameError;
    }

    if (isRequired || person.birthNumber) {
        const birthNumberError = validateBirthNumber(person.birthNumber);
        if (birthNumberError) errors.birthNumber = birthNumberError;
    }

    if (isRequired || person.address) {
        const addressError = validateRequired(person.address, 'Adresa');
        if (addressError) errors.address = addressError;
    }

    if (isRequired || person.phone) {
        const phoneError = validatePhone(person.phone);
        if (phoneError) errors.phone = phoneError;
    }

    if (isRequired || person.email) {
        const emailError = validateEmail(person.email);
        if (emailError) errors.email = emailError;
    }

    return Object.keys(errors).length > 0 ? errors : null;
}

/**
 * Validuje celý formulář
 */
export function validateForm(formData, roomVariants) {
    const errors = {};

    // Validace výběru pokoje
    if (!formData.roomVariantId) {
        errors.roomVariantId = 'Musíte vybrat variantu pokoje';
    }

    // Validace nájemce
    const tenantErrors = validatePerson(formData.tenant, true);
    if (tenantErrors) {
        errors.tenant = tenantErrors;
    }

    // Validace podnájemníka (pokud je vyplněný nebo pokud je pokoj pro 2 osoby a je označený)
    const roomVariant = roomVariants.find(r => r.id === formData.roomVariantId);
    const shouldHaveSubtenant = formData.hasSubtenant && roomVariant?.maxOccupants === 2;

    if (shouldHaveSubtenant) {
        const subtenantErrors = validatePerson(formData.subtenant, true);
        if (subtenantErrors) {
            errors.subtenant = subtenantErrors;
        }
    }

    // Validace dat
    const dateFromError = validateDate(formData.dateFrom, 'Datum začátku');
    if (dateFromError) errors.dateFrom = dateFromError;

    const dateToError = validateDate(formData.dateTo, 'Datum konce');
    if (dateToError) errors.dateTo = dateToError;

    const dateRangeError = validateDateRange(formData.dateFrom, formData.dateTo);
    if (dateRangeError) errors.dateRange = dateRangeError;

    // Datum podpisu není povinné

    return Object.keys(errors).length > 0 ? errors : null;
}

/**
 * Validuje konkrétní krok formuláře
 */
export function validateStep(step, formData, roomVariants) {
    const errors = {};

    switch (step) {
        case 0: // Výběr pokoje
            if (!formData.roomVariantId) {
                errors.roomVariantId = 'Musíte vybrat variantu pokoje';
            }
            break;

        case 1: // Údaje nájemce
            const tenantErrors = validatePerson(formData.tenant, true);
            if (tenantErrors) {
                Object.assign(errors, tenantErrors);
            }
            break;

        case 2: // Údaje podnájemníka (pokud je vyžadován)
            const roomVariant = roomVariants.find(r => r.id === formData.roomVariantId);
            if (formData.hasSubtenant && roomVariant?.maxOccupants === 2) {
                const subtenantErrors = validatePerson(formData.subtenant, true);
                if (subtenantErrors) {
                    Object.assign(errors, subtenantErrors);
                }
            }
            break;

        case 3: // Období a datum podpisu
            const dateFromError = validateDate(formData.dateFrom, 'Datum začátku');
            if (dateFromError) errors.dateFrom = dateFromError;

            const dateToError = validateDate(formData.dateTo, 'Datum konce');
            if (dateToError) errors.dateTo = dateToError;

            const dateRangeError = validateDateRange(formData.dateFrom, formData.dateTo);
            if (dateRangeError) errors.dateRange = dateRangeError;
            break;

        default:
            break;
    }

    return Object.keys(errors).length > 0 ? errors : null;
}
