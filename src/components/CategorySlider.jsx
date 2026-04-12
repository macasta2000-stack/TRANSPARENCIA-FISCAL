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
  nacional: "Nación",
  provincial: "Provincia",
  municipal: "Municipio",
};

export default function CategorySlider({
  categoria,
  value,
  onChange,
  provincia,
  municipio,
  children,
}) {
  const monto = parseFloat(value) || 0;
  const detalle = calcularImpuestoCategoriaDetallado(categoria.id, monto, provincia, municipio);
  const hasDetail = detalle.total > 0 && detalle.items.length > 0;

  return (
    <div className="category-slider">
      <div className="category-header">
        <span className="category-emoji">{categoria.emoji}</span>
        <span className="category-label">{categoria.label}</span>
        {detalle.total > 0 && (
          <span className="category-tax-badge">
            ~{formatearPesos(detalle.total)} en imp.
          </span>
        )}
      </div>

      <div className={`category-body ${hasDetail ? "has-detail" : ""}`}>
        {/* Left: input */}
        <div className="category-input-col">
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
        </div>

        {/* Right: always-visible tax breakdown */}
        {hasDetail && (
          <div className="category-detail-col">
            {detalle.items.map((item, i) => (
              <div key={i} className="cat-tax-row">
                <span
                  className="cat-tax-dot"
                  style={{ background: NIVEL_COLORS[item.nivel] }}
                  title={NIVEL_LABELS[item.nivel]}
                />
                <span className="cat-tax-name">
                  {item.nombre}
                  {item.tasa ? ` (${(item.tasa * 100).toFixed(1)}%)` : ""}
                </span>
                <span className="cat-tax-amount">{formatearPesos(item.monto)}</span>
              </div>
            ))}
            {detalle.nota && (
              <p className="cat-tax-nota">{detalle.nota}</p>
            )}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
