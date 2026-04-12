import { calcularCargaSueldo, calcularIngresoBrutoTotal } from "./calcularSueldo";
import { calcularCargaConsumo } from "./calcularConsumo";
import { calcularAutomotor } from "./calcularAutomotor";
import { calcularInmueble } from "./calcularInmueble";

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
  const porcentaje = Math.min(totalImpuestosMensual / base, 0.99);
  const diaDelAnio = Math.round(365 * porcentaje);
  const taxFreedomDay = calcularFecha(diaDelAnio);

  // Aggregate ALL items for government-level breakdown
  const todosLosItems = [
    ...cargaSueldo.items,
    ...cargaConsumo.allItems,
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

    // Impuestos al consumo estimados (si tiene gastos o estimar sobre neto)
    const impuestosConsumo = cargaConsumo.total_mensual > 0
      ? cargaConsumo.total_mensual
      : netoBolsillo * 0.25; // estimación conservadora: ~25% del neto en IVA+IIBB+municipal

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
    totalMensual: totalImpuestosMensual,
    totalAnual: totalImpuestosMensual * 12,
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
