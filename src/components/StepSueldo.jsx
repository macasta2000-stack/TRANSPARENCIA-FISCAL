import { useMemo } from "react";
import { MONOTRIBUTO_2026 } from "../data/impuestos-nacionales";
import { SINDICATOS_LISTA } from "../data/sindicatos";
import { COLEGIOS_LISTA, NOTA_REFORMA_COLEGIOS } from "../data/colegios-profesionales";
import { calcularCargaSueldo } from "../utils/calcularSueldo";

function formatearPesos(n) {
  if (!n || n <= 0) return "$0";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);
}

const NIVEL_COLORS = {
  nacional: "#FF3B3B",
  sindical: "#A855F7",
  colegio: "#06B6D4",
};

export default function StepSueldo({ sueldo, setSueldo, provincia, modo }) {
  const monto = parseFloat(sueldo.monto) || 0;
  const esDependencia = sueldo.relacion === "dependencia";
  const esEmpleador = modo === "empleador";

  const carga = useMemo(() => {
    if (monto <= 0) return null;
    return calcularCargaSueldo({ ...sueldo, monto }, provincia);
  }, [sueldo, monto, provincia]);

  const sindicatoSeleccionado = SINDICATOS_LISTA.find(s => s.id === sueldo.sindicato);

  return (
    <div className="step step-sueldo">
      <h2 className="step-title">{esEmpleador ? "Salario que pagas" : "Tu sueldo"}</h2>
      <p className="step-subtitle">
        {esEmpleador
          ? "Ingresa el salario bruto que le pagas a tu empleado. Calculamos el costo real total."
          : "Empecemos por lo que ganas. Toda la info queda en tu dispositivo."}
      </p>

      {!esEmpleador && (
        <div className="field-group">
          <label className="field-label">¿Como queres ingresar tu sueldo?</label>
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
      )}

      <div className="field-group">
        <label className="field-label">{esEmpleador ? "Salario bruto mensual" : "Monto mensual"}</label>
        <div className="input-with-prefix">
          <span className="input-prefix">$</span>
          <input
            type="text"
            inputMode="numeric"
            className="main-input"
            placeholder={esEmpleador ? "Ej: 2.000.000" : "Ej: 1.200.000"}
            value={sueldo.monto}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9]/g, "");
              setSueldo({ monto: raw });
            }}
          />
        </div>
      </div>

      {!esEmpleador && (
        <div className="field-group">
          <label className="field-label">¿En que relacion laboral?</label>
          <div className="toggle-group toggle-group-3">
            <button
              className={`toggle-btn ${sueldo.relacion === "dependencia" ? "active" : ""}`}
              onClick={() => setSueldo({ relacion: "dependencia" })}
            >
              Relacion de dependencia
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
              Autonomo
            </button>
          </div>
        </div>
      )}

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

      {/* Selector de rubro/sindicato — para dependencia y empleador */}
      {(esDependencia || esEmpleador) && (
        <>
          <div className="field-group">
            <label className="field-label">{esEmpleador ? "¿En que rubro esta tu empleado?" : "¿En que rubro trabajas?"}</label>
            <select
              className="select-input"
              value={sueldo.sindicato}
              onChange={(e) => setSueldo({ sindicato: e.target.value, afiliadoSindicato: false })}
            >
              {SINDICATOS_LISTA.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre} — {s.gremio}
                </option>
              ))}
            </select>
          </div>

          {sindicatoSeleccionado && (sindicatoSeleccionado.cuota_afiliado || sindicatoSeleccionado.contribucion_solidaria) && (
            <div className="field-group">
              <label className="field-label">{esEmpleador ? "¿Tu empleado esta afiliado al sindicato?" : "¿Estas afiliado al sindicato?"}</label>
              <div className="toggle-group">
                <button
                  className={`toggle-btn small ${sueldo.afiliadoSindicato ? "active" : ""}`}
                  onClick={() => setSueldo({ afiliadoSindicato: true })}
                >
                  Sí, afiliado
                  {sindicatoSeleccionado.cuota_afiliado && (
                    <span className="toggle-sub">
                      Cuota {(sindicatoSeleccionado.cuota_afiliado.tasa * 100).toFixed(1)}%
                    </span>
                  )}
                </button>
                <button
                  className={`toggle-btn small ${!sueldo.afiliadoSindicato ? "active" : ""}`}
                  onClick={() => setSueldo({ afiliadoSindicato: false })}
                >
                  No afiliado
                  {sindicatoSeleccionado.contribucion_solidaria && (
                    <span className="toggle-sub">
                      Contrib. solidaria {(sindicatoSeleccionado.contribucion_solidaria.tasa * 100).toFixed(1)}%
                    </span>
                  )}
                </button>
              </div>
              {sindicatoSeleccionado.nota && (
                <p className="field-nota">{sindicatoSeleccionado.nota}</p>
              )}
            </div>
          )}
        </>
      )}

      {/* Selector de colegio profesional — para todos los tipos */}
      <div className="field-group">
        <label className="field-label">¿Tenés matrícula profesional?</label>
        <select
          className="select-input"
          value={sueldo.colegioProfesional}
          onChange={(e) => setSueldo({
            colegioProfesional: e.target.value,
            colegioMontoCustom: "",
            cajaMontoCustom: "",
          })}
        >
          {COLEGIOS_LISTA.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
              {c.caja_previsional ? ` — Caja: ~${Math.round(c.caja_previsional.monto_mensual / 1000)}K/mes` : ""}
            </option>
          ))}
        </select>

        {/* Campos editables para montos de colegio y caja */}
        {sueldo.colegioProfesional !== "no_aplica" && (() => {
          const col = COLEGIOS_LISTA.find(c => c.id === sueldo.colegioProfesional);
          if (!col) return null;
          return (
            <div className="colegio-montos">
              <p className="colegio-montos-hint">
                Los montos son estimados (~). Si conocés tu cuota real, editá los valores:
              </p>
              {col.cuota_mensual_estimada > 0 && (
                <div className="colegio-monto-row">
                  <label className="colegio-monto-label">Matrícula / cuota colegio</label>
                  <div className="input-with-prefix input-small">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="main-input"
                      placeholder={col.cuota_mensual_estimada.toLocaleString("es-AR")}
                      value={sueldo.colegioMontoCustom}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9]/g, "");
                        setSueldo({ colegioMontoCustom: raw });
                      }}
                    />
                    <span className="input-suffix">/mes</span>
                  </div>
                </div>
              )}
              {col.caja_previsional && (
                <div className="colegio-monto-row">
                  <label className="colegio-monto-label">{col.caja_previsional.nombre}</label>
                  <div className="input-with-prefix input-small">
                    <span className="input-prefix">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="main-input"
                      placeholder={col.caja_previsional.monto_mensual.toLocaleString("es-AR")}
                      value={sueldo.cajaMontoCustom}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9]/g, "");
                        setSueldo({ cajaMontoCustom: raw });
                      }}
                    />
                    <span className="input-suffix">/mes</span>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {sueldo.colegioProfesional !== "no_aplica" && (
          <p className="field-nota" style={{ borderLeftColor: "#06B6D4" }}>
            {NOTA_REFORMA_COLEGIOS}
          </p>
        )}
      </div>

      {/* Preview de retenciones en tiempo real */}
      {carga && carga.total_mensual > 0 && (
        <div className="sueldo-preview">
          <div className="sueldo-preview-header">
            <span className="sueldo-preview-title">{esEmpleador ? "Costo total de este empleado" : "Lo que te sacan de tu sueldo"}</span>
            <span className="sueldo-preview-total">{formatearPesos(carga.total_mensual)}/mes</span>
          </div>

          <div className="sueldo-preview-body">
            {/* Aportes del empleado */}
            {carga.items.filter(i => i.grupo === "empleado").length > 0 && (
              <div className="sueldo-preview-group">
                <span className="sueldo-preview-group-label">{esEmpleador ? "Le descuentan al empleado del recibo" : "Te descuentan del recibo"}</span>
                {carga.items.filter(i => i.grupo === "empleado").map((item, idx) => (
                  <div key={idx} className="sueldo-preview-row">
                    <span className="sueldo-preview-dot" style={{ background: NIVEL_COLORS[item.nivel] || "#FF3B3B" }} />
                    <span className="sueldo-preview-name">
                      {item.nombre}
                      {item.tasa ? ` (${(item.tasa * 100).toFixed(1)}%)` : ""}
                    </span>
                    <span className="sueldo-preview-amount">{formatearPesos(item.monto)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Sindicales */}
            {carga.items.filter(i => i.grupo === "sindical").length > 0 && (
              <div className="sueldo-preview-group">
                <span className="sueldo-preview-group-label">Descuento sindical</span>
                {carga.items.filter(i => i.grupo === "sindical").map((item, idx) => (
                  <div key={idx} className="sueldo-preview-row">
                    <span className="sueldo-preview-dot" style={{ background: NIVEL_COLORS.sindical }} />
                    <span className="sueldo-preview-name">
                      {item.nombre}
                      {item.tasa ? ` (${(item.tasa * 100).toFixed(1)}%)` : ""}
                    </span>
                    <span className="sueldo-preview-amount">{formatearPesos(item.monto)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Colegios profesionales */}
            {carga.items.filter(i => i.grupo === "colegio").length > 0 && (
              <div className="sueldo-preview-group">
                <span className="sueldo-preview-group-label">Colegio profesional + caja previsional</span>
                {carga.items.filter(i => i.grupo === "colegio").map((item, idx) => (
                  <div key={idx} className="sueldo-preview-row">
                    <span className="sueldo-preview-dot" style={{ background: NIVEL_COLORS.colegio }} />
                    <span className="sueldo-preview-name">{item.nombre}</span>
                    <span className="sueldo-preview-amount">{formatearPesos(item.monto)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Patronales (lo que nunca ves) */}
            {carga.items.filter(i => i.grupo === "patronal").length > 0 && (
              <div className="sueldo-preview-group">
                <span className="sueldo-preview-group-label">{esEmpleador ? "Lo que vos pagas encima del bruto" : "Lo que nunca ves (paga tu empleador)"}</span>
                {carga.items.filter(i => i.grupo === "patronal").map((item, idx) => (
                  <div key={idx} className="sueldo-preview-row patronal">
                    <span className="sueldo-preview-dot" style={{ background: NIVEL_COLORS[item.nivel] || "#FF3B3B" }} />
                    <span className="sueldo-preview-name">
                      {item.nombre}
                      {item.tasa ? ` (${(item.tasa * 100).toFixed(1)}%)` : ""}
                    </span>
                    <span className="sueldo-preview-amount">{formatearPesos(item.monto)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resumen claro */}
          <div className="sueldo-preview-summary">
            {carga.bruto !== monto && sueldo.tipo === "neto" && (
              <div className="sueldo-summary-row">
                <span>Tu sueldo bruto (antes de descuentos)</span>
                <span className="sueldo-summary-val">{formatearPesos(carga.bruto)}</span>
              </div>
            )}
            <div className="sueldo-summary-row">
              <span>{esEmpleador ? "Le descuentan al empleado del recibo" : "Te descuentan del recibo (lo que VOS perdes)"}</span>
              <span className="sueldo-summary-val accent">{formatearPesos(carga.aportes_empleado + (carga.sindical || 0))}</span>
            </div>
            <div className="sueldo-summary-row">
              <span>{esEmpleador ? "Lo que VOS pagas encima del bruto (cargas patronales)" : "Tu empleador paga extra sin que lo veas"}</span>
              <span className="sueldo-summary-val">{formatearPesos(carga.contribuciones_patronales)}</span>
            </div>
            <div className="sueldo-summary-row subtle">
              <span>{esEmpleador ? "COSTO TOTAL que te sale este empleado" : "Costo total para tu empleador"}</span>
              <span className="sueldo-summary-val">{formatearPesos(carga.costoTotalEmpleador)}</span>
            </div>
            <div className="sueldo-summary-row highlight">
              <span>TOTAL que se lleva el sistema</span>
              <span className="sueldo-summary-val accent">{formatearPesos(carga.total_mensual)}</span>
            </div>
            {carga.costoTotalEmpleador > 0 && (
              <div className="sueldo-summary-pct">
                {esEmpleador
                  ? <>De cada $100 que destinas a este empleado, <strong>${Math.round((carga.total_mensual / carga.costoTotalEmpleador) * 100)}</strong> se los lleva el sistema. Al empleado le llegan <strong>${Math.round(((carga.costoTotalEmpleador - carga.total_mensual) / carga.costoTotalEmpleador) * 100)}</strong>.</>
                  : <>De cada $100 que cuesta tu trabajo, <strong>${Math.round((carga.total_mensual / carga.costoTotalEmpleador) * 100)}</strong> se los lleva el sistema. Vos recibis <strong>${Math.round(((carga.costoTotalEmpleador - carga.total_mensual) / carga.costoTotalEmpleador) * 100)}</strong>.</>
                }
              </div>
            )}
            {!esEmpleador && (
              <div className="sueldo-summary-nota">
                <strong>¿Por que todo es nacional?</strong> En Argentina, los aportes y contribuciones salariales van todos a ANSES/AFIP (nivel nacional). La provincia y el municipio te cobran cuando GASTAS tu sueldo: IIBB, TISH, tasa vial, etc. Eso lo calculamos en el paso de gastos.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
