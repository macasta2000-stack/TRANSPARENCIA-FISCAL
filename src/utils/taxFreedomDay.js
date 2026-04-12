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

  return {
    dia: diasRestantes,
    mes: MESES[mesIdx],
    fecha: `${diasRestantes} de ${MESES[mesIdx]}`,
  };
}

export function calcularTaxFreedomDay({ sueldo, provincia, gastos, auto, inmueble }) {
  const cargaSueldo = calcularCargaSueldo(sueldo);
  const cargaConsumo = calcularCargaConsumo(gastos || {}, provincia);
  const cargaAuto = auto ? calcularAutomotor(auto, provincia) : 0;
  const cargaInmueble = inmueble ? calcularInmueble(inmueble, provincia) : 0;

  const totalImpuestosMensual =
    cargaSueldo.total_mensual +
    cargaConsumo.total_mensual +
    cargaAuto +
    cargaInmueble;

  const ingresoBrutoTotal = calcularIngresoBrutoTotal(sueldo);

  const porcentaje = Math.min(totalImpuestosMensual / ingresoBrutoTotal, 0.99);
  const diaDelAnio = Math.round(365 * porcentaje);
  const taxFreedomDay = calcularFecha(diaDelAnio);

  return {
    taxFreedomDay,
    porcentaje,
    totalMensual: totalImpuestosMensual,
    totalAnual: totalImpuestosMensual * 12,
    ingresoBrutoTotal,
    desglose: {
      cargaSueldo,
      cargaConsumo,
      cargaAuto,
      cargaInmueble,
    },
  };
}
