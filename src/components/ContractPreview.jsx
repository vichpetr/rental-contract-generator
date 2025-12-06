import { useState } from 'react';
import { generateContractText, generateHandoverProtocolText } from '../utils/contractGenerator';

/**
 * Komponenta pro náhled výsledných dokumentů
 */
export default function ContractPreview({ formData }) {
    const [activeTab, setActiveTab] = useState('contract');

    const contractText = generateContractText(formData);
    const protocolText = generateHandoverProtocolText(formData);

    return (
        <div className="fade-in">
            <h3 className="card-title">Náhled dokumentů</h3>
            <p className="card-description" style={{ marginBottom: 'var(--space-xl)' }}>
                Zkontrolujte správnost údajů před vytvořením PDF
            </p>

            <div className="tabs">
                <div className="tabs-list">
                    <button
                        className={`tab ${activeTab === 'contract' ? 'active' : ''}`}
                        onClick={() => setActiveTab('contract')}
                    >
                        Nájemní smlouva
                    </button>
                    <button
                        className={`tab ${activeTab === 'protocol' ? 'active' : ''}`}
                        onClick={() => setActiveTab('protocol')}
                    >
                        Předávací protokol
                    </button>
                </div>

                <div className="preview-container">
                    <div
                        className="preview-content"
                        dangerouslySetInnerHTML={{
                            __html: activeTab === 'contract'
                                ? contractText.replace(/\n/g, '<br />')
                                : protocolText.replace(/\n/g, '<br />')
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
