import html2pdf from 'html2pdf.js';
import { generateContractText, generateHandoverProtocolText } from './contractGenerator';

/**
 * Konfigurace pro html2pdf
 */
const defaultOptions = {
    margin: [6, 6, 6, 6],
    filename: 'smlouva.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        allowTaint: false,
        logging: false,
        windowWidth: 794, // A4 width in pixels at 96 DPI
        windowHeight: 1123, // A4 height in pixels at 96 DPI
        scrollY: 0,
        scrollX: 0,
        foreignObjectRendering: false
    },
    jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
};

/**
 * Vytvoří dočasný HTML element s obsahem
 */
function createTempElement(htmlContent) {
    const tempDiv = document.createElement('div');
    // A4 width (210mm) minus margins (6mm on each side = 12mm total)
    tempDiv.style.width = '198mm';
    tempDiv.style.maxWidth = '198mm';
    tempDiv.style.padding = '0';
    tempDiv.style.margin = '0';
    tempDiv.style.boxSizing = 'border-box';
    tempDiv.innerHTML = htmlContent;
    document.body.appendChild(tempDiv);
    return tempDiv;
}

/**
 * Odstraní dočasný element
 */
function removeTempElement(element) {
    if (element && element.parentNode) {
        document.body.removeChild(element);
    }
}

/**
 * Vygeneruje PDF smlouvy
 */
export function generateContractPDF(formData) {
    const contractText = generateContractText(formData);
    const tempDiv = createTempElement(contractText);

    const opt = { ...defaultOptions, filename: 'najemni-smlouva.pdf' };

    return html2pdf()
        .set(opt)
        .from(tempDiv)
        .toPdf()
        .get('pdf')
        .then((pdf) => {
            removeTempElement(tempDiv);
            return { pdf, save: () => html2pdf().set(opt).from(createTempElement(contractText)).save() };
        });
}

/**
 * Vygeneruje PDF předávacího protokolu
 */
export function generateHandoverProtocolPDF(formData) {
    const protocolText = generateHandoverProtocolText(formData);
    const tempDiv = createTempElement(protocolText);

    const opt = { ...defaultOptions, filename: 'predavaci-protokol.pdf' };

    return html2pdf()
        .set(opt)
        .from(tempDiv)
        .toPdf()
        .get('pdf')
        .then((pdf) => {
            removeTempElement(tempDiv);
            return { pdf, save: () => html2pdf().set(opt).from(createTempElement(protocolText)).save() };
        });
}

/**
 * Vygeneruje oba dokumenty v jednom PDF
 */
export function generateBothPDFs(formData) {
    const contractText = generateContractText(formData);
    const protocolText = generateHandoverProtocolText(formData);

    // Spojit oba dokumenty s page break mezi nimi
    const combinedHTML = `
        ${contractText}
        <div style="page-break-after: always;"></div>
        ${protocolText}
    `;

    const tempDiv = createTempElement(combinedHTML);

    const opt = {
        ...defaultOptions,
        filename: `smlouva-${new Date().toISOString().split('T')[0]}.pdf`
    };

    const worker = html2pdf().set(opt).from(tempDiv);

    // Vrátit objekt s metodami pro kompatibilitu
    return {
        download: (filename) => {
            const customOpt = { ...opt, filename };
            return html2pdf()
                .set(customOpt)
                .from(createTempElement(combinedHTML))
                .save()
                .then(() => removeTempElement(tempDiv));
        },
        save: () => {
            return worker.save().then(() => removeTempElement(tempDiv));
        },
        open: () => {
            return worker.outputPdf('bloburl').then((url) => {
                removeTempElement(tempDiv);
                window.open(url, '_blank');
            });
        },
        getDataUrl: () => {
            return worker.outputPdf('dataurlstring').then((dataUrl) => {
                removeTempElement(tempDiv);
                return dataUrl;
            });
        }
    };
}

/**
 * Stáhne PDF soubor
 */
export function downloadPDF(pdfObject, filename) {
    if (pdfObject && typeof pdfObject.download === 'function') {
        return pdfObject.download(filename);
    }
}

/**
 * Otevře PDF v novém okně
 */
export function openPDF(pdfObject) {
    if (pdfObject && typeof pdfObject.open === 'function') {
        return pdfObject.open();
    }
}

/**
 * Získá PDF jako data URL (pro preview)
 */
export function getPDFDataUrl(pdfObject) {
    if (pdfObject && typeof pdfObject.getDataUrl === 'function') {
        return pdfObject.getDataUrl();
    }
    return Promise.resolve('');
}
