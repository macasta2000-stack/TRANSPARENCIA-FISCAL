import {
  APORTES_EMPLEADO,
  CONTRIBUCIONES_PATRONALES,
  TASA_TOTAL_APORTES_EMPLEADO,
  TASA_TOTAL_CONTRIBUCIONES_PATRONALES,
  MONOTRIBUTO_2026,
  MONOTRIBUTO_NORMATIVA,
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
    const anchoTramo = tramo.hasta === Infinity ? restante : tramo.hasta - tramo.desde;
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
      items: [
        { nombre: "Componente impositivo integrado", monto: datos.impuesto, nivel: "nacional", normativa: MONOTRIBUTO_NORMATIVA },
        { nombre: "Aporte jubilatorio (SIPA)", monto: datos.jubilacion, nivel: "nacional", normativa: "Ley 24.241" },
        { nombre: "Obra social", monto: datos.obraSocial, nivel: "nacional", normativa: "Ley 23.660" },
      ],
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
      items: [
        { nombre: "Aportes autónomo (27%)", monto: aportes, tasa: 0.27, nivel: "nacional", normativa: "Ley 24.241, Art. 10" },
      ],
    };
  }

  // Relación de dependencia
  let bruto;
  if (tipo === "neto") {
    bruto = monto / (1 - TASA_TOTAL_APORTES_EMPLEADO);
  } else {
    bruto = monto;
  }

  const ganancias = calcularGanancias4ta(bruto);
  const costoTotalEmpleador = bruto * (1 + TASA_TOTAL_CONTRIBUCIONES_PATRONALES);

  // Build itemized list
  const items = [];

  // Aportes del empleado
  for (const [, data] of Object.entries(APORTES_EMPLEADO)) {
    items.push({
      nombre: data.nombre,
      monto: bruto * data.tasa,
      tasa: data.tasa,
      nivel: data.nivel,
      normativa: data.normativa,
      grupo: "empleado",
    });
  }

  // Ganancias
  if (ganancias > 0) {
    items.push({
      nombre: GANANCIAS_4TA.nombre,
      monto: ganancias,
      nivel: "nacional",
      normativa: GANANCIAS_4TA.normativa,
      grupo: "empleado",
    });
  }

  // Contribuciones patronales
  for (const [, data] of Object.entries(CONTRIBUCIONES_PATRONALES)) {
    items.push({
      nombre: data.nombre,
      monto: bruto * data.tasa,
      tasa: data.tasa,
      nivel: data.nivel,
      normativa: data.normativa,
      nota: data.nota,
      grupo: "patronal",
    });
  }

  const totalAportes = Object.values(APORTES_EMPLEADO).reduce((s, d) => s + bruto * d.tasa, 0) + ganancias;
  const totalPatronal = Object.values(CONTRIBUCIONES_PATRONALES).reduce((s, d) => s + bruto * d.tasa, 0);

  return {
    bruto,
    costoTotalEmpleador,
    aportes_empleado: totalAportes,
    contribuciones_patronales: totalPatronal,
    ganancias,
    total_mensual: totalAportes + totalPatronal,
    items,
  };
}

export function calcularIngresoBrutoTotal(sueldo) {
  const carga = calcularCargaSueldo(sueldo);
  return carga.costoTotalEmpleador;
}
