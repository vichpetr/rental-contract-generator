import { contractConfig } from '../config/contractConfig';

/**
 * Komponenta pro výběr časového období nájmu
 */
export default function DateRangeSelector({ dateFrom, dateTo, onChange, errors = {} }) {

    // Handler pro změnu data začátku - automaticky nastaví konečné datum
    const handleDateFromChange = (newDateFrom) => {
        onChange('dateFrom', newDateFrom);

        // Pokud uživatel nevyplnil konečné datum, automaticky ho dopočítej
        if (!dateTo && newDateFrom) {
            const startDate = new Date(newDateFrom);
            const endDate = new Date(startDate);
            endDate.setFullYear(startDate.getFullYear() + contractConfig.defaultContractDuration);

            // Formátuj datum do formátu YYYY-MM-DD
            const formattedEndDate = endDate.toISOString().split('T')[0];
            onChange('dateTo', formattedEndDate);
        }
    };

    return (
        <div className="fade-in">
            <h3 className="card-title">Období nájmu</h3>
            <p className="card-description" style={{ marginBottom: 'var(--space-xl)' }}>
                Zadejte dobu trvání nájemní smlouvy (výchozí doba trvání je {contractConfig.defaultContractDuration} roky)
            </p>

            <div className="form-grid form-grid-2">
                <div className="form-group">
                    <label className="form-label required" htmlFor="dateFrom">
                        Datum začátku nájmu
                    </label>
                    <input
                        id="dateFrom"
                        type="date"
                        className={`form-input ${errors.dateFrom ? 'error' : ''}`}
                        value={dateFrom || ''}
                        onChange={(e) => handleDateFromChange(e.target.value)}
                    />
                    {errors.dateFrom && (
                        <span className="form-error">{errors.dateFrom}</span>
                    )}
                </div>

                <div className="form-group">
                    <label className="form-label required" htmlFor="dateTo">
                        Datum konce nájmu
                    </label>
                    <input
                        id="dateTo"
                        type="date"
                        className={`form-input ${errors.dateTo ? 'error' : ''}`}
                        value={dateTo || ''}
                        onChange={(e) => onChange('dateTo', e.target.value)}
                    />
                    {errors.dateTo && (
                        <span className="form-error">{errors.dateTo}</span>
                    )}
                    {errors.dateRange && (
                        <span className="form-error">{errors.dateRange}</span>
                    )}
                </div>
            </div>
        </div>
    );
}
