import { useState, useRef } from "react";
import ShareCard from "./ShareCard";
import { generarCard, compartirCard, descargarCard } from "../utils/generarCard";

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
  if (porcentaje > 0.45) return "Trabajás más de la mitad del año para financiar al Estado.";
  if (porcentaje > 0.40) return "4 de cada 10 pesos que generás van al Estado antes de que los veas.";
  if (porcentaje > 0.35) return "Casi 4 meses al año trabajás exclusivamente para pagar impuestos.";
  return "Una parte significativa de tu ingreso se destina a impuestos.";
}

const NIVEL_COLORS = {
  nacional: "#FF3B3B",
  provincial: "#FF8C00",
  municipal: "#FFD600",
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
                <span className="nivel-item-nombre">{item.nombre}</span>
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

export default function ResultadoFinal({ resultado, provincia, reiniciar }) {
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
        const texto = `Trabajo para el Estado hasta el ${taxFreedomDay.fecha}. De cada $100, $${porcRedondeado} son impuestos. Calculá el tuyo en hastacuando.ar`;
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
        <p className="resultado-pre">TRABAJÁS PARA EL ESTADO HASTA EL</p>
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
