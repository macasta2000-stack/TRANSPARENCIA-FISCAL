import {
  APORTES_EMPLEADO,
  CONTRIBUCIONES_PATRONALES,
  TASA_TOTAL_APORTES_EMPLEADO,
  TASA_TOTAL_CONTRIBUCIONES_PATRONALES,
  MONOTRIBUTO_2026,
  GANANCIAS_4TA,
} from "../data/impuestos-nacionales";

function calcularGanancias4ta(brutoMensual) {
  const { mni_mensual, escala } = GANANCIAS_4TA;
  const baseImponible = brutoMensual - mni_mensual;
  if (baseImponible <= 0) return 0;

  let impuesto = 0;
  let restante = baseImponible;

  for (let i = 0; i < escala.length; i++) {
    const tramo = escala[i];
    const anchoTramo =
      tramo.hasta === Infinity
        ? restante
        : tramo.hasta - tramo.desde;
    const montoEnTramo = Math.min(restante, anchoTramo);
    impuesto += montoEnTramo * tramo.alicuota;
    restante -= montoEnTramo;
    if (restante <= 0) break;
  }

  return impuesto;
}

export function calcularCargaSueldo(sueldo) {
  const { tipo, monto, relacion } = sueldo;

  if (relacion === "monotributista") {
    const cat = sueldo.categoriaMonotributo || "A";
    const datos = MONOTRIBUTO_2026[cat];
    const totalCuota = datos.impuesto + datos.jubilacion + datos.obraSocial;
    return {
      bruto: monto,
      costoTotalEmpleador: monto,
      aportes_empleado: totalCuota,
      contribuciones_patronales: 0,
      ganancias: 0,
      total_mensual: totalCuota,
      detalle: {
        "Componente impositivo": datos.impuesto,
        "Aporte jubilatorio": datos.jubilacion,
        "Obra social": datos.obraSocial,
      },
    };
  }

  if (relacion === "autonomo") {
    const tasaAutonomo = 0.27;
    const aportes = monto * tasaAutonomo;
    return {
      bruto: monto,
      costoTotalEmpleador: monto,
      aportes_empleado: aportes,
      contribuciones_patronales: 0,
      ganancias: 0,
      total_mensual: aportes,
      detalle: {
        "Aportes autónomo (27%)": aportes,
      },
    };
  }

  // Relación de dependencia
  let bruto;
  if (tipo === "neto") {
    bruto = monto / (1 - TASA_TOTAL_APORTES_EMPLEADO);
  } else {
    bruto = monto;
  }

  const aportesEmpleado = bruto * TASA_TOTAL_APORTES_EMPLEADO;
  const contribucionesPatronales = bruto * TASA_TOTAL_CONTRIBUCIONES_PATRONALES;
  const ganancias = calcularGanancias4ta(bruto);
  const costoTotalEmpleador = bruto * (1 + TASA_TOTAL_CONTRIBUCIONES_PATRONALES);

  return {
    bruto,
    costoTotalEmpleador,
    aportes_empleado: aportesEmpleado,
    contribuciones_patronales: contribucionesPatronales,
    ganancias,
    total_mensual: aportesEmpleado + contribucionesPatronales + ganancias,
    detalle: {
      "Jubilación (empleado)": bruto * APORTES_EMPLEADO.jubilacion,
      "Obra social": bruto * APORTES_EMPLEADO.obraSocial,
      "PAMI": bruto * APORTES_EMPLEADO.pami,
      "ANSSAL": bruto * APORTES_EMPLEADO.anssal,
      "Jubilación (patronal)": bruto * CONTRIBUCIONES_PATRONALES.jubilacion,
      "Obra social (patronal)": bruto * CONTRIBUCIONES_PATRONALES.obraSocial,
      ART: bruto * CONTRIBUCIONES_PATRONALES.art,
      Asignaciones: bruto * CONTRIBUCIONES_PATRONALES.asignaciones,
      ...(ganancias > 0 ? { "Ganancias 4ta cat.": ganancias } : {}),
    },
  };
}

export function calcularIngresoBrutoTotal(sueldo) {
  const carga = calcularCargaSueldo(sueldo);
  return carga.costoTotalEmpleador;
}
