import { useState } from 'react';

/**
 * Reusable formulář pro osobní údaje nájemníka/podnájemníka
 */
export default function PersonForm({ person, onChange, errors = {}, title, onValidate }) {
    const handleChange = (field, value) => {
        onChange({
            ...person,
            [field]: value
        });
    };

    const handleBlur = (field) => {
        // Spustit validaci při opuštění pole, pokud je onValidate funkce poskytnut a
        if (onValidate) {
            onValidate(field);
        }
    };

    return (
        <div className="fade-in">
            {title && <h3 className="card-title">{title}</h3>}

            {/* První řádek: Jméno a Příjmení (2 sloupce) */}
            <div className="form-grid form-grid-2">
                <div className="form-group">
                    <label className="form-label required" htmlFor="firstName">
                        Jméno
                    </label>
                    <input
                        id="firstName"
                        type="text"
                        className={`form-input ${errors.firstName ? 'error' : ''}`}
                        value={person.firstName || ''}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                        onBlur={() => handleBlur('firstName')}
                        placeholder="Jan"
                    />
                    {errors.firstName && (
                        <span className="form-error">{errors.firstName}</span>
                    )}
                </div>

                <div className="form-group">
                    <label className="form-label required" htmlFor="lastName">
                        Příjmení
                    </label>
                    <input
                        id="lastName"
                        type="text"
                        className={`form-input ${errors.lastName ? 'error' : ''}`}
                        value={person.lastName || ''}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                        onBlur={() => handleBlur('lastName')}
                        placeholder="Novák"
                    />
                    {errors.lastName && (
                        <span className="form-error">{errors.lastName}</span>
                    )}
                </div>
            </div>

            {/* Druhý řádek: Číslo dokladu, Telefon, Email (3 sloupce) */}
            <div className="form-grid form-grid-3">
                <div className="form-group">
                    <label className="form-label required" htmlFor="birthNumber">
                        Číslo dokladu
                    </label>
                    <input
                        id="birthNumber"
                        type="text"
                        className={`form-input ${errors.birthNumber ? 'error' : ''}`}
                        value={person.birthNumber || ''}
                        onChange={(e) => handleChange('birthNumber', e.target.value)}
                        onBlur={() => handleBlur('birthNumber')}
                        placeholder="123456/7890 nebo AB123456"
                    />
                    {errors.birthNumber && (
                        <span className="form-error">{errors.birthNumber}</span>
                    )}
                    <span className="form-hint">Rodné číslo nebo číslo pasu</span>
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="phone">
                        Telefon
                    </label>
                    <input
                        id="phone"
                        type="tel"
                        className={`form-input ${errors.phone ? 'error' : ''}`}
                        value={person.phone || ''}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        onBlur={() => handleBlur('phone')}
                        placeholder="+420 123 456 789"
                    />
                    {errors.phone && (
                        <span className="form-error">{errors.phone}</span>
                    )}
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="email">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        className={`form-input ${errors.email ? 'error' : ''}`}
                        value={person.email || ''}
                        onChange={(e) => handleChange('email', e.target.value)}
                        onBlur={() => handleBlur('email')}
                        placeholder="jan.novak@email.cz"
                    />
                    {errors.email && (
                        <span className="form-error">{errors.email}</span>
                    )}
                </div>
            </div>

            {/* Třetí řádek: Adresa (celá šířka) */}
            <div className="form-group">
                <label className="form-label required" htmlFor="address">
                    Trvalá adresa
                </label>
                <input
                    id="address"
                    type="text"
                    className={`form-input ${errors.address ? 'error' : ''}`}
                    value={person.address || ''}
                    onChange={(e) => handleChange('address', e.target.value)}
                    onBlur={() => handleBlur('address')}
                    placeholder="Ulice 123, 110 00 Praha 1"
                />
                {errors.address && (
                    <span className="form-error">{errors.address}</span>
                )}
            </div>
        </div>
    );
}
