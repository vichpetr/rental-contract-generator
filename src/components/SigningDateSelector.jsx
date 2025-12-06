import { useState } from 'react';
import { format } from 'date-fns';

/**
 * Komponenta pro výběr data podpisu smlouvy
 */
export default function SigningDateSelector({ signingDate, onChange }) {
    const [useToday, setUseToday] = useState(!signingDate);

    const handleUseTodayToggle = (checked) => {
        setUseToday(checked);
        if (checked) {
            onChange(format(new Date(), 'yyyy-MM-dd'));
        } else {
            onChange('');
        }
    };

    return (
        <div className="fade-in">
            <h3 className="card-title">Datum podpisu</h3>
            <p className="card-description" style={{ marginBottom: 'var(--space-xl)' }}>
                Určete datum podpisu smlouvy
            </p>

            <div className="form-grid form-grid-2">
                <div className="form-group">
                    <label className="checkbox-wrapper" style={{ height: '100%', alignItems: 'center' }}>
                        <input
                            type="checkbox"
                            checked={useToday}
                            onChange={(e) => handleUseTodayToggle(e.target.checked)}
                        />
                        <span>Použít dnešní datum</span>
                    </label>
                </div>

                <div className="form-group">
                    {!useToday && (
                        <>
                            <label className="form-label" htmlFor="signingDate">
                                Vlastní datum podpisu
                            </label>
                            <input
                                id="signingDate"
                                type="date"
                                className="form-input"
                                value={signingDate || ''}
                                onChange={(e) => onChange(e.target.value)}
                            />
                        </>
                    )}
                </div>
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
