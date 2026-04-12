import { useState, useRef } from "react";
import ShareCard from "./ShareCard";
import { generarCard, compartirCard, descargarCard } from "../utils/generarCard";
import { IIBB } from "../data/impuestos-provinciales";

function formatPesos(n) {
  if (!n && n !== 0) return "$0";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);
}

function getMensajeImpacto(porcentaje) {
  if (porcentaje > 0.45)
    return "Trabajás más de la mitad del año para financiar al Estado.";
  if (porcentaje > 0.4)
    return "4 de cada 10 pesos que generás van al Estado antes de que los veas.";
  if (porcentaje > 0.35)
    return "Casi 4 meses al año trabajás exclusivamente para pagar impuestos.";
  return "Una parte significativa de tu ingreso se destina a impuestos.";
}

function DetalleConsumo({ cargaConsumo }) {
  const categorias = Object.entries(cargaConsumo.por_categoria).filter(
    ([, v]) => v.impuesto > 0
  );
  if (categorias.length === 0) return null;

  return (
    <div className="desglose-sub">
      {categorias.map(([key, val]) => (
        <div key={key} className="desglose-sub-row">
          <span className="desglose-sub-label">{val.label}</span>
          <span className="desglose-sub-monto">{formatPesos(val.impuesto)}</span>
        </div>
      ))}
    </div>
  );
}

export default function ResultadoFinal({ resultado, provincia, reiniciar }) {
  const [showFuentes, setShowFuentes] = useState(false);
  const [compartiendo, setCompartiendo] = useState(false);
  const cardRef = useRef(null);

  if (!resultado) return null;

  const {
    taxFreedomDay,
    porcentaje,
    totalMensual,
    totalAnual,
    ingresoBrutoTotal,
    desglose,
  } = resultado;

  const porcRedondeado = Math.round(porcentaje * 100);

  const handleCompartir = async () => {
    setCompartiendo(true);
    try {
      const blob = await generarCard(cardRef.current);
      if (blob) {
        const texto = `Trabajo para el Estado hasta el ${taxFreedomDay.fecha}. De cada $100, $${porcRedondeado} son impuestos. Calculá el tuyo en hastacuando.ar`;
        const shared = await compartirCard(blob, texto);
        if (!shared) {
          descargarCard(blob);
        }
      }
    } catch {
      // Fallback: try download
    }
    setCompartiendo(false);
  };

  const provinciaIIBB = IIBB[provincia];

  return (
    <div className="step step-resultado">
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

      <div className="desglose">
        <h3 className="desglose-titulo">DESGLOSE</h3>

        {desglose.cargaSueldo.contribuciones_patronales > 0 && (
          <div className="desglose-row">
            <div className="desglose-info">
              <span className="desglose-label">
                Lo que nunca viste (cargas patronales)
              </span>
              <span className="desglose-hint">
                Tu empleador pagó {formatPesos(desglose.cargaSueldo.contribuciones_patronales)}{" "}
                extra que vos nunca viste. Ese dinero también es tuyo.
              </span>
            </div>
            <span className="desglose-monto">
              {formatPesos(desglose.cargaSueldo.contribuciones_patronales)}
            </span>
          </div>
        )}

        <div className="desglose-row">
          <div className="desglose-info">
            <span className="desglose-label">
              Lo que te descontaron del sueldo
            </span>
          </div>
          <span className="desglose-monto">
            {formatPesos(
              desglose.cargaSueldo.aportes_empleado + desglose.cargaSueldo.ganancias
            )}
          </span>
        </div>

        {desglose.cargaConsumo.total_mensual > 0 && (
          <div className="desglose-row desglose-row-expandable">
            <div className="desglose-info">
              <span className="desglose-label">
                Impuestos en tu canasta de consumo
              </span>
            </div>
            <span className="desglose-monto">
              {formatPesos(desglose.cargaConsumo.total_mensual)}
            </span>
            <DetalleConsumo cargaConsumo={desglose.cargaConsumo} />
          </div>
        )}

        {desglose.cargaAuto > 0 && (
          <div className="desglose-row">
            <div className="desglose-info">
              <span className="desglose-label">Automotor / patente</span>
            </div>
            <span className="desglose-monto">
              {formatPesos(desglose.cargaAuto)}
            </span>
          </div>
        )}

        {desglose.cargaInmueble > 0 && (
          <div className="desglose-row">
            <div className="desglose-info">
              <span className="desglose-label">ABL / Inmobiliario</span>
            </div>
            <span className="desglose-monto">
              {formatPesos(desglose.cargaInmueble)}
            </span>
          </div>
        )}

        <div className="desglose-total">
          <div className="desglose-total-row">
            <span>TOTAL IMPUESTOS / MES</span>
            <span className="desglose-total-monto">
              {formatPesos(totalMensual)}
            </span>
          </div>
          <div className="desglose-total-row">
            <span>TOTAL IMPUESTOS / AÑO</span>
            <span className="desglose-total-monto accent">
              {formatPesos(totalAnual)}
            </span>
          </div>
          <div className="desglose-total-row subtle">
            <span>COSTO TOTAL EMPLEADOR / MES</span>
            <span>{formatPesos(ingresoBrutoTotal)}</span>
          </div>
        </div>
      </div>

      <div className="resultado-actions">
        <button
          className="btn btn-primary btn-share"
          onClick={handleCompartir}
          disabled={compartiendo}
        >
          {compartiendo ? "Generando..." : "COMPARTIR MI RESULTADO"}
        </button>
        <button className="btn btn-secondary" onClick={reiniciar}>
          RECALCULAR
        </button>
      </div>

      <div className="resultado-fuentes">
        <button
          className="fuentes-toggle"
          onClick={() => setShowFuentes(!showFuentes)}
        >
          {showFuentes ? "▾" : "▸"} Ver fuentes y metodología
        </button>
        {showFuentes && (
          <div className="fuentes-list">
            <p>Los cálculos son estimaciones basadas en normativa vigente:</p>
            <ul>
              <li>Aportes y contribuciones: Ley 24.241, Ley 23.660, Ley 19.032</li>
              <li>IVA: Ley 23.349 (21% general, 10.5% reducida)</li>
              <li>Ganancias 4ta categoría: Ley 20.628, actualización 2026</li>
              <li>Impuesto a los combustibles: Ley 23.966</li>
              <li>Monotributo: Ley 24.977, valores 2026</li>
              {provinciaIIBB && <li>IIBB: {provinciaIIBB.fuente}</li>}
            </ul>
            <p className="disclaimer">
              Los cálculos son estimaciones basadas en normativa vigente. Pueden
              variar según situación particular. Esta herramienta no constituye
              asesoramiento fiscal.
            </p>
          </div>
        )}
      </div>

      {/* Hidden share card for html2canvas */}
      <div className="share-card-container" aria-hidden="true">
        <ShareCard
          ref={cardRef}
          taxFreedomDay={taxFreedomDay}
          porcentaje={porcRedondeado}
        />
      </div>
    </div>
  );
}
