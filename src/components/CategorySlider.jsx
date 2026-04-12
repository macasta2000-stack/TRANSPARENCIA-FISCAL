import { useState } from "react";
import { calcularImpuestoCategoriaDetallado } from "../utils/calcularConsumo";

function formatearPesos(n) {
  if (!n || n <= 0) return "";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);
}

const NIVEL_COLORS = {
  nacional: "#FF3B3B",
  provincial: "#FF8C00",
  municipal: "#FFD600",
};

const NIVEL_LABELS = {
  nacional: "NACIÓN",
  provincial: "PROVINCIA",
  municipal: "MUNICIPIO",
};

export default function CategorySlider({
  categoria,
  value,
  onChange,
  provincia,
  children,
}) {
  const [expanded, setExpanded] = useState(false);
  const monto = parseFloat(value) || 0;
  const detalle = calcularImpuestoCategoriaDetallado(categoria.id, monto, provincia);

  return (
    <div className="category-slider">
      <div className="category-header">
        <span className="category-emoji">{categoria.emoji}</span>
        <span className="category-label">{categoria.label}</span>
        {detalle.total > 0 && (
          <button
            className="category-tax"
            onClick={() => setExpanded(!expanded)}
            title="Ver desglose de impuestos"
          >
            ~{formatearPesos(detalle.total)} en imp.
            <span className="expand-arrow">{expanded ? "▾" : "▸"}</span>
          </button>
        )}
      </div>
      <div className="category-input-row">
        <span className="input-prefix">$</span>
        <input
          type="text"
          inputMode="numeric"
          className="category-input"
          placeholder={categoria.placeholder}
          value={value || ""}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9]/g, "");
            onChange(raw);
          }}
        />
      </div>

      {expanded && detalle.items.length > 0 && (
        <div className="category-detail">
          {detalle.items.map((item, i) => (
            <div key={i} className="category-detail-row">
              <span
                className="detail-nivel-dot"
                style={{ background: NIVEL_COLORS[item.nivel] }}
                title={NIVEL_LABELS[item.nivel]}
              />
              <span className="detail-nombre">
                {item.nombre}
                {item.tasa ? ` (${(item.tasa * 100).toFixed(1)}%)` : ""}
              </span>
              <span className="detail-monto">{formatearPesos(item.monto)}</span>
            </div>
          ))}
          {detalle.nota && (
            <p className="category-detail-nota">{detalle.nota}</p>
          )}
          <div className="category-detail-legend">
            <span><span className="dot" style={{ background: NIVEL_COLORS.nacional }} /> Nación</span>
            <span><span className="dot" style={{ background: NIVEL_COLORS.provincial }} /> Provincia</span>
            <span><span className="dot" style={{ background: NIVEL_COLORS.municipal }} /> Municipio</span>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
