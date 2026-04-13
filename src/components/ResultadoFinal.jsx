import { useState, useRef } from "react";
import ShareCard from "./ShareCard";
import { generarCard, compartirCard, descargarCard } from "../utils/generarCard";
import { CUNA_FISCAL_PAISES } from "../data/comparacion-internacional";
import { IIBB, EXENCIONES_PROVINCIALES } from "../data/impuestos-provinciales";

function fmt(n) {
  if (!n && n !== 0) return "$0";
  return new Intl.NumberFormat("es-AR", {
    style: "currency", currency: "ARS", maximumFractionDigits: 0,
  }).format(n);
}

function pct(n) {
  return `${(n * 100).toFixed(1)}%`;
}

function getMensajeImpacto(porcentaje) {
  if (porcentaje > 0.45) return "Trabajás más de la mitad del año para financiar al sistema. Estado, sindicatos y colegios se llevan tu plata.";
  if (porcentaje > 0.40) return "4 de cada 10 pesos que generás se los lleva el sistema antes de que los veas.";
  if (porcentaje > 0.35) return "Casi 4 meses al año trabajás exclusivamente para mantener al sistema.";
  return "Una parte significativa de tu ingreso se la lleva el sistema obligatoriamente.";
}

const NIVEL_COLORS = {
  nacional: "#FF3B3B",
  provincial: "#FF8C00",
  municipal: "#FFD600",
  sindical: "#A855F7",
  colegio: "#06B6D4",
};

