export default function StepInmueble({ inmueble, setInmueble }) {
  const tipo = inmueble?.tipo || "ninguno";

  return (
    <div className="extra-section">
      <div className="extra-header">
        <span className="category-emoji">🏡</span>
        <span className="category-label">Situación habitacional</span>
      </div>

      <div className="toggle-group toggle-group-3">
        <button
          className={`toggle-btn small ${tipo === "alquila" ? "active" : ""}`}
          onClick={() => setInmueble({ tipo: "alquila" })}
        >
          Alquilo
        </button>
        <button
          className={`toggle-btn small ${tipo === "propietario" ? "active" : ""}`}
          onClick={() =>
            setInmueble({ tipo: "propietario", valuacionFiscal: "", montoBimestral: "" })
          }
        >
          Soy propietario
        </button>
        <button
          className={`toggle-btn small ${tipo === "ninguno" ? "active" : ""}`}
          onClick={() => setInmueble(null)}
        >
          Vivo con familia
        </button>
      </div>

      {tipo === "propietario" && (
        <div className="extra-fields">
          <div className="field-group">
            <label className="field-label">Valuación fiscal del inmueble</label>
            <div className="input-with-prefix">
              <span className="input-prefix">$</span>
              <input
                type="text"
                inputMode="numeric"
                className="main-input"
                placeholder="Ej: 25.000.000"
                value={inmueble.valuacionFiscal || ""}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, "");
                  setInmueble({ ...inmueble, valuacionFiscal: raw, montoBimestral: "" });
                }}
              />
            </div>
          </div>
          <p className="field-divider">— o —</p>
          <div className="field-group">
            <label className="field-label">
              Monto de tu boleta bimestral (ABL / Inmobiliario)
            </label>
            <div className="input-with-prefix">
              <span className="input-prefix">$</span>
              <input
                type="text"
                inputMode="numeric"
                className="main-input"
                placeholder="Ej: 35.000"
                value={inmueble.montoBimestral || ""}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, "");
                  setInmueble({ ...inmueble, montoBimestral: raw, valuacionFiscal: "" });
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
