import {
  APORTES_EMPLEADO,
  CONTRIBUCIONES_PATRONALES,
  TASA_TOTAL_APORTES_EMPLEADO,
  TASA_TOTAL_CONTRIBUCIONES_PATRONALES,
  MONOTRIBUTO_2026,
  MONOTRIBUTO_NORMATIVA,
  GANANCIAS_4TA,
  IMPUESTO_DEBITOS_CREDITOS,
  SIRCREB,
} from "../data/impuestos-nacionales";
import { SINDICATOS } from "../data/sindicatos";
import { COLEGIOS_PROFESIONALES } from "../data/colegios-profesionales";
import { IIBB } from "../data/impuestos-provinciales";

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

function calcularSindical(bruto, sindicatoId, esAfiliado) {
  const sindicato = SINDICATOS[sindicatoId];
  if (!sindicato) return { items: [], total: 0 };

  const items = [];
  let total = 0;

  if (esAfiliado && sindicato.cuota_afiliado) {
    const monto = bruto * sindicato.cuota_afiliado.tasa;
    items.push({
      nombre: sindicato.cuota_afiliado.nombre,
      monto,
      tasa: sindicato.cuota_afiliado.tasa,
      nivel: "sindical",
      normativa: sindicato.cuota_afiliado.normativa,
      grupo: "sindical",
    });
    total += monto;
  } else if (!esAfiliado && sindicato.contribucion_solidaria) {
    // Ley 27.802: tope del 2% de la nómina para contribución solidaria
    const tasaReal = Math.min(sindicato.contribucion_solidaria.tasa, 0.02);
    const monto = bruto * tasaReal;
    items.push({
      nombre: sindicato.contribucion_solidaria.nombre,
      monto,
      tasa: tasaReal,
      nivel: "sindical",
      normativa: sindicato.contribucion_solidaria.normativa,
      nota: `Aplica a NO afiliados (tope 2% por Ley 27.802)${sindicato.contribucion_solidaria.tasa > 0.02 ? ` — era ${(sindicato.contribucion_solidaria.tasa * 100).toFixed(1)}% antes de la reforma` : ""}`,
      grupo: "sindical",
    });
    total += monto;
  }

  // Seguro de sepelio (fijo, si aplica)
  if (sindicato.seguro_sepelio) {
    items.push({
      nombre: sindicato.seguro_sepelio.nombre,
      monto: sindicato.seguro_sepelio.monto,
      nivel: "sindical",
      normativa: sindicato.seguro_sepelio.normativa,
      grupo: "sindical",
    });
    total += sindicato.seguro_sepelio.monto;
  }

  // Contribución patronal sindical (pactada en CCT)
  if (sindicato.contribucion_patronal && sindicato.contribucion_patronal.tasa) {
    const monto = bruto * sindicato.contribucion_patronal.tasa;
    items.push({
      nombre: sindicato.contribucion_patronal.nombre,
      monto,
      tasa: sindicato.contribucion_patronal.tasa,
      nivel: "sindical",
      normativa: sindicato.contribucion_patronal.normativa,
      nota: "Contribucion patronal al sindicato pactada en CCT",
      grupo: "patronal",
      auditado: sindicato.contribucion_patronal.auditado !== false,
    });
    total += monto;
  }

  // Fondo especial (ej: UOCRA fondo de desempleo — patronal)
  if (sindicato.fondo_desempleo) {
    const monto = bruto * sindicato.fondo_desempleo.tasa;
    items.push({
      nombre: sindicato.fondo_desempleo.nombre,
      monto,
      tasa: sindicato.fondo_desempleo.tasa,
      nivel: "sindical",
      normativa: sindicato.fondo_desempleo.normativa,
      nota: sindicato.fondo_desempleo.nota,
      grupo: "patronal",
    });
    total += monto;
  }

  return { items, total };
}

