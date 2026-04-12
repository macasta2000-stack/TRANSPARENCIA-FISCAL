import { calcularImpuestoCategoria } from "../utils/calcularConsumo";

function formatearPesos(n) {
  if (!n || n <= 0) return "";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function CategorySlider({
  categoria,
  value,
  onChange,
  provincia,
  children,
}) {
  const monto = parseFloat(value) || 0;
  const impuesto = calcularImpuestoCategoria(categoria.id, monto, provincia);

  return (
    <div className="category-slider">
      <div className="category-header">
        <span className="category-emoji">{categoria.emoji}</span>
        <span className="category-label">{categoria.label}</span>
        {impuesto > 0 && (
          <span className="category-tax">
            ~{formatearPesos(impuesto)} en impuestos
          </span>
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
      {children}
    </div>
  );
}
