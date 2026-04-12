import {
  IVA,
  IMPUESTOS_COMBUSTIBLES,
  IMPUESTOS_TELECOM,
  IMPUESTO_DEBITOS_CREDITOS,
  IMPUESTOS_SERVICIOS_REGULADOS,
} from "../data/impuestos-nacionales";
import { IIBB } from "../data/impuestos-provinciales";
import { TASAS_MUNICIPALES } from "../data/impuestos-municipales";
import { CATEGORIAS_GASTO } from "../data/categorias-gasto";

function calcularNaftaDetallado(gasto) {
  const cfg = IMPUESTOS_COMBUSTIBLES.nafta_super;
  // ~55% of pump price is taxes. Break it down proportionally.
  const totalImpuestos = gasto * cfg.porcentajeEstimadoTotal;
  const precioBase = gasto - totalImpuestos;

  // Proportional breakdown of the total tax component
  const ivaEstimado = precioBase * cfg.iva.tasa;
  const restanteEspecificos = totalImpuestos - ivaEstimado;

  return {
    total: totalImpuestos,
    items: [
      { nombre: cfg.iva.nombre, monto: ivaEstimado, nivel: "nacional", normativa: cfg.iva.normativa },
      { nombre: cfg.icl.nombre, monto: restanteEspecificos * 0.40, nivel: "nacional", normativa: cfg.icl.normativa },
      { nombre: cfg.idcco2.nombre, monto: restanteEspecificos * 0.25, nivel: "nacional", normativa: cfg.idcco2.normativa },
      { nombre: cfg.tasaInfraestructura.nombre, monto: restanteEspecificos * 0.20, nivel: "nacional", normativa: cfg.tasaInfraestructura.normativa },
      { nombre: cfg.tasaGasoil.nombre, monto: restanteEspecificos * 0.15, nivel: "nacional", normativa: cfg.tasaGasoil.normativa },
    ],
    nota: "En cada litro de nafta, más de la mitad es impuesto.",
  };
}

function calcularTelecomDetallado(gasto, provincia) {
  const iibbData = IIBB[provincia]?.telecom;
  const tasaIIBB = iibbData?.tasa || 0.04;
  const tasasMunic = TASAS_MUNICIPALES[provincia]?.total_estimado || 0.005;

  const factorTotal =
    (1 + IVA.general.tasa) *
    (1 + IMPUESTOS_TELECOM.impuestoInterno.tasa) *
    (1 + tasaIIBB) *
    (1 + IMPUESTOS_TELECOM.tasaCNC.tasa) *
    (1 + IMPUESTOS_TELECOM.fondoServicioUniversal.tasa) *
    (1 + tasasMunic);

  const precioBase = gasto / factorTotal;
  const totalImpuestos = gasto - precioBase;

  const ivaM = precioBase * IVA.general.tasa;
  const intM = precioBase * IMPUESTOS_TELECOM.impuestoInterno.tasa;
  const iibbM = precioBase * tasaIIBB;
  const cncM = precioBase * IMPUESTOS_TELECOM.tasaCNC.tasa;
  const fsuM = precioBase * IMPUESTOS_TELECOM.fondoServicioUniversal.tasa;
  const muniM = precioBase * tasasMunic;

  return {
    total: totalImpuestos,
    items: [
      { nombre: IVA.general.nombre, monto: ivaM, tasa: IVA.general.tasa, nivel: "nacional", normativa: IVA.general.normativa },
      { nombre: IMPUESTOS_TELECOM.impuestoInterno.nombre, monto: intM, tasa: IMPUESTOS_TELECOM.impuestoInterno.tasa, nivel: "nacional", normativa: IMPUESTOS_TELECOM.impuestoInterno.normativa },
      { nombre: IMPUESTOS_TELECOM.tasaCNC.nombre, monto: cncM, tasa: IMPUESTOS_TELECOM.tasaCNC.tasa, nivel: "nacional", normativa: IMPUESTOS_TELECOM.tasaCNC.normativa },
      { nombre: IMPUESTOS_TELECOM.fondoServicioUniversal.nombre, monto: fsuM, tasa: IMPUESTOS_TELECOM.fondoServicioUniversal.tasa, nivel: "nacional", normativa: IMPUESTOS_TELECOM.fondoServicioUniversal.normativa },
      { nombre: iibbData?.nombre || "IIBB Telecom", monto: iibbM, tasa: tasaIIBB, nivel: "provincial", normativa: iibbData?.normativa || "" },
      ...(muniM > 0 ? [{ nombre: "Tasas municipales", monto: muniM, tasa: tasasMunic, nivel: "municipal", normativa: TASAS_MUNICIPALES[provincia]?.fuente || "" }] : []),
    ],
  };
}

