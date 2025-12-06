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
    // Odstraníme \n protože HTML má vlastní strukturu
    const html = htmlText;

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
        },
        // Ignorujeme inline styles (včetně font-family)
        ignoreStyles: ['font-family', 'font-size', 'line-height', 'color']
    });

    return content;
}

/**
 * Vytvoří definici PDF dokumentu z HTML obsahu
 */
function createDocumentDefinitionFromHTML(title, htmlContent) {
    const content = htmlToContent(htmlContent);

    // Pokud je title prázdný, přidáme jen obsah
    const contentArray = [];
    if (title && title.trim()) {
        contentArray.push({
            text: title,
            style: 'title',
            margin: [0, 0, 0, 15],
            alignment: 'center'
        });
    }
    contentArray.push(...(Array.isArray(content) ? content : [content]));

    return {
        content: contentArray,
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
        pageMargins: [50, 50, 50, 60],
        // Přidána patička s čísly stránek
        footer: function (currentPage, pageCount) {
            return {
                text: `Strana ${currentPage} z ${pageCount}`,
                alignment: 'center',
                fontSize: 9,
                margin: [0, 10, 0, 0]
            };
        }
    };
}

/**
 * Vygeneruje PDF smlouvy
 */
export function generateContractPDF(formData) {
    const contractText = generateContractText(formData);
    const docDefinition = createDocumentDefinitionFromHTML('', contractText);

    return pdfMake.createPdf(docDefinition);
}

/**
 * Vygeneruje PDF předávacího protokolu
 */
export function generateHandoverProtocolPDF(formData) {
    const protocolText = generateHandoverProtocolText(formData);
    const docDefinition = createDocumentDefinitionFromHTML('', protocolText);

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
            ...Array.isArray(contractContent) ? contractContent : [contractContent],
            {
                text: '',
                pageBreak: 'after'
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
