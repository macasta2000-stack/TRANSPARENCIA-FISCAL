import {
  IVA,
  IMPUESTOS_COMBUSTIBLES,
  IMPUESTOS_TELECOM,
  IMPUESTO_DEBITOS_CREDITOS,
  IMPUESTOS_SERVICIOS_REGULADOS,
} from "../data/impuestos-nacionales";
import { IIBB } from "../data/impuestos-provinciales";
import { getTasasMunicipales } from "../data/impuestos-municipales";
import { CATEGORIAS_GASTO } from "../data/categorias-gasto";

function calcularNaftaDetallado(gasto, provincia, municipio) {
  const cfg = IMPUESTOS_COMBUSTIBLES.nafta_super;
  const muniData = getTasasMunicipales(provincia, municipio);

  // IIBB provincial sobre combustibles
  const iibbData = IIBB[provincia]?.combustibles;
  const tasaIIBB = iibbData?.tasa || 0.035;
  // Tasa vial MUNICIPAL (varía 0-3% por municipio, NO es provincial)
  const tasaVial = muniData.tasa_vial || 0;
  // TISH municipal sobre la estación de servicio (generalmente bajo, ~0.1-1%)
  const tasaTISH = muniData.tish || 0.01;

  // Carga real de nafta: 35-40% del precio final es impuestos
  // Desglose: IVA ~14%, ICL ~16%, CO2 ~1%, IIBB ~3%, Vial ~0-3%, Infraestructura ~2%
  const porcentajeNacionalEspecificos = 0.19; // ICL + CO2 + infraestructura + gasoil como % del precio base
  const factorTotal = (1 + cfg.iva.tasa) * (1 + porcentajeNacionalEspecificos) * (1 + tasaIIBB) * (1 + tasaVial);
  const precioBase = gasto / factorTotal;
  const totalImpuestos = gasto - precioBase;

  const especificosNacionales = precioBase * porcentajeNacionalEspecificos;

  const items = [
    { nombre: cfg.iva.nombre, monto: precioBase * cfg.iva.tasa, tasa: cfg.iva.tasa, nivel: "nacional", normativa: cfg.iva.normativa },
    { nombre: cfg.icl.nombre, monto: especificosNacionales * 0.50, nivel: "nacional", normativa: cfg.icl.normativa },
    { nombre: cfg.idcco2.nombre, monto: especificosNacionales * 0.06, nivel: "nacional", normativa: cfg.idcco2.normativa },
    { nombre: cfg.tasaInfraestructura.nombre, monto: especificosNacionales * 0.26, nivel: "nacional", normativa: cfg.tasaInfraestructura.normativa },
    { nombre: cfg.tasaGasoil.nombre, monto: especificosNacionales * 0.18, nivel: "nacional", normativa: cfg.tasaGasoil.normativa },
    { nombre: iibbData?.nombre || "IIBB - Combustibles", monto: precioBase * tasaIIBB, tasa: tasaIIBB, nivel: "provincial", normativa: iibbData?.normativa || "Ley impositiva provincial" },
  ];

  // Tasa vial municipal
  if (tasaVial > 0) {
    items.push({
      nombre: muniData.tasa_vial_nombre || "Tasa Vial municipal",
      monto: precioBase * tasaVial,
      tasa: tasaVial,
      nivel: "municipal",
      normativa: muniData.tasa_vial_normativa || "Ordenanza municipal",
    });
  }

  return {
    total: totalImpuestos,
    items,
    nota: `~${Math.round((totalImpuestos / gasto) * 100)}% del precio de bomba son impuestos y tasas.${tasaVial > 0 ? ` Incluye Tasa Vial municipal (${(tasaVial * 100).toFixed(1)}%).` : ""}`,
  };
}

