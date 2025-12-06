import { useState } from 'react';
import { format } from 'date-fns';
import { contractConfig } from '../config/contractConfig';
import { validateStep } from '../utils/validation';
import { generateBothPDFs, downloadPDF } from '../utils/pdfGenerator';
import RoomVariantSelector from './RoomVariantSelector';
import PersonForm from './PersonForm';
import DateRangeSelector from './DateRangeSelector';
import SigningDateSelector from './SigningDateSelector';
import ContractPreview from './ContractPreview';

const STEPS = [
    { id: 0, label: 'Výběr pokoje' },
    { id: 1, label: 'Nájemce' },
    { id: 2, label: 'Podnájemce' },
    { id: 3, label: 'Období' },
    { id: 4, label: 'Náhled' }
];

/**
 * Hlavní formulář aplikace - Multi-step wizard
 */
export default function ContractForm() {
    const [currentStep, setCurrentStep] = useState(0);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        roomVariantId: null,
        tenant: {
            firstName: '',
            lastName: '',
            birthNumber: '',
            address: '',
            phone: '',
            email: ''
        },
        hasSubtenant: false,
        subtenant: {
            firstName: '',
            lastName: '',
            birthNumber: '',
            address: '',
            phone: '',
            email: ''
        },
        dateFrom: '',
        dateTo: '',
        signingDate: format(new Date(), 'yyyy-MM-dd')
    });

    // Získej aktuální variantu pokoje
    const selectedRoomVariant = contractConfig.roomVariants.find(
        r => r.id === formData.roomVariantId
    );

    // Kontrola, zda má být krok 2 (podnájemník) viditelný
    const shouldShowSubtenantStep = selectedRoomVariant?.maxOccupants === 2;

    const handleNext = () => {
        // Validace aktuálního kroku
        const stepErrors = validateStep(currentStep, formData, contractConfig.roomVariants);

        if (stepErrors) {
            setErrors(stepErrors);
            return;
        }

        setErrors({});

        // Pokud je krok 1 a pokoj je pro 1 osobu, přeskoč krok 2
        if (currentStep === 1 && !shouldShowSubtenantStep) {
            setCurrentStep(3);
        } else if (currentStep === 2 && !formData.hasSubtenant) {
            // Pokud uživatel na kroku 2 nezaškrtl podnájemníka, vymaž data
            setFormData({
                ...formData,
                subtenant: {
                    firstName: '',
                    lastName: '',
                    birthNumber: '',
                    address: '',
                    phone: '',
                    email: ''
                }
            });
            setCurrentStep(currentStep + 1);
        } else {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        setErrors({});

        // Pokud jsme na kroku 3 a pokoj je pro 1 osobu, vrať se na krok 1
        if (currentStep === 3 && !shouldShowSubtenantStep) {
            setCurrentStep(1);
        } else {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleGeneratePDF = () => {
        const pdf = generateBothPDFs(formData);
        const filename = `smlouva-${formData.tenant.lastName}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
        downloadPDF(pdf, filename);
    };

    const updateFormData = (field, value) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            [field]: value
        }));
    };

    const updateTenant = (tenant) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            tenant
        }));
    };

    const updateSubtenant = (subtenant) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            subtenant
        }));
    };

    // Určení, které kroky jsou dokončené
    const getStepStatus = (stepId) => {
        if (stepId < currentStep) return 'completed';
        if (stepId === currentStep) return 'active';
        return 'inactive';
    };

    // Filtrování kroků podle varianty pokoje
    const visibleSteps = STEPS.filter(step => {
        if (step.id === 2 && !shouldShowSubtenantStep) return false;
        return true;
    });

    return (
        <div>
            {/* Progress bar */}
            <div className="progress">
                <div className="progress-steps">
                    {visibleSteps.map((step) => {
                        const status = getStepStatus(step.id);
                        return (
                            <div key={step.id} className={`progress-step ${status}`}>
                                <div className="progress-step-circle">
                                    {status === 'completed' ? '✓' : step.id + 1}
                                </div>
                                <span className="progress-step-label">{step.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Formulář podle kroku */}
            <div className="card">
                {currentStep === 0 && (
                    <RoomVariantSelector
                        selectedId={formData.roomVariantId}
                        onChange={(id) => updateFormData('roomVariantId', id)}
                    />
                )}

                {currentStep === 1 && (
                    <PersonForm
                        title="Údaje hlavního nájemce"
                        person={formData.tenant}
                        onChange={updateTenant}
                        errors={errors}
                    />
                )}

                {currentStep === 2 && shouldShowSubtenantStep && (
                    <div className="fade-in">
                        <h3 className="card-title">Podnájemce</h3>
                        <p className="card-description" style={{ marginBottom: 'var(--space-lg)' }}>
                            Pokud bude pokoj obýván dvěma osobami, vyplňte údaje podnájemce
                        </p>

                        <div className="form-group">
                            <label className="checkbox-wrapper">
                                <input
                                    type="checkbox"
                                    checked={formData.hasSubtenant}
                                    onChange={(e) => updateFormData('hasSubtenant', e.target.checked)}
                                />
                                <span>Přidat podnájemce (rozdělení nákladů na 2 osoby)</span>
                            </label>
                        </div>

                        {formData.hasSubtenant && (
                            <PersonForm
                                person={formData.subtenant}
                                onChange={updateSubtenant}
                                errors={errors}
                            />
                        )}
                    </div>
                )}

                {currentStep === 3 && (
                    <div>
                        <DateRangeSelector
                            dateFrom={formData.dateFrom}
                            dateTo={formData.dateTo}
                            onChange={updateFormData}
                            errors={errors}
                        />

                        <div style={{ marginTop: 'var(--space-xl)' }}>
                            <SigningDateSelector
                                signingDate={formData.signingDate}
                                onChange={(value) => updateFormData('signingDate', value)}
                            />
                        </div>
                    </div>
                )}

                {currentStep === 4 && (
                    <div>
                        <ContractPreview formData={formData} />

                        <div style={{ marginTop: 'var(--space-xl)', padding: 'var(--space-lg)', background: 'var(--color-primary-50)', borderRadius: 'var(--radius-md)' }}>
                            <p style={{ marginBottom: 'var(--space-md)', fontWeight: 500 }}>
                                📄 Připraveno ke stažení
                            </p>
                            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                                Po kliknutí na tlačítko "Stáhnout PDF" se vytvoří dokument obsahující nájemní smlouvu
                                a předávací protokol.
                            </p>
                        </div>
                    </div>
                )}

                {/* Navigační tlačítka */}
                <div className="btn-group" style={{ marginTop: 'var(--space-2xl)' }}>
                    {currentStep > 0 && (
                        <button className="btn btn-secondary" onClick={handleBack}>
                            ← Zpět
                        </button>
                    )}

                    {currentStep < 4 && (
                        <button
                            className="btn btn-primary"
                            onClick={handleNext}
                            disabled={currentStep === 0 && !formData.roomVariantId}
                        >
                            Pokračovat →
                        </button>
                    )}

                    {currentStep === 4 && (
                        <button className="btn btn-success" onClick={handleGeneratePDF}>
                            📥 Stáhnout PDF
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
