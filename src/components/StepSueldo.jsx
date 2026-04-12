import { MONOTRIBUTO_2026 } from "../data/impuestos-nacionales";

export default function StepSueldo({ sueldo, setSueldo }) {
  return (
    <div className="step step-sueldo">
      <h2 className="step-title">Tu sueldo</h2>
      <p className="step-subtitle">
        Empecemos por lo que ganás. Toda la info queda en tu dispositivo.
      </p>

      <div className="field-group">
        <label className="field-label">¿Cómo querés ingresar tu sueldo?</label>
        <div className="toggle-group">
          <button
            className={`toggle-btn ${sueldo.tipo === "neto" ? "active" : ""}`}
            onClick={() => setSueldo({ tipo: "neto" })}
          >
            Sueldo NETO
            <span className="toggle-sub">Lo que te depositan</span>
          </button>
          <button
            className={`toggle-btn ${sueldo.tipo === "bruto" ? "active" : ""}`}
            onClick={() => setSueldo({ tipo: "bruto" })}
          >
            Sueldo BRUTO
            <span className="toggle-sub">Antes de descuentos</span>
          </button>
        </div>
      </div>

      <div className="field-group">
        <label className="field-label">Monto mensual</label>
        <div className="input-with-prefix">
          <span className="input-prefix">$</span>
          <input
            type="text"
            inputMode="numeric"
            className="main-input"
            placeholder="Ej: 1.200.000"
            value={sueldo.monto}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9]/g, "");
              setSueldo({ monto: raw });
            }}
          />
        </div>
      </div>

      <div className="field-group">
        <label className="field-label">¿En qué relación laboral?</label>
        <div className="toggle-group toggle-group-3">
          <button
            className={`toggle-btn ${sueldo.relacion === "dependencia" ? "active" : ""}`}
            onClick={() => setSueldo({ relacion: "dependencia" })}
          >
            Relación de dependencia
          </button>
          <button
            className={`toggle-btn ${sueldo.relacion === "monotributista" ? "active" : ""}`}
            onClick={() => setSueldo({ relacion: "monotributista" })}
          >
            Monotributista
          </button>
          <button
            className={`toggle-btn ${sueldo.relacion === "autonomo" ? "active" : ""}`}
            onClick={() => setSueldo({ relacion: "autonomo" })}
          >
            Autónomo
          </button>
        </div>
      </div>

      {sueldo.relacion === "monotributista" && (
        <div className="field-group">
          <label className="field-label">Categoría de monotributo</label>
          <select
            className="select-input"
            value={sueldo.categoriaMonotributo}
            onChange={(e) => setSueldo({ categoriaMonotributo: e.target.value })}
          >
            {Object.entries(MONOTRIBUTO_2026).map(([cat, datos]) => (
              <option key={cat} value={cat}>
                Categoría {cat} — Cuota total: $
                {(datos.impuesto + datos.jubilacion + datos.obraSocial).toLocaleString("es-AR")}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