function calcularTelecomDetallado(gasto, provincia, municipio) {
  const iibbData = IIBB[provincia]?.telecom;
  const tasaIIBB = iibbData?.tasa || 0.04;
  const muniData = getTasasMunicipales(provincia, municipio);
  const tasaTISH = muniData.tish || 0.005;

  const factorTotal =
    (1 + IVA.general.tasa) *
    (1 + IMPUESTOS_TELECOM.impuestoInterno.tasa) *
    (1 + tasaIIBB) *
    (1 + IMPUESTOS_TELECOM.tasaCNC.tasa) *
    (1 + IMPUESTOS_TELECOM.fondoServicioUniversal.tasa) *
    (1 + tasaTISH);

  const precioBase = gasto / factorTotal;
  const totalImpuestos = gasto - precioBase;

  const ivaM = precioBase * IVA.general.tasa;
  const intM = precioBase * IMPUESTOS_TELECOM.impuestoInterno.tasa;
  const iibbM = precioBase * tasaIIBB;
  const cncM = precioBase * IMPUESTOS_TELECOM.tasaCNC.tasa;
  const fsuM = precioBase * IMPUESTOS_TELECOM.fondoServicioUniversal.tasa;
  const muniM = precioBase * tasaTISH;

  return {
    total: totalImpuestos,
    items: [
      { nombre: IVA.general.nombre, monto: ivaM, tasa: IVA.general.tasa, nivel: "nacional", normativa: IVA.general.normativa },
      { nombre: IMPUESTOS_TELECOM.impuestoInterno.nombre, monto: intM, tasa: IMPUESTOS_TELECOM.impuestoInterno.tasa, nivel: "nacional", normativa: IMPUESTOS_TELECOM.impuestoInterno.normativa },
      { nombre: IMPUESTOS_TELECOM.tasaCNC.nombre, monto: cncM, tasa: IMPUESTOS_TELECOM.tasaCNC.tasa, nivel: "nacional", normativa: IMPUESTOS_TELECOM.tasaCNC.normativa },
      { nombre: IMPUESTOS_TELECOM.fondoServicioUniversal.nombre, monto: fsuM, tasa: IMPUESTOS_TELECOM.fondoServicioUniversal.tasa, nivel: "nacional", normativa: IMPUESTOS_TELECOM.fondoServicioUniversal.normativa },
      { nombre: iibbData?.nombre || "IIBB Telecom", monto: iibbM, tasa: tasaIIBB, nivel: "provincial", normativa: iibbData?.normativa || "" },
      ...(muniM > 0 ? [{ nombre: muniData.tish_nombre || "TISH municipal", monto: muniM, tasa: tasaTISH, nivel: "municipal", normativa: muniData.tish_normativa || "" }] : []),
    ],
  };
}

function calcularServiciosReguladosDetallado(gasto, provincia, municipio) {
  const promedio = IMPUESTOS_SERVICIOS_REGULADOS;
  const porcentajePonderado =
    (promedio.electricidad.porcentajeImpuestosEstimado * 0.5) +
    (promedio.gas.porcentajeImpuestosEstimado * 0.3) +
    (promedio.agua.porcentajeImpuestosEstimado * 0.2);

  const totalImpuestos = gasto * porcentajePonderado / (1 + porcentajePonderado);
  const precioBase = gasto - totalImpuestos;

  const iibbData = IIBB[provincia]?.servicios;
  const tasaIIBB = iibbData?.tasa || 0.03;
  const iibbMonto = precioBase * tasaIIBB;

  const items = [
    { nombre: "IVA 10.5% (reducido servicios)", monto: precioBase * IVA.reducido.tasa, tasa: IVA.reducido.tasa, nivel: "nacional", normativa: IVA.reducido.normativa },
    { nombre: "Contribución municipal (alumbrado)", monto: precioBase * 0.04, tasa: 0.04, nivel: "municipal", normativa: "Ordenanzas municipales" },
    { nombre: "Fondos fideicomiso energético", monto: precioBase * 0.03, tasa: 0.03, nivel: "nacional", normativa: "Ley 23.681 / Ley 26.095" },
    { nombre: "Tasas regulatorias (ENRE/ENARGAS)", monto: precioBase * 0.005, tasa: 0.005, nivel: "nacional", normativa: "Ley 24.065 / Ley 24.076" },
    { nombre: iibbData?.nombre || "IIBB Servicios", monto: iibbMonto, tasa: tasaIIBB, nivel: "provincial", normativa: iibbData?.normativa || "" },
  ];

  return {
    total: totalImpuestos + iibbMonto,
    items,
    nota: "Las facturas de servicios incluyen ~18-24% en impuestos y cargos regulatorios.",
  };
}

