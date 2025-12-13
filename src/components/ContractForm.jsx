import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { useContractData } from '../hooks/useContractData';
import { validateStep, validatePersonField } from '../utils/validation';
import { generateBothPDFs, downloadPDF } from '../utils/pdfGenerator';
import RoomVariantSelector from './RoomVariantSelector';
import PersonForm from './PersonForm';
import DateRangeSelector from './DateRangeSelector';
import SigningDateSelector from './SigningDateSelector';
import ContractPreview from './ContractPreview';
import PropertySelector from './PropertySelector';

const STEPS = [
    { id: 0, label: 'Nemovitost' },
    { id: 1, label: 'Výběr pokoje' },
    { id: 2, label: 'Nájemce' },
    { id: 3, label: 'Podnájemce' },
    { id: 4, label: 'Období' },
    { id: 5, label: 'Náhled' }
];

/**
 * Hlavní formulář aplikace - Multi-step wizard
 */
export default function ContractForm({ user }) {
    const { loading: initialLoading, error, properties, config, loadPropertyConfig } = useContractData();
    const [configLoading, setConfigLoading] = useState(false);

    // Address Book State
    const [savedTenants, setSavedTenants] = useState([]);

    useEffect(() => {
        if (user || import.meta.env.VITE_DEV_USER_ID) {
            fetchSavedTenants();
        }
    }, [user]);

    const fetchSavedTenants = async () => {
        try {
            const devUserId = import.meta.env.VITE_DEV_USER_ID;
            const targetUserId = user?.id || devUserId;

            if (!targetUserId) return;

            const { data, error } = await supabase
                .rpc('get_owner_tenants', { target_owner_id: targetUserId });

            if (!error && data) {
                setSavedTenants(data);
            }
        } catch (err) {
            console.error("Failed to load address book", err);
        }
    };

    const handleLoadTenant = (tenantId, isSubtenant = false) => {
        if (!tenantId) return;
        const person = savedTenants.find(t => String(t.id) === String(tenantId));
        if (person) {
            const mappedPerson = {
                firstName: person.first_name,
                lastName: person.last_name,
                birthNumber: person.birth_number || '',
                address: person.address_street || '',
                phone: person.phone || '',
                email: person.email || ''
            };

            if (isSubtenant) {
                updateSubtenant(mappedPerson);
            } else {
                updateTenant(mappedPerson);
            }
        }
    };

    const renderTenantSelector = (isSubtenant = false) => {
        if (savedTenants.length === 0) return null;
        return (
            <div className="form-group" style={{ marginBottom: 'var(--space-lg)', padding: 'var(--space-md)', background: 'var(--color-primary-50)', borderRadius: 'var(--radius-md)' }}>
                <label className="form-label" style={{ marginBottom: 'var(--space-sm)' }}>
                    📂 Načíst z adresáře (rychlé vyplnění)
                </label>
                <select
                    className="form-input"
                    onChange={(e) => handleLoadTenant(e.target.value, isSubtenant)}
                    defaultValue=""
                >
                    <option value="" disabled>Vyberte uloženého nájemníka...</option>
                    {savedTenants.map(t => (
                        <option key={t.id} value={t.id}>
                            {t.first_name} {t.last_name} ({t.email})
                        </option>
                    ))}
                </select>
            </div>
        );
    };

    // Step 0 is Property Selection, Step 1 is Room Variant, ...
    const [currentStep, setCurrentStep] = useState(0);
    const [errors, setErrors] = useState({});

    // Data
    const [selectedPropertyId, setSelectedPropertyId] = useState(null);
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

    // QR Code State
    const [qrCodeUrl, setQrCodeUrl] = useState(null);

    const generateQrForPreview = async () => {
        // Calculate Total Amount
        const roomVariant = config?.roomVariants?.find(r => r.id === formData.roomVariantId);
        if (!roomVariant) return;

        const occupants = formData.hasSubtenant ? 2 : 1;
        const totalAmount = roomVariant.monthlyRent + (roomVariant.feePerPerson * occupants);

        // Message
        const msg = `Najem ${formData.tenant.firstName} ${formData.tenant.lastName}`;

        // Bank Account from Config
        const { accountNumber, bankCode } = config.landlord.bankAccount || {};

        // Generate
        if (accountNumber && bankCode) {
            const url = await import('../utils/qrGenerator').then(m =>
                m.generatePaymentQR(accountNumber, bankCode, totalAmount, msg)
            );
            setQrCodeUrl(url);
        }
    };

    // Generate QR when entering Step 5 (Preview)
    useEffect(() => {
        if (currentStep === 5 && config && formData.roomVariantId) {
            generateQrForPreview();
        }
    }, [currentStep, config, formData.roomVariantId, formData.hasSubtenant]);


    if (initialLoading) {
        return <div className="loading">Načítám seznam nemovitostí...</div>;
    }

    if (error) {
        return <div className="error">Chyba aplikace: {error?.message}</div>;
    }

    // -- Handlers --

    const handlePropertySelect = async (propertyId) => {
        setSelectedPropertyId(propertyId);
        setConfigLoading(true);
        try {
            const loadedConfig = await loadPropertyConfig(propertyId);
            if (loadedConfig) {
                setCurrentStep(1); // Move to "Vyber pokoje"
            }
        } catch (e) {
            console.error(e);
            alert('Chyba při načítání dat nemovitosti');
        } finally {
            setConfigLoading(false);
        }
    };

    const handlePropertyReset = () => {
        setSelectedPropertyId(null);
        setCurrentStep(0);
        setFormData(prev => ({ ...prev, roomVariantId: null })); // Reset selected room
    };

    // Derived state from Config (only available if property selected)
    const selectedRoomVariant = config?.roomVariants?.find(
        r => r.id === formData.roomVariantId
    );
    const shouldShowSubtenantStep = selectedRoomVariant?.maxOccupants === 2;

    // Steps Logic
    const handleNext = () => {
        // Validation logic depends on step index (shifted by 1 compared to original)
        // Step 0 is Property (handled by onSelect)
        // Step 1 is Room (original 0)
        // Step 2 is Tenant (original 1)
        // ...

        // Map current step to "validation step index" (original logic used 0-based index for form content)
        const validationStepIndex = currentStep - 1;

        if (currentStep > 0) {
            const stepErrors = validateStep(validationStepIndex, formData, config.roomVariants);
            if (stepErrors) {
                setErrors(stepErrors);
                return;
            }
        }
        setErrors({});

        // Determine next step
        if (currentStep === 2 && !shouldShowSubtenantStep) {
            // Skip Subtenant (Step 3) if not needed
            setCurrentStep(4);
        } else if (currentStep === 3 && !formData.hasSubtenant) {
            // Clear subtenant data if unchecked
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

        if (currentStep === 1) {
            // Back to Property Select
            handlePropertyReset();
            return;
        }

        if (currentStep === 4 && !shouldShowSubtenantStep) {
            // Back from "Období" (4) to "Nájemce" (2) skipping Subtenant (3)
            setCurrentStep(2);
        } else {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleGeneratePDF = () => {
        const pdf = generateBothPDFs(formData, config);
        const filename = `smlouva-${formData.tenant.lastName}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
        downloadPDF(pdf, filename);
    };

    const updateFormData = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const updateTenant = (newTenant) => setFormData(prev => ({ ...prev, tenant: newTenant }));
    const updateSubtenant = (newSub) => setFormData(prev => ({ ...prev, subtenant: newSub }));

    const handleTenantFieldValidation = (field) => {
        const fieldError = validatePersonField(formData.tenant, field, true);
        setErrors(prev => ({ ...prev, ...fieldError }));
    };

    const handleSubtenantFieldValidation = (field) => {
        const fieldError = validatePersonField(formData.subtenant, field, formData.hasSubtenant);
        setErrors(prev => ({ ...prev, ...fieldError }));
    };

    const getStepStatus = (stepId) => {
        if (stepId < currentStep) return 'completed';
        if (stepId === currentStep) return 'active';
        return 'inactive';
    };

    // Filter steps visibility
    const visibleSteps = STEPS.filter(step => {
        if (step.id === 3 && !shouldShowSubtenantStep) return false;
        return true;
    });

    if (configLoading) {
        return <div className="loading">Načítám konfiguraci nemovitosti...</div>;
    }

    // Step 0: Property Selector
    if (currentStep === 0) {
        return (
            <PropertySelector
                properties={properties}
                onSelect={handlePropertySelect}
                loading={initialLoading}
            />
        );
    }

    // Wizard (Steps 1+)
    if (!config) return <div className="error">Chyba konfigurace</div>;

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

            {/* Content */}
            <div className="card">
                {currentStep === 1 && (
                    <RoomVariantSelector
                        selectedId={formData.roomVariantId}
                        onChange={(id) => updateFormData('roomVariantId', id)}
                        variants={config.roomVariants}
                    />
                )}

                {currentStep === 2 && (
                    <>
                        {renderTenantSelector(false)}
                        <PersonForm
                            title="Údaje hlavního nájemce"
                            person={formData.tenant}
                            onChange={updateTenant}
                            onValidate={handleTenantFieldValidation}
                            errors={errors}
                        />
                    </>
                )}

                {currentStep === 3 && shouldShowSubtenantStep && (
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
                            <>
                                {renderTenantSelector(true)}
                                <PersonForm
                                    title="Údaje podnájemce"
                                    person={formData.subtenant}
                                    onChange={updateSubtenant}
                                    onValidate={handleSubtenantFieldValidation}
                                    errors={errors}
                                />
                            </>
                        )}
                    </div>
                )}

                {currentStep === 4 && (
                    <div>
                        <DateRangeSelector
                            dateFrom={formData.dateFrom}
                            dateTo={formData.dateTo}
                            onChange={updateFormData}
                            defaultDuration={config.defaultContractDuration}
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

                {currentStep === 5 && (
                    <div>
                        <ContractPreview formData={formData} config={config} qrCodeUrl={qrCodeUrl} />
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

                {/* Buttons */}
                <div className="btn-group" style={{ marginTop: 'var(--space-2xl)' }}>
                    <button className="btn btn-secondary" onClick={handleBack}>
                        ← Zpět {currentStep === 1 && 'na výběr nemovitosti'}
                    </button>

                    {currentStep < 5 && (
                        <button
                            className="btn btn-primary"
                            onClick={handleNext}
                            disabled={currentStep === 1 && !formData.roomVariantId}
                        >
                            Pokračovat →
                        </button>
                    )}

                    {currentStep === 5 && (
                        <button className="btn btn-success" onClick={handleGeneratePDF}>
                            📥 Stáhnout PDF
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