function NivelSection({ titulo, color, total, items, totalGeneral }) {
  const [expanded, setExpanded] = useState(false);
  if (total <= 0) return null;
  const porcentajeDelTotal = totalGeneral > 0 ? (total / totalGeneral) * 100 : 0;

  return (
    <div className="nivel-section">
      <button className="nivel-header" onClick={() => setExpanded(!expanded)}>
        <span className="nivel-dot-big" style={{ background: color }} />
        <div className="nivel-info">
          <span className="nivel-titulo">{titulo}</span>
          <span className="nivel-pct">{porcentajeDelTotal.toFixed(0)}% de tus impuestos</span>
        </div>
        <span className="nivel-monto">{fmt(total)}</span>
        <span className="expand-arrow">{expanded ? "▾" : "▸"}</span>
      </button>

      {expanded && (
        <div className="nivel-items">
          {items.map((item, i) => (
            <div key={i} className="nivel-item">
              <div className="nivel-item-info">
                <span className="nivel-item-nombre">
                  {item.nombre}
                  {item.auditado === false && <span className="badge-estimado" title="Dato estimado, pendiente de auditoria"> ~</span>}
                </span>
                {item.normativa && (
                  <span className="nivel-item-normativa">{item.normativa}</span>
                )}
                {item.nota && (
                  <span className="nivel-item-nota">{item.nota}</span>
                )}
              </div>
              <span className="nivel-item-monto">{fmt(item.monto)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CunaFiscalWaterfall({ cunaFiscal, modo }) {
  if (!cunaFiscal) return null;
  const { costoEmpleador, salarioBruto, netoBolsillo, poderCompraReal, cunaLaboral, cunaTotal, sacMensual, deduccionesEmpleado, impuestosConsumo } = cunaFiscal;
  const maxVal = costoEmpleador;
  const barWidth = (v) => `${Math.max((v / maxVal) * 100, 2)}%`;

  const isEmpleador = modo === "empleador";

  return (
    <div className="cuna-fiscal">
      <h3 className="desglose-titulo">
        {isEmpleador ? "COSTO REAL DE CONTRATAR" : "CUNA FISCAL: DEL EMPLEADOR A TU BOLSILLO"}
      </h3>
      <p className="cuna-subtitle">
        {isEmpleador
          ? "Cada peso que destinas a un empleado se reparte asi:"
          : "Asi se achica tu sueldo en cada etapa del camino:"}
      </p>

      <div className="cuna-bars">
        <div className="cuna-row">
          <span className="cuna-label">Costo empleador</span>
          <div className="cuna-bar-track">
            <div className="cuna-bar" style={{ width: barWidth(costoEmpleador), background: "#ef4444" }} />
          </div>
          <span className="cuna-value">{fmt(costoEmpleador)}</span>
        </div>
        <div className="cuna-row">
          <span className="cuna-label">Salario bruto</span>
          <div className="cuna-bar-track">
            <div className="cuna-bar" style={{ width: barWidth(salarioBruto), background: "#f97316" }} />
          </div>
          <span className="cuna-value">{fmt(salarioBruto)}</span>
        </div>
        <div className="cuna-row">
          <span className="cuna-label">Neto de bolsillo</span>
          <div className="cuna-bar-track">
            <div className="cuna-bar" style={{ width: barWidth(netoBolsillo), background: "#eab308" }} />
          </div>
          <span className="cuna-value">{fmt(netoBolsillo)}</span>
        </div>
        <div className="cuna-row">
          <span className="cuna-label">Poder de compra real</span>
          <div className="cuna-bar-track">
            <div className="cuna-bar" style={{ width: barWidth(poderCompraReal), background: "#22c55e" }} />
          </div>
          <span className="cuna-value">{fmt(poderCompraReal)}</span>
        </div>
      </div>

      <div className="cuna-metrics">
        <div className="cuna-metric">
          <span className="cuna-metric-label">Cuna fiscal laboral</span>
          <span className="cuna-metric-value accent">{pct(cunaLaboral)}</span>
          <span className="cuna-metric-detail">
            De cada ${Math.round(costoEmpleador / (salarioBruto || 1) * 100)} que paga el empleador, el trabajador recibe ${Math.round(netoBolsillo / (costoEmpleador || 1) * 100)}
          </span>
        </div>
        <div className="cuna-metric">
          <span className="cuna-metric-label">Cuna fiscal total (con consumo)</span>
          <span className="cuna-metric-value accent">{pct(cunaTotal)}</span>
          <span className="cuna-metric-detail">
            Incluyendo IVA, IIBB y tasas municipales sobre lo que compras
          </span>
        </div>
      </div>

      <div className="cuna-breakdown">
        <div className="cuna-flow-item lost">Cargas patronales + SAC: {fmt(costoEmpleador - salarioBruto)}</div>
        <div className="cuna-flow-item lost">Aportes + Ganancias + Sindical: {fmt(deduccionesEmpleado)}</div>
        <div className="cuna-flow-item lost">Impuestos al consumo: {fmt(impuestosConsumo)}</div>
      </div>
    </div>
  );
}

function ComparacionInternacional({ cunaLaboral }) {
  // Insert Argentina dynamically
  const paisesConArg = [
    ...CUNA_FISCAL_PAISES.map(p => ({
      ...p,
      esArgentina: false,
    })),
    {
      pais: "Argentina",
      bandera: "\u{1F1E6}\u{1F1F7}",
      cuna: cunaLaboral || 0.45,
      fuente: "Tu calculo",
      esArgentina: true,
    },
  ].sort((a, b) => b.cuna - a.cuna);

  const maxCuna = Math.max(...paisesConArg.map(p => p.cuna));

  return (
    <div className="comparacion-intl">
      <h3 className="desglose-titulo">COMPARACION INTERNACIONAL</h3>
      <p className="cuna-subtitle">Tu cuna fiscal vs el mundo (trabajador soltero, salario promedio)</p>

      <div className="intl-bars">
        {paisesConArg.map((p) => (
          <div key={p.pais} className={`intl-row ${p.esArgentina ? "intl-highlight" : ""}`}>
            <span className="intl-flag">{p.bandera}</span>
            <span className="intl-pais">{p.pais}</span>
            <div className="intl-bar-track">
              <div
                className="intl-bar"
                style={{
                  width: `${(p.cuna / maxCuna) * 100}%`,
                  background: p.esArgentina ? "#ef4444" : p.pais === "Promedio OCDE" ? "#3b82f6" : "#64748b",
                }}
              />
            </div>
            <span className="intl-pct">{pct(p.cuna)}</span>
          </div>
        ))}
      </div>
      <p className="intl-source">Fuente: OECD Taxing Wages 2024, Banco Mundial, IARAF. Argentina: tu calculo personalizado.</p>
    </div>
  );
}

function DesgloseTradicional({ desglose }) {
  const [expanded, setExpanded] = useState(false);
  const { cargaSueldo, cargaConsumo, cargaAutoDetalle, cargaInmuebleDetalle } = desglose;

  return (
    <div className="desglose-tradicional">
      <button className="desglose-trad-toggle" onClick={() => setExpanded(!expanded)}>
        {expanded ? "▾" : "▸"} Ver desglose por categoría
      </button>

      {expanded && (
        <div className="desglose-trad-content">
          {/* Sueldo */}
          {cargaSueldo.contribuciones_patronales > 0 && (
            <DesgloseRow
              label="Lo que nunca viste (cargas patronales)"
              monto={cargaSueldo.contribuciones_patronales}
              hint={`Tu empleador pagó ${fmt(cargaSueldo.contribuciones_patronales)} extra que vos nunca viste. Ese dinero también es tuyo.`}
              items={cargaSueldo.items.filter(i => i.grupo === "patronal")}
            />
          )}
          <DesgloseRow
            label="Lo que te descontaron del sueldo"
            monto={cargaSueldo.aportes_empleado}
            items={cargaSueldo.items.filter(i => i.grupo === "empleado" || !i.grupo)}
          />
          {cargaSueldo.sindical > 0 && (
            <DesgloseRow
              label="Descuento sindical / colegio"
              monto={cargaSueldo.sindical}
              hint="Te lo descuentan del recibo aunque no estés afiliado (contribución solidaria)."
              items={cargaSueldo.items.filter(i => i.grupo === "sindical")}
            />
          )}

          {/* Consumo */}
          {cargaConsumo.total_mensual > 0 && (
            <div className="desglose-row">
              <div className="desglose-info">
                <span className="desglose-label">Impuestos en tu canasta de consumo</span>
              </div>
              <span className="desglose-monto">{fmt(cargaConsumo.total_mensual)}</span>
              <div className="desglose-sub">
                {Object.entries(cargaConsumo.por_categoria)
                  .filter(([, v]) => v.impuesto > 0)
                  .map(([key, val]) => (
                    <div key={key} className="desglose-sub-row">
                      <span className="desglose-sub-label">{val.label}</span>
                      <span className="desglose-sub-monto">{fmt(val.impuesto)}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Auto */}
          {cargaAutoDetalle?.total > 0 && (
            <DesgloseRow
              label="Automotor / patente / seguro"
              monto={cargaAutoDetalle.total}
              items={cargaAutoDetalle.items}
            />
          )}

          {/* Inmueble */}
          {cargaInmuebleDetalle?.total > 0 && (
            <DesgloseRow
              label="ABL / Inmobiliario"
              monto={cargaInmuebleDetalle.total}
              items={cargaInmuebleDetalle.items}
            />
          )}
        </div>
      )}
    </div>
  );
}

function DesgloseRow({ label, monto, hint, items }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="desglose-row">
      <button className="desglose-row-header" onClick={() => setExpanded(!expanded)}>
        <div className="desglose-info">
          <span className="desglose-label">{label}</span>
          {hint && <span className="desglose-hint">{hint}</span>}
        </div>
        <span className="desglose-monto">{fmt(monto)}</span>
        {items?.length > 0 && <span className="expand-arrow">{expanded ? "▾" : "▸"}</span>}
      </button>
      {expanded && items?.length > 0 && (
        <div className="nivel-items">
          {items.map((item, i) => (
            <div key={i} className="nivel-item">
              <div className="nivel-item-info">
                <span className="nivel-item-nombre">{item.nombre}</span>
                {item.normativa && <span className="nivel-item-normativa">{item.normativa}</span>}
              </div>
              <span className="nivel-item-monto">{fmt(item.monto)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ResultadoFinal({ resultado, provincia, modo, reiniciar }) {
  const [showFuentes, setShowFuentes] = useState(false);
  const [compartiendo, setCompartiendo] = useState(false);
  const cardRef = useRef(null);

  if (!resultado) return null;

  const {
    taxFreedomDay, porcentaje, totalMensual, totalAnual,
    ingresoBrutoTotal, porNivel, costosRegulatorios, desglose,
  } = resultado;

  const porcRedondeado = Math.round(porcentaje * 100);

  const handleCompartir = async () => {
    setCompartiendo(true);
    try {
      const blob = await generarCard(cardRef.current);
      if (blob) {
        const texto = `Trabajo para el sistema hasta el ${taxFreedomDay.fecha}. De cada $100, $${porcRedondeado} se los lleva el sistema. Calculá el tuyo en hastacuando.ar`;
        const shared = await compartirCard(blob, texto);
        if (!shared) descargarCard(blob);
      }
    } catch { /* fallback silencioso */ }
    setCompartiendo(false);
  };

  return (
    <div className="step step-resultado">
      {/* HERO */}
      <div className="resultado-hero">
        <p className="resultado-pre">
          {modo === "empleador" ? "DE LO QUE PAGAS POR TU EMPLEADO, EL SISTEMA SE QUEDA CON EL EQUIVALENTE A TRABAJAR HASTA EL" :
           modo === "sueldo" ? "DE TU SUELDO, TRABAJAS PARA EL SISTEMA HASTA EL" :
           modo === "gastos" ? "DE TUS GASTOS, SE VA EN IMPUESTOS EL EQUIVALENTE A TRABAJAR HASTA EL" :
           "TRABAJAS PARA EL SISTEMA HASTA EL"}
        </p>
        <h1 className="resultado-fecha">
          <span className="resultado-dia">{taxFreedomDay.dia}</span>
          <span className="resultado-de">DE</span>
          <span className="resultado-mes">{taxFreedomDay.mes.toUpperCase()}</span>
        </h1>
        <p className="resultado-resumen">
          De cada <strong>$100</strong> que generás,{" "}
          <strong className="accent">${porcRedondeado}</strong> son impuestos.
        </p>
        <p className="resultado-impacto">{getMensajeImpacto(porcentaje)}</p>
      </div>

      {/* BANNER DATOS ESTIMADOS */}
      {provincia && IIBB[provincia] && !IIBB[provincia].auditado && (
        <div className="datos-estimados-banner">
          <span className="datos-estimados-icon">~</span>
          <div className="datos-estimados-text">
            <strong>Datos provinciales estimados</strong>
            <span>Las alicuotas de IIBB y tasas municipales de esta provincia son estimaciones basadas en codigos fiscales. Los datos auditados contra la ley tarifaria vigente estan disponibles para CABA, Buenos Aires, Cordoba, Santa Fe y Mendoza.</span>
          </div>
        </div>
      )}

      {/* EXENCIONES PROVINCIALES */}
      {provincia && EXENCIONES_PROVINCIALES[provincia] && (
        <div className="exenciones-banner">
          <span className="exenciones-icon">i</span>
          <div className="exenciones-text">
            <strong>Exenciones y regimenes especiales en {EXENCIONES_PROVINCIALES[provincia].fuente ? provincia.replace(/_/g, ' ') : "esta provincia"}</strong>
            <span>{EXENCIONES_PROVINCIALES[provincia].nota}</span>
            {EXENCIONES_PROVINCIALES[provincia].fuente && (
              <span className="exenciones-fuente">Fuente: {EXENCIONES_PROVINCIALES[provincia].fuente}</span>
            )}
          </div>
        </div>
      )}

      {/* DESGLOSE POR NIVEL DE GOBIERNO */}
      <div className="desglose">
        <h3 className="desglose-titulo">¿QUIÉN TE COBRA QUÉ?</h3>

        <div className="nivel-bar">
          {porNivel.nacional.total > 0 && (
            <div
              className="nivel-bar-segment"
              style={{
                width: `${(porNivel.nacional.total / totalMensual) * 100}%`,
                background: NIVEL_COLORS.nacional,
              }}
              title={`Nación: ${fmt(porNivel.nacional.total)}`}
            />
          )}
          {porNivel.provincial.total > 0 && (
            <div
              className="nivel-bar-segment"
              style={{
                width: `${(porNivel.provincial.total / totalMensual) * 100}%`,
                background: NIVEL_COLORS.provincial,
              }}
              title={`Provincia: ${fmt(porNivel.provincial.total)}`}
            />
          )}
          {porNivel.municipal.total > 0 && (
            <div
              className="nivel-bar-segment"
              style={{
                width: `${(porNivel.municipal.total / totalMensual) * 100}%`,
                background: NIVEL_COLORS.municipal,
              }}
              title={`Municipio: ${fmt(porNivel.municipal.total)}`}
            />
          )}
          {porNivel.sindical.total > 0 && (
            <div
              className="nivel-bar-segment"
              style={{
                width: `${(porNivel.sindical.total / totalMensual) * 100}%`,
                background: NIVEL_COLORS.sindical,
              }}
              title={`Sindical: ${fmt(porNivel.sindical.total)}`}
            />
          )}
          {porNivel.colegio.total > 0 && (
            <div
              className="nivel-bar-segment"
              style={{
                width: `${(porNivel.colegio.total / totalMensual) * 100}%`,
                background: NIVEL_COLORS.colegio,
              }}
              title={`Colegios: ${fmt(porNivel.colegio.total)}`}
            />
          )}
        </div>

        <NivelSection
          titulo="NACIÓN"
          color={NIVEL_COLORS.nacional}
          total={porNivel.nacional.total}
          items={porNivel.nacional.items}
          totalGeneral={totalMensual}
        />
        <NivelSection
          titulo="PROVINCIA"
          color={NIVEL_COLORS.provincial}
          total={porNivel.provincial.total}
          items={porNivel.provincial.items}
          totalGeneral={totalMensual}
        />
        <NivelSection
          titulo="MUNICIPIO"
          color={NIVEL_COLORS.municipal}
          total={porNivel.municipal.total}
          items={porNivel.municipal.items}
          totalGeneral={totalMensual}
        />
        <NivelSection
          titulo="SINDICATOS"
          color={NIVEL_COLORS.sindical}
          total={porNivel.sindical.total}
          items={porNivel.sindical.items}
          totalGeneral={totalMensual}
        />
        <NivelSection
          titulo="COLEGIOS Y CAJAS PROFESIONALES"
          color={NIVEL_COLORS.colegio}
          total={porNivel.colegio.total}
          items={porNivel.colegio.items}
          totalGeneral={totalMensual}
        />
      </div>

      {/* COSTOS REGULATORIOS */}
      {costosRegulatorios.length > 0 && (
        <div className="regulatorios">
          <h3 className="desglose-titulo">COSTOS REGULATORIOS</h3>
          <p className="regulatorios-intro">
            No son impuestos, pero son costos obligatorios que el Estado te impone:
          </p>
          {costosRegulatorios.map((cr, i) => (
            <div key={i} className="regulatorio-row">
              <div className="regulatorio-info">
                <span className="regulatorio-nombre">{cr.nombre}</span>
                {cr.normativa && <span className="regulatorio-normativa">{cr.normativa}</span>}
                {cr.nota && <span className="regulatorio-nota">{cr.nota}</span>}
              </div>
              <span className="regulatorio-monto">{fmt(cr.montoMensual)}/mes</span>
            </div>
          ))}
        </div>
      )}

      {/* CUÑA FISCAL WATERFALL */}
      {resultado.cunaFiscal && (
        <CunaFiscalWaterfall cunaFiscal={resultado.cunaFiscal} modo={modo} />
      )}

      {/* COMPARACIÓN INTERNACIONAL */}
      {resultado.cunaFiscal && (
        <ComparacionInternacional cunaLaboral={resultado.cunaFiscal.cunaLaboral} />
      )}

      {/* DESGLOSE POR CATEGORÍA (colapsado) */}
      <DesgloseTradicional desglose={desglose} />

      {/* TOTALES */}
      <div className="desglose-total">
        <div className="desglose-total-row">
          <span>TOTAL IMPUESTOS / MES</span>
          <span className="desglose-total-monto">{fmt(totalMensual)}</span>
        </div>
        <div className="desglose-total-row">
          <span>TOTAL IMPUESTOS / AÑO</span>
          <span className="desglose-total-monto accent">{fmt(totalAnual)}</span>
        </div>
        <div className="desglose-total-row subtle">
          <span>COSTO TOTAL EMPLEADOR / MES</span>
          <span>{fmt(ingresoBrutoTotal)}</span>
        </div>
        <div className="desglose-total-row subtle">
          <span>PRESIÓN FISCAL EFECTIVA</span>
          <span>{pct(porcentaje)}</span>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="resultado-actions">
        <button className="btn btn-primary btn-share" onClick={handleCompartir} disabled={compartiendo}>
          {compartiendo ? "Generando..." : "COMPARTIR MI RESULTADO"}
        </button>
        <button className="btn btn-secondary" onClick={reiniciar}>RECALCULAR</button>
      </div>

      {/* FUENTES */}
      <div className="resultado-fuentes">
        <button className="fuentes-toggle" onClick={() => setShowFuentes(!showFuentes)}>
          {showFuentes ? "▾" : "▸"} Ver fuentes y metodología
        </button>
        {showFuentes && (
          <div className="fuentes-list">
            <p>Los cálculos son estimaciones basadas en normativa vigente:</p>
            <ul>
              <li>Aportes y contribuciones: Ley 24.241, Ley 23.660, Ley 19.032</li>
              <li>IVA: Ley 23.349 (21% general, 10.5% reducida)</li>
              <li>Ganancias 4ta categoría: Ley 20.628, modif. Ley 27.743</li>
              <li>Imp. Combustibles: Ley 23.966, Título III</li>
              <li>Imp. Internos Telecom: Ley 24.674</li>
              <li>Imp. Débitos/Créditos: Ley 25.413</li>
              <li>Monotributo: Ley 24.977, modif. Ley 27.618</li>
              <li>IIBB/Sellos: Códigos Fiscales y Leyes Tarifarias provinciales</li>
              <li>Tasas municipales: Ordenanzas fiscales de cada jurisdicción</li>
              <li>Servicios regulados: Ley 24.065 (elect.), Ley 24.076 (gas), Ley 26.221 (agua)</li>
              <li>Seguros: Ley 17.418, Res. SSN 21.999</li>
              <li>VTV: Ley 24.449</li>
              <li>Cuotas sindicales: Convenios Colectivos de Trabajo (homologados MTSS)</li>
              <li>Contribución solidaria: Art. 37 Ley 23.551 (Asociaciones Sindicales)</li>
            </ul>
            <p className="disclaimer">
              Los cálculos son estimaciones basadas en normativa vigente al 2026.
              Pueden variar según situación particular. Las tasas municipales son
              promedios y pueden diferir por municipio. Los costos regulatorios
              son estimaciones y no constituyen impuestos en sentido estricto.
              Esta herramienta no constituye asesoramiento fiscal.
            </p>
          </div>
        )}
      </div>

      {/* Hidden share card */}
      <div className="share-card-container" aria-hidden="true">
        <ShareCard ref={cardRef} taxFreedomDay={taxFreedomDay} porcentaje={porcRedondeado} />
      </div>
    </div>
  );
}
