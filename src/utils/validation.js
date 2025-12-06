/**
 * Validační funkce pro formulářová data
 */

/**
 * Validuje číslo dokladu - pouze povinnost vyplnění
 */
export function validateBirthNumber(birthNumber) {
    if (!birthNumber || !birthNumber.trim()) {
        return 'Číslo dokladu je povinné';
    }

    return null; // Validní
}

/**
 * Validuje email - volitelný, ale pokud je vyplněný, musí být validní
 */
export function validateEmail(email) {
    // Email je volitelný
    if (!email || !email.trim()) {
        return null;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return 'Neplatný formát emailu';
    }

    return null;
}

/**
 * Validuje telefonní číslo - volitelné
 */
export function validatePhone(phone) {
    // Telefon je volitelný
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

    // Telefon je volitelný
    if (person.phone) {
        const phoneError = validatePhone(person.phone);
        if (phoneError) errors.phone = phoneError;
    }

    // Email je volitelný, ale pokud je vyplněný, musí být validní
    if (person.email) {
        const emailError = validateEmail(person.email);
        if (emailError) errors.email = emailError;
    }

    return Object.keys(errors).length > 0 ? errors : null;
}

/**
 * Validuje jednotlivé pole osoby (pro live validaci)
 */
export function validatePersonField(person, field, isRequired = true) {
    const error = {};

    switch (field) {
        case 'firstName':
            if (isRequired || person.firstName) {
                const firstNameError = validateRequired(person.firstName, 'Jméno');
                if (firstNameError) error.firstName = firstNameError;
            }
            break;
        case 'lastName':
            if (isRequired || person.lastName) {
                const lastNameError = validateRequired(person.lastName, 'Příjmení');
                if (lastNameError) error.lastName = lastNameError;
            }
            break;
        case 'birthNumber':
            if (isRequired || person.birthNumber) {
                const birthNumberError = validateBirthNumber(person.birthNumber);
                if (birthNumberError) error.birthNumber = birthNumberError;
            }
            break;
        case 'address':
            if (isRequired || person.address) {
                const addressError = validateRequired(person.address, 'Adresa');
                if (addressError) error.address = addressError;
            }
            break;
        case 'phone':
            if (person.phone) {
                const phoneError = validatePhone(person.phone);
                if (phoneError) error.phone = phoneError;
            }
            break;
        case 'email':
            if (person.email) {
                const emailError = validateEmail(person.email);
                if (emailError) error.email = emailError;
            }
            break;
        default:
            break;
    }

    return error;
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
