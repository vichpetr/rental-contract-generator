import { calculateTotalMonthly } from '../utils/contractGenerator';

/**
 * Komponenta pro výběr varianty pokoje
 */
export default function RoomVariantSelector({ selectedId, onChange, variants }) {
    return (
        <div className="fade-in">
            <h3 className="card-title">Vyberte variantu pokoje</h3>
            <p className="card-description" style={{ marginBottom: 'var(--space-xl)' }}>
                Zvolte typ pokoje podle počtu osob
            </p>

            <div className="room-variants">
                {(!variants || variants.length === 0) && (
                    <div className="text-center py-8 text-gray-500 w-full">
                        <p>Tato nemovitost nemá definované žádné pokoje k pronájmu.</p>
                        <p className="text-sm mt-2">Přidejte pokoje v editaci nemovitosti.</p>
                    </div>
                )}
                {variants?.map((variant) => {
                    const isSelected = selectedId === variant.id;

                    return (
                        <div
                            key={variant.id}
                            className={`room-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => onChange(variant.id)}
                        >
                            <div className="room-card-header">
                                <h4 className="room-card-title">{variant.name}</h4>
                                <p className="room-card-description">{variant.description}</p>
                            </div>

                            <div className="room-card-details">
                                <div className="room-card-detail">
                                    <span className="room-card-detail-label">Maximální obsazenost</span>
                                    <span className="room-card-detail-value">
                                        {variant.maxOccupants} {variant.maxOccupants === 1 ? 'osoba' : 'osoby'}
                                    </span>
                                </div>

                                <div className="room-card-detail">
                                    <span className="room-card-detail-label">Měsíční nájem</span>
                                    <span className="room-card-detail-value">
                                        {variant.monthlyRent.toLocaleString('cs-CZ')} Kč
                                    </span>
                                </div>

                                <div className="room-card-detail">
                                    <span className="room-card-detail-label">Poplatek na osobu</span>
                                    <span className="room-card-detail-value">
                                        {variant.feePerPerson.toLocaleString('cs-CZ')} Kč
                                    </span>
                                </div>

                                <div className="room-card-detail">
                                    <span className="room-card-detail-label">Celkem (pro 1 osobu)</span>
                                    <span className="room-card-detail-value" style={{ fontSize: '1.125rem', color: 'var(--color-primary-600)' }}>
                                        {calculateTotalMonthly(variant, 1).toLocaleString('cs-CZ')} Kč/měsíc
                                    </span>
                                </div>

                                {variant.maxOccupants === 2 && (
                                    <div className="room-card-detail">
                                        <span className="room-card-detail-label">Celkem (pro 2 osoby)</span>
                                        <span className="room-card-detail-value" style={{ fontSize: '1.125rem', color: 'var(--color-primary-600)' }}>
                                            {calculateTotalMonthly(variant, 2).toLocaleString('cs-CZ')} Kč/měsíc
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