function calcularColegioProfesional(colegioId, colegioMontoCustom, cajaMontoCustom) {
  const colegio = COLEGIOS_PROFESIONALES[colegioId];
  if (!colegio || colegioId === "no_aplica") return { items: [], total: 0 };

  const items = [];
  let total = 0;

  // Usar monto custom si lo ingresó el usuario, sino el estimado
  const montoMatricula = colegioMontoCustom > 0 ? colegioMontoCustom : colegio.cuota_mensual_estimada;
  const esCustomMatricula = colegioMontoCustom > 0;

  if (montoMatricula > 0) {
    items.push({
      nombre: `Matricula ${colegio.nombre} (${colegio.colegio})`,
      monto: montoMatricula,
      nivel: "colegio",
      normativa: colegio.normativa_colegio,
      grupo: "colegio",
      auditado: esCustomMatricula ? true : false,
      nota: esCustomMatricula ? "Monto ingresado por el usuario" : undefined,
    });
    total += montoMatricula;
  }

  if (colegio.caja_previsional) {
    const montoCaja = cajaMontoCustom > 0 ? cajaMontoCustom : colegio.caja_previsional.monto_mensual;
    const esCustomCaja = cajaMontoCustom > 0;

    items.push({
      nombre: colegio.caja_previsional.nombre,
      monto: montoCaja,
      nivel: "colegio",
      normativa: colegio.caja_previsional.normativa,
      grupo: "colegio",
      auditado: esCustomCaja ? true : false,
      nota: esCustomCaja
        ? "Monto ingresado por el usuario"
        : "Obligatorio para ejercer — NO fue derogado por la Ley 27.802",
    });
    total += montoCaja;
  }

  return { items, total };
}

