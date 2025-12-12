import { generateContractText, generateHandoverProtocolText } from '../utils/contractGenerator';

/**
 * Komponenta pro náhled výsledných dokumentů
 */
export default function ContractPreview({ formData, config }) {
    const contractText = generateContractText(formData, config);
    const protocolText = generateHandoverProtocolText(formData, config);

    return (
        <div className="fade-in">
            <h3 className="card-title">Náhled dokumentů</h3>
            <p className="card-description" style={{ marginBottom: 'var(--space-xl)' }}>
                Zkontrolujte správnost údajů před vytvořením PDF
            </p>

            <div className="preview-container">
                <div
                    className="preview-content"
                    dangerouslySetInnerHTML={{
                        __html: `
                            <div class="contract-page">
                                ${contractText}
                            </div>
                            <div class="page-break"></div>
                            <div class="protocol-page">
                                ${protocolText}
                            </div>
                        `
                    }}
                />
            </div>
        </div>
    );
}
