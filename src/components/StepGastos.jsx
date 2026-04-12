import { CATEGORIAS_GASTO } from "../data/categorias-gasto";
import CategorySlider from "./CategorySlider";
import StepAuto from "./StepAuto";
import StepInmueble from "./StepInmueble";

export default function StepGastos({
  gastos,
  setGastos,
  auto,
  setAuto,
  inmueble,
  setInmueble,
  provincia,
}) {
  return (
    <div className="step step-gastos">
      <h2 className="step-title">Tus gastos mensuales</h2>
      <p className="step-subtitle">
        Completá solo lo que aplica. En cada categoría te mostramos cuánto se va
        en impuestos.
      </p>

      <div className="categories-list">
        {CATEGORIAS_GASTO.map((cat) => (
          <CategorySlider
            key={cat.id}
            categoria={cat}
            value={gastos[cat.id]}
            onChange={(val) => setGastos({ [cat.id]: val })}
            provincia={provincia}
          >
            {cat.esAlquiler && gastos.alquiler && parseFloat(gastos.alquiler) > 0 && (
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={!!gastos.contratoNuevo}
                  onChange={(e) =>
                    setGastos({ contratoNuevo: e.target.checked })
                  }
                />
                <span>¿Firmaste el contrato este año? (suma sellado)</span>
              </label>
            )}
          </CategorySlider>
        ))}
      </div>

      <div className="extra-sections">
        <StepAuto auto={auto} setAuto={setAuto} />
        <StepInmueble inmueble={inmueble} setInmueble={setInmueble} />
      </div>
    </div>
  );
}
