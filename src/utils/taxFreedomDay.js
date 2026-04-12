import { calcularCargaSueldo, calcularIngresoBrutoTotal } from "./calcularSueldo";
import { calcularCargaConsumo } from "./calcularConsumo";
import { calcularAutomotor } from "./calcularAutomotor";
import { calcularInmueble } from "./calcularInmueble";
import { IIBB } from "../data/impuestos-provinciales";
import { getTasasMunicipales } from "../data/impuestos-municipales";

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];
const DIAS_POR_MES = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function calcularFecha(diaDelAnio) {
  let diasRestantes = Math.min(Math.max(diaDelAnio, 1), 365);
  let mesIdx = 0;
  while (diasRestantes > DIAS_POR_MES[mesIdx] && mesIdx < 11) {
    diasRestantes -= DIAS_POR_MES[mesIdx];
    mesIdx++;
  }
  return { dia: diasRestantes, mes: MESES[mesIdx], fecha: `${diasRestantes} de ${MESES[mesIdx]}` };
}

function agruparPorNivel(items) {
  const nacional = { total: 0, items: [] };
  const provincial = { total: 0, items: [] };
  const municipal = { total: 0, items: [] };
  const sindical = { total: 0, items: [] };
  const colegio = { total: 0, items: [] };

  for (const item of items) {
    const m = item.monto || 0;
    if (item.nivel === "provincial") { provincial.total += m; provincial.items.push(item); }
    else if (item.nivel === "municipal") { municipal.total += m; municipal.items.push(item); }
    else if (item.nivel === "sindical") { sindical.total += m; sindical.items.push(item); }
    else if (item.nivel === "colegio") { colegio.total += m; colegio.items.push(item); }
    else { nacional.total += m; nacional.items.push(item); }
  }
  return { nacional, provincial, municipal, sindical, colegio };
}

// =====================================================
// Cuando no hay gastos cargados, estimamos la carga de consumo
// sobre el neto del trabajador, desglosada por nivel de gobierno.
// Esto refleja la realidad: el trabajador GASTA su sueldo y paga
// IVA (nacional), IIBB en cascada (provincial) y TISH (municipal).
// =====================================================
function estimarCargaConsumoSobreNeto(netoBolsillo, provincia, municipio) {
  if (netoBolsillo <= 0) return { items: [], total: 0 };

  // IVA: ~17.4% efectivo sobre el gasto total (21/(1+21) = 17.4% del precio final)
  const ivaEfectivo = 0.174;
  const ivaEstimado = netoBolsillo * ivaEfectivo;

  // IIBB cascada: la tasa nominal es 3-5%, pero por efecto cascada
  // (cada eslabón de la cadena paga IIBB y lo traslada al precio)
  // el impacto real sobre el precio final es 2-3x la tasa nominal.
  // Estimación conservadora: tasa nominal x 2.5 como carga real en precio final.
  const iibbData = IIBB[provincia];
  const tasaIIBBNominal = iibbData?.supermercado?.tasa || 0.035;
  const factorCascada = 2.5; // cada eslabón productivo suma IIBB
  const iibbEfectivo = tasaIIBBNominal * factorCascada;
  // Sobre precio final: iibbEfectivo / (1 + iibbEfectivo) ~ similar a IVA
  const iibbEstimado = netoBolsillo * (iibbEfectivo / (1 + iibbEfectivo));

  // TISH municipal: trasladado en precios por los comercios
  const muniData = getTasasMunicipales(provincia, municipio);
  const tasaTISH = muniData.tish || 0.01;
  const tishEstimado = netoBolsillo * tasaTISH;

  // Impuesto al cheque: 0.6% cada vez que se mueve plata (debito al pagar)
  const chequeConsumo = netoBolsillo * 0.006;

  const items = [
    {
      nombre: "IVA estimado sobre consumo",
      monto: ivaEstimado,
      tasa: ivaEfectivo,
      nivel: "nacional",
      normativa: "Ley 23.349 — 21% general (estimado sobre gasto del neto)",
      grupo: "consumo_estimado",
      nota: "Estimacion: si gastas todo tu sueldo neto, ~17.4% se va en IVA",
    },
    {
      nombre: "Imp. Debitos/Creditos (al gastar)",
      monto: chequeConsumo,
      tasa: 0.006,
      nivel: "nacional",
      normativa: "Ley 25.413",
      grupo: "consumo_estimado",
      nota: "0.6% cada vez que moves plata de tu cuenta para pagar",
    },
    {
      nombre: "IIBB en cascada (trasladado en precios)",
      monto: iibbEstimado,
      tasa: iibbEfectivo,
      nivel: "provincial",
      normativa: iibbData?.fuente || "Codigo Fiscal provincial",
      grupo: "consumo_estimado",
      nota: `IIBB nominal ${(tasaIIBBNominal * 100).toFixed(1)}% pero por efecto cascada (fabricante + distribuidor + minorista) el impacto real es ~${(iibbEfectivo * 100).toFixed(1)}% del precio final`,
    },
    {
      nombre: "TISH municipal (trasladado en precios)",
      monto: tishEstimado,
      tasa: tasaTISH,
      nivel: "municipal",
      normativa: muniData.tish_normativa || "Ordenanza fiscal municipal",
      grupo: "consumo_estimado",
      nota: "Tasa de Seguridad e Higiene que pagan los comercios y se traslada al precio",
    },
  ];

  const total = ivaEstimado + chequeConsumo + iibbEstimado + tishEstimado;
  return { items, total };
}

