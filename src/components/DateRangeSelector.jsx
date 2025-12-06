/**
 * Komponenta pro výběr časového období nájmu
 */
export default function DateRangeSelector({ dateFrom, dateTo, onChange, errors = {} }) {
    return (
        <div className="fade-in">
            <h3 className="card-title">Období nájmu</h3>
            <p className="card-description" style={{ marginBottom: 'var(--space-xl)' }}>
                Zadejte dobu trvání nájemní smlouvy
            </p>

            <div className="form-group">
                <label className="form-label required" htmlFor="dateFrom">
                    Datum začátku nájmu
                </label>
                <input
                    id="dateFrom"
                    type="date"
                    className={`form-input ${errors.dateFrom ? 'error' : ''}`}
                    value={dateFrom || ''}
                    onChange={(e) => onChange('dateFrom', e.target.value)}
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
    );
}
