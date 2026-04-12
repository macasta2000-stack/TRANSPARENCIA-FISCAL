import { MODOS } from "../hooks/useCalculadora";

const MODO_ICONS = {
  completo: "\u{1F50D}",
  sueldo: "\u{1F4B0}",
  gastos: "\u{1F6D2}",
  empleador: "\u{1F3E2}",
};

const MODO_DETAILS = {
  completo: "Ingresa tu sueldo, ubicacion y gastos para ver el panorama completo de cuanto te saca el sistema.",
  sueldo: "Solo queres ver cuanto te descuentan del sueldo: aportes, ganancias, sindicato y cargas patronales.",
  gastos: "Calcula cuantos impuestos pagas en tu consumo diario: supermercado, nafta, servicios, alquiler.",
  empleador: "Enterate cuanto cuesta realmente contratar a alguien. Ves el bruto, las cargas y cuanto llega al bolsillo.",
};

export default function StepModo({ modo, setModo }) {
  return (
    <div className="step step-modo">
      <h2 className="step-title">¿Qué querés calcular?</h2>
      <p className="step-subtitle">
        Elegí el tipo de análisis. Podés hacer varios por separado y compartir cada resultado.
      </p>

      <div className="modo-cards">
        {Object.entries(MODOS).map(([id, cfg]) => (
          <button
            key={id}
            className={`modo-card ${modo === id ? "active" : ""}`}
            onClick={() => setModo(id)}
          >
            <span className="modo-card-icon">{MODO_ICONS[id]}</span>
            <div className="modo-card-text">
              <span className="modo-card-label">{cfg.label}</span>
              <span className="modo-card-desc">{cfg.desc}</span>
            </div>
            <span className="modo-card-detail">{MODO_DETAILS[id]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
