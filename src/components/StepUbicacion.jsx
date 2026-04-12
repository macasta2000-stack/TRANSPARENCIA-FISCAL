import { PROVINCIAS_MVP } from "../data/provincias";

export default function StepUbicacion({ provincia, municipio, setUbicacion }) {
  const provData = PROVINCIAS_MVP.find((p) => p.id === provincia);
  const municipios = provData?.municipios || [];

  return (
    <div className="step step-ubicacion">
      <h2 className="step-title">Tu ubicación</h2>
      <p className="step-subtitle">
        Los impuestos provinciales y municipales varían según dónde vivís.
      </p>

      <div className="field-group">
        <label className="field-label">Provincia</label>
        <select
          className="select-input"
          value={provincia}
          onChange={(e) => setUbicacion(e.target.value, "")}
        >
          <option value="">Seleccioná tu provincia</option>
          {PROVINCIAS_MVP.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>
      </div>

      {provincia && municipios.length > 1 && (
        <div className="field-group">
          <label className="field-label">Municipio</label>
          <select
            className="select-input"
            value={municipio}
            onChange={(e) => setUbicacion(provincia, e.target.value)}
          >
            <option value="">Seleccioná tu municipio</option>
            {municipios.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
