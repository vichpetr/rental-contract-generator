import { format } from 'date-fns';

/**
 * Komponenta pro výběr data podpisu smlouvy
 */
export default function SigningDateSelector({ signingDate, onChange }) {
    return (
        <div className="fade-in">
            <h3 className="card-title">Datum podpisu</h3>
            <p className="card-description" style={{ marginBottom: 'var(--space-xl)' }}>
                Určete datum podpisu smlouvy
            </p>

            <div className="form-group">
                <label className="form-label" htmlFor="signingDate">
                    Datum podpisu
                </label>
                <input
                    id="signingDate"
                    type="date"
                    className="form-input"
                    value={signingDate || ''}
                    onChange={(e) => onChange(e.target.value)}
                    onClick={(e) => {
                        try {
                            e.target.showPicker?.();
                        } catch (err) {
                            // showPicker not supported in some browsers
                        }
                    }}
                />
            </div>

            {signingDate && (
                <div className="form-group" style={{ marginTop: 'var(--space-md)' }}>
                    <p style={{ color: 'var(--color-text-secondary)' }}>
                        Smlouva bude podepsána: <strong>{format(new Date(signingDate), 'd. M. yyyy')}</strong>
                    </p>
                </div>
            )}
        </div>
    );
}
