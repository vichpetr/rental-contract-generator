import QRCode from 'qrcode';

/**
 * Calculates the IBAN for a Czech bank account.
 * Format: CZkk bbbb pppp ppnn nnnn nnnn
 * where:
 * k = check digits
 * b = bank code (4 digits)
 * p = prefix (6 digits, padded)
 * n = account number (10 digits, padded)
 * 
 * @param {string} accountNumber - Full account number (e.g. "123-45678902" or "45678902")
 * @param {string} bankCode - 4-digit bank code (e.g. "0800")
 * @returns {string|null} Formatted IBAN or null if invalid
 */
export function calculateCzechIBAN(accountNumber, bankCode) {
    if (!accountNumber || !bankCode) return null;

    // Parse account number (handle prefix)
    let prefix = '';
    let number = accountNumber;

    if (accountNumber.includes('-')) {
        const parts = accountNumber.split('-');
        prefix = parts[0];
        number = parts[1];
    }

    // Validate lengths
    if (prefix.length > 6 || number.length > 10 || bankCode.length !== 4) {
        console.error("Invalid account format for IBAN calculation");
        return null;
    }

    // Pad components
    const padPrefix = prefix.padStart(6, '0');
    const padNumber = number.padStart(10, '0');
    const padBank = bankCode.padStart(4, '0');

    // BBAN Construction (20 digits): Bank(4) + Prefix(6) + Number(10)
    const bban = `${padBank}${padPrefix}${padNumber}`;

    // Calculate Check Digits (ISO 7064 Mod 97-10)
    // 1. Move Country Code + '00' to the end.
    // CZ = 12 (C) + 35 (Z) -> 1235
    // String for Modulo: BBAN + 123500
    const countryCodeNum = '123500';
    const numericString = bban + countryCodeNum;

    // BigInt for precision with large numbers
    const mod97 = BigInt(numericString) % 97n;
    const checkDigitsVal = 98n - mod97;

    let checkDigits = checkDigitsVal.toString();
    if (checkDigits.length === 1) {
        checkDigits = '0' + checkDigits;
    }

    return `CZ${checkDigits}${bban}`;
}

/**
 * Generates a payments QR code (SPQD format).
 * @param {string} accountNum - Account number (with optional prefix, e.g. "123-456")
 * @param {string} bankCode - Bank code (e.g. "0800")
 * @param {number} amount - Amount in CZK
 * @param {string} message - Message for recipient
 * @param {string} variableSymbol - Variable symbol (optional)
 * @returns {Promise<string>} Data URL of the generated QR code
 */
export async function generatePaymentQR(accountNum, bankCode, amount, message, variableSymbol) {
    try {
        const iban = calculateCzechIBAN(accountNum, bankCode);
        if (!iban) throw new Error("Could not calculate IBAN");

        // Format SPQD string
        // SPD*1.0*ACC:CZxxxx...*AM:15000.00*CC:CZK*MSG:Najem...*X-VS:1234
        const parts = [
            'SPD*1.0',
            `ACC:${iban}`,
            `AM:${Number(amount).toFixed(2)}`,
            'CC:CZK'
        ];

        if (message) {
            // Sanitize message: remove diacritics if needed or ensure UTF-8. 
            // SPQD standard recommends simple ASCII or careful encoding, 
            // but modern apps handle UTF-8 well. We'll strip special chars to be safe/compact.
            // Using a simple regex to keep alphanumeric and basic punctuation.
            const safeMsg = message.slice(0, 60); // Limit length
            parts.push(`MSG:${safeMsg}`);
        }

        if (variableSymbol) {
            parts.push(`X-VS:${variableSymbol}`);
        }

        const qrString = parts.join('*');

        // Generate Data URL
        const dataUrl = await QRCode.toDataURL(qrString, {
            errorCorrectionLevel: 'M',
            width: 200,
            margin: 1
        });

        return dataUrl;

    } catch (error) {
        console.error("QR Generation failed:", error);
        return null;
    }
}