function calcularServiciosReguladosDetallado(gasto, provincia) {
  // Servicios públicos (luz+gas+agua) — weighted average of their specific tax structures
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

  // Build items from the main components
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

function calcularCategoriaEstandar(monto, categoria, provincia) {
  const tasaIVA = categoria.tipoIVA === "general" ? IVA.general.tasa :
                  categoria.tipoIVA === "reducido" ? IVA.reducido.tasa : 0;
  const ivaData = categoria.tipoIVA === "general" ? IVA.general :
                  categoria.tipoIVA === "reducido" ? IVA.reducido : IVA.exento;

  const iibbData = categoria.iibbKey ? IIBB[provincia]?.[categoria.iibbKey] : null;
  const tasaIIBB = iibbData?.tasa || 0;
  const tasasMunic = TASAS_MUNICIPALES[provincia]?.total_estimado || 0.005;
  const tasaDC = IMPUESTO_DEBITOS_CREDITOS.tasa;

  const factorTotal = (1 + tasaIVA) * (1 + tasaIIBB) * (1 + tasasMunic) * (1 + tasaDC);
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

  if (tasasMunic > 0) {
    const muniData = TASAS_MUNICIPALES[provincia];
    // Add individual municipal taxes if available
    if (muniData?.tish?.tasa > 0) {
      items.push({
        nombre: muniData.tish.nombre,
        monto: precioBase * muniData.tish.tasa,
        tasa: muniData.tish.tasa,
        nivel: "municipal",
        normativa: muniData.tish.normativa,
      });
    }
    if (muniData?.alumbrado?.tasa > 0) {
      items.push({
        nombre: muniData.alumbrado.nombre,
        monto: precioBase * muniData.alumbrado.tasa,
        tasa: muniData.alumbrado.tasa,
        nivel: "municipal",
        normativa: muniData.alumbrado.normativa,
      });
    }
    if (muniData?.drei?.tasa > 0) {
      items.push({
        nombre: muniData.drei.nombre,
        monto: precioBase * muniData.drei.tasa,
        tasa: muniData.drei.tasa,
        nivel: "municipal",
        normativa: muniData.drei.normativa,
      });
    }
    if (muniData?.publicidad?.tasa > 0) {
      items.push({
        nombre: muniData.publicidad.nombre,
        monto: precioBase * muniData.publicidad.tasa,
        tasa: muniData.publicidad.tasa,
        nivel: "municipal",
        normativa: muniData.publicidad.normativa,
      });
    }
    // If no individual items found, show aggregate
    if (items.filter(i => i.nivel === "municipal").length === 0) {
      items.push({
        nombre: "Tasas municipales",
        monto: precioBase * tasasMunic,
        tasa: tasasMunic,
        nivel: "municipal",
        normativa: muniData?.fuente || "Ordenanzas municipales",
      });
    }
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

export function calcularImpuestoCategoriaDetallado(categoriaId, monto, provincia) {
  if (!monto || monto <= 0) return { total: 0, items: [] };

  const categoria = CATEGORIAS_GASTO.find((c) => c.id === categoriaId);
  if (!categoria) return { total: 0, items: [] };

  if (categoria.esNafta) return calcularNaftaDetallado(monto);
  if (categoria.esTelecom) return calcularTelecomDetallado(monto, provincia);
  if (categoria.tipoIVA === "servicios_regulados") return calcularServiciosReguladosDetallado(monto, provincia);
  if (categoria.esAlquiler) return { total: 0, items: [] };

  return calcularCategoriaEstandar(monto, categoria, provincia);
}

// Backward compat for CategorySlider
export function calcularImpuestoCategoria(categoriaId, monto, provincia) {
  return calcularImpuestoCategoriaDetallado(categoriaId, monto, provincia).total;
}

export function calcularCargaConsumo(gastos, provincia) {
  const por_categoria = {};
  let totalMensual = 0;
  const allItems = [];

  for (const cat of CATEGORIAS_GASTO) {
    const monto = gastos[cat.id] || 0;
    const detalle = calcularImpuestoCategoriaDetallado(cat.id, monto, provincia);
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