function calcularCategoriaEstandar(monto, categoria, provincia, municipio) {
  const tasaIVA = categoria.tipoIVA === "general" ? IVA.general.tasa :
                  categoria.tipoIVA === "reducido" ? IVA.reducido.tasa : 0;
  const ivaData = categoria.tipoIVA === "general" ? IVA.general :
                  categoria.tipoIVA === "reducido" ? IVA.reducido : IVA.exento;

  const iibbData = categoria.iibbKey ? IIBB[provincia]?.[categoria.iibbKey] : null;
  const tasaIIBB = iibbData?.tasa || 0;

  // Usar TISH real por municipio — y TISH diferenciado para supermercados
  const muniData = getTasasMunicipales(provincia, municipio);
  const esSupermercado = categoria.id === "supermercado";
  const tasaTISH = esSupermercado ? (muniData.tish_super || muniData.tish || 0.01) : (muniData.tish || 0.01);
  const tishNombre = esSupermercado ? (muniData.tish_super_nombre || muniData.tish_nombre || "TISH") : (muniData.tish_nombre || "TISH");
  const tishNormativa = esSupermercado ? (muniData.tish_super_normativa || muniData.tish_normativa || "") : (muniData.tish_normativa || "");

  const tasaDC = IMPUESTO_DEBITOS_CREDITOS.tasa;

  const factorTotal = (1 + tasaIVA) * (1 + tasaIIBB) * (1 + tasaTISH) * (1 + tasaDC);
  const precioBase = monto / factorTotal;
  const totalImpuestos = monto - precioBase;

  const items = [];

  if (tasaIVA > 0) {
    items.push({
      nombre: ivaData.nombre,
      monto: precioBase * tasaIVA,
      tasa: tasaIVA,
      nivel: "nacional",
      normativa: ivaData.normativa,
    });
  }

  if (tasaIIBB > 0) {
    items.push({
      nombre: iibbData.nombre,
      monto: precioBase * tasaIIBB,
      tasa: tasaIIBB,
      nivel: "provincial",
      normativa: iibbData.normativa,
    });
  }

  // TISH municipal real
  if (tasaTISH > 0) {
    items.push({
      nombre: tishNombre,
      monto: precioBase * tasaTISH,
      tasa: tasaTISH,
      nivel: "municipal",
      normativa: tishNormativa,
    });
  }

  items.push({
    nombre: IMPUESTO_DEBITOS_CREDITOS.nombre,
    monto: precioBase * tasaDC,
    tasa: tasaDC,
    nivel: "nacional",
    normativa: IMPUESTO_DEBITOS_CREDITOS.normativa,
  });

  return { total: totalImpuestos, items };
}

export function calcularImpuestoCategoriaDetallado(categoriaId, monto, provincia, municipio) {
  if (!monto || monto <= 0) return { total: 0, items: [] };

  const categoria = CATEGORIAS_GASTO.find((c) => c.id === categoriaId);
  if (!categoria) return { total: 0, items: [] };

  if (categoria.esNafta) return calcularNaftaDetallado(monto, provincia, municipio);
  if (categoria.esTelecom) return calcularTelecomDetallado(monto, provincia, municipio);
  if (categoria.tipoIVA === "servicios_regulados") return calcularServiciosReguladosDetallado(monto, provincia, municipio);
  if (categoria.esAlquiler) return { total: 0, items: [] };

  return calcularCategoriaEstandar(monto, categoria, provincia, municipio);
}

// Backward compat
export function calcularImpuestoCategoria(categoriaId, monto, provincia, municipio) {
  return calcularImpuestoCategoriaDetallado(categoriaId, monto, provincia, municipio).total;
}

export function calcularCargaConsumo(gastos, provincia, municipio) {
  const por_categoria = {};
  let totalMensual = 0;
  const allItems = [];

  for (const cat of CATEGORIAS_GASTO) {
    const monto = gastos[cat.id] || 0;
    const detalle = calcularImpuestoCategoriaDetallado(cat.id, monto, provincia, municipio);
    por_categoria[cat.id] = {
      monto,
      impuesto: detalle.total,
      label: `${cat.emoji} ${cat.label}`,
      items: detalle.items,
      nota: detalle.nota,
    };
    totalMensual += detalle.total;
    allItems.push(...detalle.items);
  }

  // Sellado de alquiler
  if (gastos.alquiler && gastos.contratoNuevo) {
    const iibbSellos = IIBB[provincia]?.sellos_alquiler;
    const tasaSellos = iibbSellos?.tasa || 0.012;
    const selladoMensual = gastos.alquiler * tasaSellos;
    const selladoItem = {
      nombre: iibbSellos?.nombre || "Impuesto de Sellos (alquiler)",
      monto: selladoMensual,
      tasa: tasaSellos,
      nivel: "provincial",
      normativa: iibbSellos?.normativa || "Código Fiscal provincial",
    };
    por_categoria["sellado_alquiler"] = {
      monto: gastos.alquiler,
      impuesto: selladoMensual,
      label: "\ud83d\udccb Sellado de alquiler",
      items: [selladoItem],
    };
    totalMensual += selladoMensual;
    allItems.push(selladoItem);
  }

  return {
    por_categoria,
    total_mensual: totalMensual,
    allItems,
  };
}