export function calcularCargaSueldo(sueldo, provincia) {
  const { tipo, monto, relacion } = sueldo;
  const sindicatoId = sueldo.sindicato || "otro";
  const esAfiliado = sueldo.afiliadoSindicato || false;

  const colegioId = sueldo.colegioProfesional || "no_aplica";
  const colegioMontoCustom = parseFloat(sueldo.colegioMontoCustom) || 0;
  const cajaMontoCustom = parseFloat(sueldo.cajaMontoCustom) || 0;
  const colegioCalc = calcularColegioProfesional(colegioId, colegioMontoCustom, cajaMontoCustom);

  // IIBB provincial sobre ingresos (aplica a monotributistas y autónomos)
  const iibbServicios = IIBB[provincia]?.servicios;
  const tasaIIBBIngresos = iibbServicios?.tasa || 0.035;

  if (relacion === "monotributista") {
    const cat = sueldo.categoriaMonotributo || "A";
    const datos = MONOTRIBUTO_2026[cat];
    const totalCuota = datos.impuesto + datos.jubilacion + datos.obraSocial;

    // IIBB provincial sobre facturación
    const iibbMonto = monto * tasaIIBBIngresos;

    // SIRCREB: percepción bancaria sobre créditos
    const sircrebData = SIRCREB.alicuotas[provincia];
    const tasaSircreb = sircrebData?.tasa || 0.015;
    const sircrebMonto = monto * tasaSircreb;

    // Impuesto al cheque: 0.6% sobre el crédito (cuando te depositan/cobrás)
    const chequeMonto = monto * IMPUESTO_DEBITOS_CREDITOS.tasa;

    const totalExtras = iibbMonto + sircrebMonto + chequeMonto;

    const items = [
      { nombre: "Componente impositivo integrado", monto: datos.impuesto, nivel: "nacional", normativa: MONOTRIBUTO_NORMATIVA, grupo: "empleado" },
      { nombre: "Aporte jubilatorio (SIPA)", monto: datos.jubilacion, nivel: "nacional", normativa: "Ley 24.241", grupo: "empleado" },
      { nombre: "Obra social", monto: datos.obraSocial, nivel: "nacional", normativa: "Ley 23.660", grupo: "empleado" },
      {
        nombre: iibbServicios?.nombre || "IIBB sobre facturacion",
        monto: iibbMonto,
        tasa: tasaIIBBIngresos,
        nivel: "provincial",
        normativa: iibbServicios?.normativa || "Codigo Fiscal provincial",
        grupo: "empleado",
        nota: "Monotributistas pagan IIBB aparte sobre su facturacion mensual",
      },
      {
        nombre: sircrebData?.nombre || "SIRCREB (percepcion bancaria IIBB)",
        monto: sircrebMonto,
        tasa: tasaSircreb,
        nivel: "provincial",
        normativa: sircrebData?.normativa || SIRCREB.normativa,
        grupo: "empleado",
        auditado: false,
        nota: "Retencion automatica del banco sobre creditos. Se computa como pago a cuenta de IIBB.",
      },
      {
        nombre: "Imp. Debitos/Creditos (sobre cobro)",
        monto: chequeMonto,
        tasa: IMPUESTO_DEBITOS_CREDITOS.tasa,
        nivel: "nacional",
        normativa: IMPUESTO_DEBITOS_CREDITOS.normativa,
        grupo: "empleado",
        nota: "0.6% sobre cada credito bancario cuando cobras tu facturacion",
      },
      ...colegioCalc.items,
    ];
    return {
      bruto: monto,
      costoTotalEmpleador: monto,
      aportes_empleado: totalCuota + totalExtras,
      contribuciones_patronales: 0,
      ganancias: 0,
      sindical: 0,
      colegio: colegioCalc.total,
      total_mensual: totalCuota + totalExtras + colegioCalc.total,
      items,
    };
  }

  if (relacion === "autonomo") {
    const tasaAutonomo = 0.27;
    const aportes = monto * tasaAutonomo;

    // Ganancias para autónomos (misma escala que 4ta categoría)
    const gananciasAutonomo = calcularGanancias4ta(monto);

    // IIBB sobre facturación
    const iibbMonto = monto * tasaIIBBIngresos;

    // SIRCREB
    const sircrebData = SIRCREB.alicuotas[provincia];
    const tasaSircreb = sircrebData?.tasa || 0.015;
    const sircrebMonto = monto * tasaSircreb;

    // Impuesto al cheque
    const chequeMonto = monto * IMPUESTO_DEBITOS_CREDITOS.tasa;

    // IVA: el autónomo RI factura con IVA 21%, lo recauda y lo deposita a AFIP
    // No es un costo directo, pero sí un costo financiero y administrativo
    // Lo mostramos como referencia pero NO lo sumamos al total personal
    const ivaMonto = monto * 0.21;

    const totalExtras = iibbMonto + sircrebMonto + chequeMonto + gananciasAutonomo;

    const items = [
      { nombre: "Aportes autonomo (27%)", monto: aportes, tasa: 0.27, nivel: "nacional", normativa: "Ley 24.241, Art. 10", grupo: "empleado" },
      {
        nombre: GANANCIAS_4TA.nombre,
        monto: gananciasAutonomo,
        nivel: "nacional",
        normativa: GANANCIAS_4TA.normativa,
        grupo: "empleado",
        nota: "Autonomos tributan Ganancias sobre ingreso neto de deducciones",
      },
      {
        nombre: iibbServicios?.nombre || "IIBB sobre facturacion",
        monto: iibbMonto,
        tasa: tasaIIBBIngresos,
        nivel: "provincial",
        normativa: iibbServicios?.normativa || "Codigo Fiscal provincial",
        grupo: "empleado",
        nota: "Responsable Inscripto: IIBB sobre facturacion bruta mensual",
      },
      {
        nombre: sircrebData?.nombre || "SIRCREB (percepcion bancaria IIBB)",
        monto: sircrebMonto,
        tasa: tasaSircreb,
        nivel: "provincial",
        normativa: sircrebData?.normativa || SIRCREB.normativa,
        grupo: "empleado",
        auditado: false,
        nota: "Retencion automatica del banco. Pago a cuenta de IIBB.",
      },
      {
        nombre: "Imp. Debitos/Creditos (sobre cobro)",
        monto: chequeMonto,
        tasa: IMPUESTO_DEBITOS_CREDITOS.tasa,
        nivel: "nacional",
        normativa: IMPUESTO_DEBITOS_CREDITOS.normativa,
        grupo: "empleado",
        nota: "0.6% sobre cada credito bancario",
      },
      ...colegioCalc.items,
    ];
    return {
      bruto: monto,
      costoTotalEmpleador: monto,
      aportes_empleado: aportes + totalExtras,
      contribuciones_patronales: 0,
      ganancias: gananciasAutonomo,
      sindical: 0,
      colegio: colegioCalc.total,
      total_mensual: aportes + totalExtras + colegioCalc.total,
      items,
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
  const sindical = calcularSindical(bruto, sindicatoId, esAfiliado);

  const costoTotalEmpleador = bruto * (1 + TASA_TOTAL_CONTRIBUCIONES_PATRONALES)
    + sindical.items.filter(i => i.grupo === "patronal").reduce((s, i) => s + i.monto, 0);

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

  // Sindicales (los del empleado)
  items.push(...sindical.items.filter(i => i.grupo === "sindical"));

  // Impuesto al cheque sobre depósito del sueldo neto
  const netoEstimado = bruto * (1 - TASA_TOTAL_APORTES_EMPLEADO) - ganancias;
  const chequeDeposito = netoEstimado * IMPUESTO_DEBITOS_CREDITOS.tasa;
  items.push({
    nombre: "Imp. Debitos/Creditos (deposito sueldo)",
    monto: chequeDeposito,
    tasa: IMPUESTO_DEBITOS_CREDITOS.tasa,
    nivel: "nacional",
    normativa: IMPUESTO_DEBITOS_CREDITOS.normativa,
    grupo: "empleado",
    nota: "0.6% sobre el credito cuando te depositan el sueldo en tu cuenta",
  });

  // SIRCREB: percepción bancaria IIBB sobre el depósito
  const sircrebData = provincia ? SIRCREB.alicuotas[provincia] : null;
  if (sircrebData) {
    const sircrebMonto = netoEstimado * sircrebData.tasa;
    items.push({
      nombre: sircrebData.nombre,
      monto: sircrebMonto,
      tasa: sircrebData.tasa,
      nivel: "provincial",
      normativa: sircrebData.normativa,
      grupo: "empleado",
      auditado: false,
      nota: "Percepcion automatica del banco al depositar tu sueldo. Para empleados es a cuenta (genera saldo a favor), pero el costo financiero es real.",
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

  // Patronales sindicales (ej: fondo desempleo UOCRA)
  items.push(...sindical.items.filter(i => i.grupo === "patronal"));

  // Colegios profesionales + cajas previsionales
  items.push(...colegioCalc.items);

  // Totales: sumar todos los items por grupo
  const totalAportesBase = Object.values(APORTES_EMPLEADO).reduce((s, d) => s + bruto * d.tasa, 0) + ganancias;
  const totalBancario = items.filter(i => i.grupo === "empleado" && (i.nombre.includes("Debitos") || i.nombre.includes("SIRCREB"))).reduce((s, i) => s + i.monto, 0);
  const totalAportes = totalAportesBase + totalBancario;
  const totalSindicalEmpleado = sindical.items.filter(i => i.grupo === "sindical").reduce((s, i) => s + i.monto, 0);
  const totalPatronal = Object.values(CONTRIBUCIONES_PATRONALES).reduce((s, d) => s + bruto * d.tasa, 0)
    + sindical.items.filter(i => i.grupo === "patronal").reduce((s, i) => s + i.monto, 0);

  return {
    bruto,
    costoTotalEmpleador,
    aportes_empleado: totalAportes,
    contribuciones_patronales: totalPatronal,
    ganancias,
    sindical: totalSindicalEmpleado,
    colegio: colegioCalc.total,
    total_mensual: totalAportes + totalPatronal + totalSindicalEmpleado + colegioCalc.total,
    items,
  };
}

export function calcularIngresoBrutoTotal(sueldo, provincia) {
  const carga = calcularCargaSueldo(sueldo, provincia);
  return carga.costoTotalEmpleador;
}
