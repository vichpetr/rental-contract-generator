import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import htmlToPdfmake from 'html-to-pdfmake';
import { generateContractText, generateHandoverProtocolText } from './contractGenerator';

// Registrace fontů
if (pdfFonts.pdfMake) {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
} else {
    pdfMake.vfs = pdfFonts;
}

/**
 * Převede HTML text na pdfmake formát
 */
function htmlToContent(htmlText) {
    // Nahradíme \n za <br> aby se zachovaly odřádkování
    const html = htmlText.replace(/\n/g, '<br />');

    // Převedeme HTML na pdfmake formát
    const content = htmlToPdfmake(html, {
        tableAutoSize: true,
        defaultStyles: {
            b: { bold: true },
            strong: { bold: true },
            u: { decoration: 'underline' },
            s: { decoration: 'lineThrough' },
            em: { italics: true },
            i: { italics: true },
            h1: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] },
            h2: { fontSize: 13, bold: true, margin: [0, 8, 0, 4] },
            h3: { fontSize: 12, bold: true, margin: [0, 6, 0, 3] },
            a: { color: 'blue', decoration: 'underline' },
            li: { margin: [0, 2, 0, 2] }
        }
    });

    return content;
}

/**
 * Vytvoří definici PDF dokumentu z HTML obsahu
 */
function createDocumentDefinitionFromHTML(title, htmlContent) {
    const content = htmlToContent(htmlContent);

    return {
        content: [
            {
                text: title,
                style: 'title',
                margin: [0, 0, 0, 15],
                alignment: 'center'
            },
            ...Array.isArray(content) ? content : [content]
        ],
        styles: {
            title: {
                fontSize: 14,
                bold: true
            },
            'html-strong': {
                bold: true
            },
            'html-b': {
                bold: true
            }
        },
        defaultStyle: {
            fontSize: 10,
            lineHeight: 1.3
        },
        pageSize: 'A4',
        pageMargins: [50, 50, 50, 50]
    };
}

/**
 * Vygeneruje PDF smlouvy
 */
export function generateContractPDF(formData) {
    const contractText = generateContractText(formData);
    const docDefinition = createDocumentDefinitionFromHTML('SMLOUVA O PODNÁJMU POKOJE', contractText);

    return pdfMake.createPdf(docDefinition);
}

/**
 * Vygeneruje PDF předávacího protokolu
 */
export function generateHandoverProtocolPDF(formData) {
    const protocolText = generateHandoverProtocolText(formData);
    const docDefinition = createDocumentDefinitionFromHTML('PŘEDÁVACÍ PROTOKOL', protocolText);

    return pdfMake.createPdf(docDefinition);
}

/**
 * Vygeneruje oba dokumenty v jednom PDF
 */
export function generateBothPDFs(formData) {
    const contractText = generateContractText(formData);
    const protocolText = generateHandoverProtocolText(formData);

    const contractContent = htmlToContent(contractText);
    const protocolContent = htmlToContent(protocolText);

    const docDefinition = {
        content: [
            {
                text: 'SMLOUVA O PODNÁJMU POKOJE',
                style: 'title',
                margin: [0, 0, 0, 15],
                alignment: 'center'
            },
            ...Array.isArray(contractContent) ? contractContent : [contractContent],
            {
                text: '',
                pageBreak: 'after'
            },
            {
                text: 'PŘEDÁVACÍ PROTOKOL',
                style: 'title',
                margin: [0, 0, 0, 15],
                alignment: 'center'
            },
            ...Array.isArray(protocolContent) ? protocolContent : [protocolContent]
        ],
        styles: {
            title: {
                fontSize: 14,
                bold: true
            },
            'html-strong': {
                bold: true
            },
            'html-b': {
                bold: true
            }
        },
        defaultStyle: {
            fontSize: 10,
            lineHeight: 1.3
        },
        pageSize: 'A4',
        pageMargins: [50, 50, 50, 50]
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
