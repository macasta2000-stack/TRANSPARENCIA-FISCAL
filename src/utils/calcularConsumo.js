import { IVA, IMPUESTO_INTERNO_TELECOM, TASA_CNC, IMPUESTO_DEBITOS_CREDITOS } from "../data/impuestos-nacionales";
import { IIBB } from "../data/impuestos-provinciales";
import { TISH_ESTIMADA } from "../data/impuestos-municipales";
import { CATEGORIAS_GASTO } from "../data/categorias-gasto";

function calcularImpuestoNafta(gastoNafta) {
  // Approximately 55% of pump price is taxes
  // IVA 21% + transfer tax + infrastructure tax
  // Simplified: ~45% of what you pay is the base price, ~55% is taxes
  const porcentajeImpuestos = 0.55;
  return gastoNafta * porcentajeImpuestos;
}

function calcularImpuestoTelecom(gasto, provincia) {
  const tasaIIBB = IIBB[provincia]?.telecom || 0.04;
  // Base price before taxes
  // Total = base * (1 + IVA) * (1 + impuesto_interno) * (1 + IIBB) * (1 + tasa_cnc)
  // We reverse-engineer taxes from the final price
  const factorImpuestos = (1 + IVA.general) * (1 + IMPUESTO_INTERNO_TELECOM) * (1 + tasaIIBB) * (1 + TASA_CNC);
  const precioBase = gasto / factorImpuestos;
  return gasto - precioBase;
}

export function calcularImpuestoCategoria(categoriaId, monto, provincia) {
  if (!monto || monto <= 0) return 0;

  const categoria = CATEGORIAS_GASTO.find((c) => c.id === categoriaId);
  if (!categoria) return 0;

  // Nafta has special calculation
  if (categoria.esNafta) {
    return calcularImpuestoNafta(monto);
  }

  // Telecom has special calculation (internal tax)
  if (categoria.esTelecom) {
    return calcularImpuestoTelecom(monto, provincia);
  }

  // Alquiler: IVA exento, no IIBB, but sellado is calculated separately
  if (categoria.esAlquiler) {
    return 0; // Sellado is calculated in StepGastos when contratoNuevo is true
  }

  // Standard calculation: reverse IVA + IIBB + TISH from final price
  const tasaIVA = categoria.iva;
  const tasaIIBB = categoria.iibbKey ? (IIBB[provincia]?.[categoria.iibbKey] || 0) : 0;
  const tasaTISH = TISH_ESTIMADA;
  const tasaDC = IMPUESTO_DEBITOS_CREDITOS;

  // Price = base * (1 + IVA) * (1 + IIBB) * (1 + TISH) * (1 + DC)
  const factorTotal = (1 + tasaIVA) * (1 + tasaIIBB) * (1 + tasaTISH) * (1 + tasaDC);
  const precioBase = monto / factorTotal;
  return monto - precioBase;
}

export function calcularCargaConsumo(gastos, provincia) {
  const porCategoria = {};
  let totalMensual = 0;

  for (const cat of CATEGORIAS_GASTO) {
    const monto = gastos[cat.id] || 0;
    const impuesto = calcularImpuestoCategoria(cat.id, monto, provincia);
    porCategoria[cat.id] = {
      monto,
      impuesto,
      label: `${cat.emoji} ${cat.label}`,
    };
    totalMensual += impuesto;
  }

  // Sellado de alquiler (if applicable)
  if (gastos.alquiler && gastos.contratoNuevo) {
    const tasaSellos = IIBB[provincia]?.sellos_alquiler || 0.012;
    // Sellado is on the total contract value (24 months typically)
    // Amortized monthly: alquiler * tasaSellos * 24 / 24 = alquiler * tasaSellos
    // But actually it's paid once on the total, so monthly impact = total * tasa / 24
    // For simplicity: monthly alquiler * tasa (since it's proportional)
    const selladoMensual = gastos.alquiler * tasaSellos;
    porCategoria["sellado_alquiler"] = {
      monto: gastos.alquiler,
      impuesto: selladoMensual,
      label: "📋 Sellado de alquiler",
    };
    totalMensual += selladoMensual;
  }

  return {
    por_categoria: porCategoria,
    total_mensual: totalMensual,
  };
}