export function calcularTaxFreedomDay({ sueldo, provincia, municipio, gastos, auto, inmueble }) {
  const cargaSueldo = calcularCargaSueldo(sueldo, provincia);
  const cargaConsumo = calcularCargaConsumo(gastos || {}, provincia, municipio);
  const cargaAutoResult = auto ? calcularAutomotor(auto, provincia) : { total: 0, items: [], costosRegulatorios: [] };
  const cargaInmuebleResult = inmueble ? calcularInmueble(inmueble, provincia) : { total: 0, items: [] };

  const totalImpuestosMensual =
    cargaSueldo.total_mensual +
    cargaConsumo.total_mensual +
    cargaAutoResult.total +
    cargaInmuebleResult.total;

  const ingresoBrutoTotal = calcularIngresoBrutoTotal(sueldo, provincia);
  // If no salary (gastos-only mode), calculate percentage based on total spending
  const totalGasto = Object.values(gastos || {}).reduce((s, v) => s + (typeof v === "number" ? v : 0), 0);
  const base = ingresoBrutoTotal > 0 ? ingresoBrutoTotal : totalGasto > 0 ? totalGasto : 1;
  const porcentaje = Math.min(totalImpuestosMensualConConsumo / base, 0.99);
  const diaDelAnio = Math.round(365 * porcentaje);
  const taxFreedomDay = calcularFecha(diaDelAnio);

  // Si hay sueldo pero NO hay gastos cargados, estimamos la carga de consumo
  // para que el desglose por nivel refleje la realidad completa.
  const tieneGastos = Object.values(gastos || {}).some(v => typeof v === "number" && v > 0);
  let consumoEstimado = { items: [], total: 0 };

  if (cargaSueldo.bruto > 0 && !tieneGastos) {
    // Estimar neto de bolsillo para calcular consumo
    const deduccionesEmpleado = cargaSueldo.aportes_empleado + cargaSueldo.sindical;
    const netoEstimado = cargaSueldo.bruto - deduccionesEmpleado;
    consumoEstimado = estimarCargaConsumoSobreNeto(netoEstimado, provincia, municipio);
  }

  const totalImpuestosMensualConConsumo = tieneGastos
    ? totalImpuestosMensual
    : totalImpuestosMensual + consumoEstimado.total;

  // Aggregate ALL items for government-level breakdown
  const todosLosItems = [
    ...cargaSueldo.items,
    ...(tieneGastos ? cargaConsumo.allItems : consumoEstimado.items),
    ...cargaAutoResult.items,
    ...cargaInmuebleResult.items,
  ];

  const porNivel = agruparPorNivel(todosLosItems);

  // Collect regulatory costs
  const costosRegulatorios = cargaAutoResult.costosRegulatorios || [];

  // =====================================================
  // CUÑA FISCAL: Costo empleador → Bolsillo → Poder de compra
  // =====================================================
  let cunaFiscal = null;
  if (cargaSueldo.bruto > 0 && sueldo.relacion === "dependencia") {
    const costoEmpleador = cargaSueldo.costoTotalEmpleador;
    const bruto = cargaSueldo.bruto;

    // SAC prorrateado (8.33% del bruto + cargas patronales sobre SAC)
    const sacMensual = bruto * (1 / 12);
    const cargasSobreSAC = sacMensual * 0.236; // contribuciones patronales sobre SAC
    const costoEmpleadorConSAC = costoEmpleador + sacMensual + cargasSobreSAC;

    // Deducciones del empleado
    const deduccionesEmpleado = cargaSueldo.aportes_empleado + cargaSueldo.sindical;
    const netoBolsillo = bruto - deduccionesEmpleado;

    // Impuestos al consumo: usar los reales si hay gastos, o la estimación desglosada
    const impuestosConsumo = cargaConsumo.total_mensual > 0
      ? cargaConsumo.total_mensual
      : consumoEstimado.total > 0
        ? consumoEstimado.total
        : netoBolsillo * 0.25;

    const poderCompraReal = netoBolsillo - impuestosConsumo;

    cunaFiscal = {
      costoEmpleador: costoEmpleadorConSAC,
      salarioBruto: bruto,
      sacMensual,
      deduccionesEmpleado,
      netoBolsillo,
      impuestosConsumo,
      poderCompraReal: Math.max(poderCompraReal, 0),
      // Cuña laboral = lo que se pierde entre empleador y bolsillo
      cunaLaboral: costoEmpleadorConSAC > 0
        ? (costoEmpleadorConSAC - netoBolsillo) / costoEmpleadorConSAC
        : 0,
      // Cuña total = incluyendo impuestos al consumo
      cunaTotal: costoEmpleadorConSAC > 0
        ? (costoEmpleadorConSAC - Math.max(poderCompraReal, 0)) / costoEmpleadorConSAC
        : 0,
    };
  }

  return {
    taxFreedomDay,
    porcentaje,
    totalMensual: totalImpuestosMensualConConsumo,
    totalAnual: totalImpuestosMensualConConsumo * 12,
    ingresoBrutoTotal,
    porNivel,
    costosRegulatorios,
    cunaFiscal,
    desglose: {
      cargaSueldo,
      cargaConsumo,
      cargaAuto: cargaAutoResult.total,
      cargaAutoDetalle: cargaAutoResult,
      cargaInmueble: cargaInmuebleResult.total,
      cargaInmuebleDetalle: cargaInmuebleResult,
    },
  };
}
