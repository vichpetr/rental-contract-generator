import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { generateContractText, generateHandoverProtocolText } from './contractGenerator';

// Registrace fontů
pdfMake.vfs = pdfFonts.pdfMake.vfs;

/**
 * Převede text s odřádkováním na pole paragrafů pro pdfmake
 */
function textToParagraphs(text) {
    return text.split('\n').map(line => {
        if (line.trim() === '') {
            return { text: ' ', margin: [0, 2] };
        }

        // Detekce nadpisů (VELKÁ PÍSMENA)
        if (line === line.toUpperCase() && line.trim().length > 0 && !line.includes(':')) {
            return {
                text: line,
                style: 'header',
                margin: [0, 10, 0, 5]
            };
        }

        // Detekce podnadpisů (začínají římskými číslicemi nebo arabskými)
        if (/^(I{1,3}|IV|V|VI{0,3}|IX|X|\d+)\.\s/.test(line.trim())) {
            return {
                text: line,
                style: 'subheader',
                margin: [0, 8, 0, 4]
            };
        }

        // Detekce seznamů (začínají číslem+tečkou)
        if (/^\d+\.\s/.test(line.trim())) {
            return {
                text: line,
                margin: [0, 3, 0, 3]
            };
        }

        // Detekce podpisových řádků
        if (line.includes('___________________________')) {
            return {
                text: line,
                margin: [0, 20, 0, 5]
            };
        }

        // Normální text
        return {
            text: line,
            margin: [0, 2, 0, 2]
        };
    });
}

/**
 * Vytvoří definici PDF dokumentu
 */
function createDocumentDefinition(title, content) {
    return {
        content: [
            {
                text: title,
                style: 'title',
                margin: [0, 0, 0, 20]
            },
            ...textToParagraphs(content)
        ],
        styles: {
            title: {
                fontSize: 16,
                bold: true,
                alignment: 'center'
            },
            header: {
                fontSize: 13,
                bold: true,
                alignment: 'center'
            },
            subheader: {
                fontSize: 12,
                bold: true
            }
        },
        defaultStyle: {
            fontSize: 10,
            lineHeight: 1.3
        },
        pageSize: 'A4',
        pageMargins: [60, 60, 60, 60]
    };
}

/**
 * Vygeneruje PDF smlouvy
 */
export function generateContractPDF(formData) {
    const contractText = generateContractText(formData);
    const docDefinition = createDocumentDefinition('SMLOUVA O PODNÁJMU BYTU', contractText);

    return pdfMake.createPdf(docDefinition);
}

/**
 * Vygeneruje PDF předávacího protokolu
 */
export function generateHandoverProtocolPDF(formData) {
    const protocolText = generateHandoverProtocolText(formData);
    const docDefinition = createDocumentDefinition('PŘEDÁVACÍ PROTOKOL', protocolText);

    return pdfMake.createPdf(docDefinition);
}

/**
 * Vygeneruje oba dokumenty v jednom PDF
 */
export function generateBothPDFs(formData) {
    const contractText = generateContractText(formData);
    const protocolText = generateHandoverProtocolText(formData);

    const docDefinition = {
        content: [
            {
                text: 'SMLOUVA O PODNÁJMU BYTU',
                style: 'title',
                margin: [0, 0, 0, 20]
            },
            ...textToParagraphs(contractText),
            {
                text: '',
                pageBreak: 'after'
            },
            {
                text: 'PŘEDÁVACÍ PROTOKOL',
                style: 'title',
                margin: [0, 0, 0, 20]
            },
            ...textToParagraphs(protocolText)
        ],
        styles: {
            title: {
                fontSize: 16,
                bold: true,
                alignment: 'center'
            },
            header: {
                fontSize: 13,
                bold: true,
                alignment: 'center'
            },
            subheader: {
                fontSize: 12,
                bold: true
            }
        },
        defaultStyle: {
            fontSize: 10,
            lineHeight: 1.3
        },
        pageSize: 'A4',
        pageMargins: [60, 60, 60, 60]
    };

    return pdfMake.createPdf(docDefinition);
}

/**
 * Stáhne PDF soubor
 */
export function downloadPDF(pdf, filename) {
    pdf.download(filename);
}

/**
 * Otevře PDF v novém okně
 */
export function openPDF(pdf) {
    pdf.open();
}

/**
 * Získá PDF jako data URL (pro preview)
 */
export function getPDFDataUrl(pdf) {
    return new Promise((resolve, reject) => {
        pdf.getDataUrl((dataUrl) => {
            resolve(dataUrl);
        });
    });
}
