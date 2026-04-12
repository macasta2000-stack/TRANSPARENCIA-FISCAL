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

  for (const item of items) {
    const m = item.monto || 0;
    if (item.nivel === "provincial") { provincial.total += m; provincial.items.push(item); }
    else if (item.nivel === "municipal") { municipal.total += m; municipal.items.push(item); }
    else { nacional.total += m; nacional.items.push(item); }
  }
  return { nacional, provincial, municipal };
}

export function calcularTaxFreedomDay({ sueldo, provincia, gastos, auto, inmueble }) {
  const cargaSueldo = calcularCargaSueldo(sueldo);
  const cargaConsumo = calcularCargaConsumo(gastos || {}, provincia);
  const cargaAutoResult = auto ? calcularAutomotor(auto, provincia) : { total: 0, items: [], costosRegulatorios: [] };
  const cargaInmuebleResult = inmueble ? calcularInmueble(inmueble, provincia) : { total: 0, items: [] };

  const totalImpuestosMensual =
    cargaSueldo.total_mensual +
    cargaConsumo.total_mensual +
    cargaAutoResult.total +
    cargaInmuebleResult.total;

  const ingresoBrutoTotal = calcularIngresoBrutoTotal(sueldo);
  const porcentaje = Math.min(totalImpuestosMensual / ingresoBrutoTotal, 0.99);
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

  return {
    taxFreedomDay,
    porcentaje,
    totalMensual: totalImpuestosMensual,
    totalAnual: totalImpuestosMensual * 12,
    ingresoBrutoTotal,
    porNivel,
    costosRegulatorios,
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
