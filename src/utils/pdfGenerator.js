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
        scale: 3,
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
    pagebreak: { mode: 'css', avoid: '.page-break-avoid' }
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

    // Skrýt na obrazovce, ale zobrazit pro PDF rendering
    tempDiv.classList.add('hide-for-screen');

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
export function generateContractPDF(formData, config) {
    const contractText = generateContractText(formData, config);
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
export function generateHandoverProtocolPDF(formData, config) {
    const protocolText = generateHandoverProtocolText(formData, config);
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
 * Vygeneruje oba dokumenty v jednom PDF přímo z viditelného náhledu
 */
export function generateBothPDFs(formData) {
    const opt = {
        ...defaultOptions,
        filename: `smlouva-${new Date().toISOString().split('T')[0]}.pdf`
    };

    // Vrátit objekt s metodami pro kompatibilitu
    return {
        download: (filename) => {
            const customOpt = { ...opt, filename };

            // Najít viditelný preview element
            const previewContent = document.querySelector('.preview-content');
            if (!previewContent) {
                console.error('Preview content not found');
                return Promise.reject('Preview content not found');
            }

            return html2pdf()
                .set(customOpt)
                .from(previewContent)
                .toPdf()
                .get('pdf')
                .then((pdf) => {
                    // Přidat čísla stránek
                    const totalPages = pdf.internal.getNumberOfPages();
                    for (let i = 1; i <= totalPages; i++) {
                        pdf.setPage(i);
                        pdf.setFontSize(9);
                        pdf.setTextColor(100);
                        pdf.text(
                            `Strana ${i} z ${totalPages}`,
                            pdf.internal.pageSize.getWidth() / 2,
                            pdf.internal.pageSize.getHeight() - 10,
                            { align: 'center' }
                        );
                    }
                    pdf.save(filename);
                });
        },
        save: () => {
            const previewContent = document.querySelector('.preview-content');
            if (!previewContent) {
                console.error('Preview content not found');
                return Promise.reject('Preview content not found');
            }

            return html2pdf()
                .set(opt)
                .from(previewContent)
                .toPdf()
                .get('pdf')
                .then((pdf) => {
                    // Přidat čísla stránek
                    const totalPages = pdf.internal.getNumberOfPages();
                    for (let i = 1; i <= totalPages; i++) {
                        pdf.setPage(i);
                        pdf.setFontSize(9);
                        pdf.setTextColor(100);
                        pdf.text(
                            `Strana ${i} z ${totalPages}`,
                            pdf.internal.pageSize.getWidth() / 2,
                            pdf.internal.pageSize.getHeight() - 10,
                            { align: 'center' }
                        );
                    }
                    pdf.save(opt.filename);
                });
        },
        open: () => {
            const previewContent = document.querySelector('.preview-content');
            if (!previewContent) {
                console.error('Preview content not found');
                return Promise.reject('Preview content not found');
            }

            return html2pdf()
                .set(opt)
                .from(previewContent)
                .toPdf()
                .get('pdf')
                .then((pdf) => {
                    // Přidat čísla stránek
                    const totalPages = pdf.internal.getNumberOfPages();
                    for (let i = 1; i <= totalPages; i++) {
                        pdf.setPage(i);
                        pdf.setFontSize(9);
                        pdf.setTextColor(100);
                        pdf.text(
                            `Strana ${i} z ${totalPages}`,
                            pdf.internal.pageSize.getWidth() / 2,
                            pdf.internal.pageSize.getHeight() - 10,
                            { align: 'center' }
                        );
                    }
                    return pdf.output('bloburl');
                })
                .then((url) => {
                    window.open(url, '_blank');
                });
        },
        getDataUrl: () => {
            const previewContent = document.querySelector('.preview-content');
            if (!previewContent) {
                console.error('Preview content not found');
                return Promise.reject('Preview content not found');
            }

            return html2pdf()
                .set(opt)
                .from(previewContent)
                .toPdf()
                .get('pdf')
                .then((pdf) => {
                    // Přidat čísla stránek
                    const totalPages = pdf.internal.getNumberOfPages();
                    for (let i = 1; i <= totalPages; i++) {
                        pdf.setPage(i);
                        pdf.setFontSize(9);
                        pdf.setTextColor(100);
                        pdf.text(
                            `Strana ${i} z ${totalPages}`,
                            pdf.internal.pageSize.getWidth() / 2,
                            pdf.internal.pageSize.getHeight() - 10,
                            { align: 'center' }
                        );
                    }
                    return pdf.output('dataurlstring');
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
