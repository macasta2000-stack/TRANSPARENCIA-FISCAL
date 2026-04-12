export default function StepAuto({ auto, setAuto }) {
  const tieneAuto = auto !== null;

  return (
    <div className="extra-section">
      <div className="extra-header">
        <span className="category-emoji">🚗</span>
        <span className="category-label">¿Tenés auto?</span>
        <div className="toggle-group toggle-small">
          <button
            className={`toggle-btn small ${tieneAuto ? "active" : ""}`}
            onClick={() =>
              setAuto({ valuacion: "", seguro: "" })
            }
          >
            Sí
          </button>
          <button
            className={`toggle-btn small ${!tieneAuto ? "active" : ""}`}
            onClick={() => setAuto(null)}
          >
            No
          </button>
        </div>
      </div>

      {tieneAuto && (
        <div className="extra-fields">
          <div className="field-group">
            <label className="field-label">
              Valuación fiscal del vehículo (o cuánto pagás de patente/año)
            </label>
            <div className="input-with-prefix">
              <span className="input-prefix">$</span>
              <input
                type="text"
                inputMode="numeric"
                className="main-input"
                placeholder="Ej: 15.000.000"
                value={auto.valuacion || ""}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, "");
                  setAuto({ ...auto, valuacion: raw });
                }}
              />
            </div>
          </div>
          <div className="field-group">
            <label className="field-label">Seguro mensual</label>
            <div className="input-with-prefix">
              <span className="input-prefix">$</span>
              <input
                type="text"
                inputMode="numeric"
                className="main-input"
                placeholder="Ej: 85.000"
                value={auto.seguro || ""}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, "");
                  setAuto({ ...auto, seguro: raw });
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
