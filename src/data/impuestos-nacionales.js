// =====================================================
// IMPUESTOS NACIONALES — Detalle completo con normativa
// =====================================================

export const IVA = {
  general: { tasa: 0.21, nombre: "IVA General", normativa: "Ley 23.349, Art. 28" },
  reducido: { tasa: 0.105, nombre: "IVA Reducido", normativa: "Ley 23.349, Art. 28 inc. e)" },
  exento: { tasa: 0, nombre: "IVA Exento", normativa: "Ley 23.349, Art. 7" },
};

// Impuesto a los combustibles líquidos (ICL) + ITC
export const IMPUESTOS_COMBUSTIBLES = {
  nafta_super: {
    iva: { tasa: 0.21, nombre: "IVA 21%", normativa: "Ley 23.349" },
    icl: { montoPorLitro: 84.63, nombre: "Impuesto a Combustibles Líquidos (ICL)", normativa: "Ley 23.966, Título III" },
    idcco2: { montoPorLitro: 52.46, nombre: "Impuesto al Dióxido de Carbono", normativa: "Ley 23.966, Art. 139" },
    tasaInfraestructura: { tasa: 0.091, nombre: "Tasa de Infraestructura Hídrica", normativa: "Ley 26.181" },
    tasaGasoil: { tasa: 0.05, nombre: "Tasa sobre Gasoil (fondo vial)", normativa: "Ley 26.028" },
    // Participación total de impuestos en precio de bomba: ~52-58%
    porcentajeEstimadoTotal: 0.55,
  },
};

// Impuestos internos sobre servicios de comunicación
export const IMPUESTOS_TELECOM = {
  impuestoInterno: { tasa: 0.17, nombre: "Impuesto Interno a Telecom", normativa: "Ley 24.674, Art. 10" },
  tasaCNC: { tasa: 0.01, nombre: "Tasa de Control ENACOM", normativa: "Ley 27.078, Art. 94" },
  fondoServicioUniversal: { tasa: 0.01, nombre: "Fondo Servicio Universal (FSU)", normativa: "Ley 27.078, Art. 21" },
};

// Impuesto a los Débitos y Créditos
export const IMPUESTO_DEBITOS_CREDITOS = {
  tasa: 0.006,
  nombre: "Imp. Débitos y Créditos Bancarios",
  normativa: "Ley 25.413",
  nota: "0.6% por operación — trasladado al consumidor en precios",
};

// Ganancias 4ta categoría
export const GANANCIAS_4TA = {
  nombre: "Impuesto a las Ganancias (4ta categoría)",
  normativa: "Ley 20.628, modif. Ley 27.743",
  mni_mensual: 3091035,
  escala: [
    { desde: 0, hasta: 419253, alicuota: 0.05 },
    { desde: 419253, hasta: 838506, alicuota: 0.09 },
    { desde: 838506, hasta: 1257758, alicuota: 0.12 },
    { desde: 1257758, hasta: 1677011, alicuota: 0.15 },
    { desde: 1677011, hasta: 2515516, alicuota: 0.19 },
    { desde: 2515516, hasta: 3354022, alicuota: 0.23 },
    { desde: 3354022, hasta: 5031033, alicuota: 0.27 },
    { desde: 5031033, hasta: 6708044, alicuota: 0.31 },
    { desde: 6708044, hasta: Infinity, alicuota: 0.35 },
  ],
};

// Aportes del empleado en relación de dependencia
export const APORTES_EMPLEADO = {
  jubilacion: { tasa: 0.11, nombre: "Aporte Jubilatorio (SIPA)", normativa: "Ley 24.241, Art. 11", nivel: "nacional" },
  obraSocial: { tasa: 0.03, nombre: "Obra Social", normativa: "Ley 23.660, Art. 16", nivel: "nacional" },
  pami: { tasa: 0.03, nombre: "INSSJP (PAMI)", normativa: "Ley 19.032, Art. 8", nivel: "nacional" },
  anssal: { tasa: 0.005, nombre: "ANSSAL (Fondo Solidario Redistrib.)", normativa: "Decreto 492/95", nivel: "nacional" },
};

// Contribuciones patronales (las paga el empleador, el trabajador nunca las ve)
export const CONTRIBUCIONES_PATRONALES = {
  jubilacion: { tasa: 0.1077, nombre: "Contribución Jubilatoria (SIPA)", normativa: "Ley 24.241, Art. 11", nivel: "nacional" },
  obraSocial: { tasa: 0.06, nombre: "Obra Social (patronal)", normativa: "Ley 23.660, Art. 16", nivel: "nacional" },
  art: { tasa: 0.025, nombre: "ART (Riesgos del Trabajo)", normativa: "Ley 24.557", nivel: "nacional", nota: "Promedio estimado — varía por actividad" },
  asignaciones: { tasa: 0.0444, nombre: "Asignaciones Familiares", normativa: "Ley 24.714", nivel: "nacional" },
};

// Monotributo 2026
export const MONOTRIBUTO_2026 = {
  A: { impuesto: 5014, jubilacion: 13245, obraSocial: 18513, ingresoMaxAnual: 7813063 },
  B: { impuesto: 5532, jubilacion: 13245, obraSocial: 18513, ingresoMaxAnual: 11447046 },
  C: { impuesto: 6254, jubilacion: 13245, obraSocial: 18513, ingresoMaxAnual: 16050091 },
  D: { impuesto: 7806, jubilacion: 13245, obraSocial: 18513, ingresoMaxAnual: 19926340 },
  E: { impuesto: 10128, jubilacion: 13245, obraSocial: 18513, ingresoMaxAnual: 23439696 },
  F: { impuesto: 13245, jubilacion: 13245, obraSocial: 18513, ingresoMaxAnual: 29374695 },
  G: { impuesto: 17419, jubilacion: 13245, obraSocial: 18513, ingresoMaxAnual: 35225634 },
  H: { impuesto: 30060, jubilacion: 13245, obraSocial: 18513, ingresoMaxAnual: 52838452 },
  I: { impuesto: 36072, jubilacion: 13245, obraSocial: 18513, ingresoMaxAnual: 58728503 },
  J: { impuesto: 47336, jubilacion: 13245, obraSocial: 18513, ingresoMaxAnual: 67555647 },
  K: { impuesto: 57002, jubilacion: 13245, obraSocial: 18513, ingresoMaxAnual: 82803297 },
};
export const MONOTRIBUTO_NORMATIVA = "Ley 24.977, modif. Ley 27.618 — Valores 2026 (Res. ARCA)";

// Costos regulatorios nacionales (no son impuestos pero son costos obligatorios por regulación)
export const COSTOS_REGULATORIOS_NACIONALES = {
  vtv: {
    nombre: "VTV (Verificación Técnica Vehicular)",
    normativa: "Ley 24.449, Art. 34 / Res. provincial",
    costoAnualEstimado: 45000,
    nota: "Obligatoria anual para vehículos +2 años. Varía por jurisdicción.",
  },
  seguroAutomotor: {
    nombre: "Seguro Obligatorio (RCF)",
    normativa: "Ley 17.418 / Res. SSN 21.999",
    porcentajeImpuestoEnSeguro: 0.235,
    detalle: {
      iva: { tasa: 0.21, nombre: "IVA sobre prima" },
      iibb: { tasa: 0.025, nombre: "IIBB (promedio)" },
      ssn: { tasa: 0.01, nombre: "Tasa SSN", normativa: "Ley 20.091" },
      bomberos: { tasa: 0.005, nombre: "Contribución Bomberos Voluntarios" },
    },
    nota: "El seguro es obligatorio. ~23.5% de la prima son impuestos y tasas.",
  },
  selladoContratos: {
    nombre: "Impuesto de Sellos (contratos)",
    normativa: "Código Fiscal de cada jurisdicción",
    nota: "Se paga al firmar contrato de alquiler. Varía 1-1.5% del total del contrato.",
  },
};

// Carga impositiva en servicios públicos (regulados)
export const IMPUESTOS_SERVICIOS_REGULADOS = {
  electricidad: {
    nombre: "Electricidad",
    cargasEnFactura: [
      { nombre: "IVA 10.5%", tasa: 0.105, normativa: "Ley 23.349" },
      { nombre: "Contribución Municipal (alumbrado público)", tasa: 0.065, normativa: "Ordenanzas municipales" },
      { nombre: "Fondo Santa Cruz / Subsidio", tasa: 0.06, normativa: "Ley 23.681" },
      { nombre: "ENRE (Tasa regulatoria)", tasa: 0.005, normativa: "Ley 24.065" },
    ],
    porcentajeImpuestosEstimado: 0.235,
    nota: "~23.5% de la factura son impuestos y cargos regulatorios.",
  },
  gas: {
    nombre: "Gas Natural",
    cargasEnFactura: [
      { nombre: "IVA 10.5%", tasa: 0.105, normativa: "Ley 23.349" },
      { nombre: "Imp. al Cheque (trasladado)", tasa: 0.012, normativa: "Ley 25.413" },
      { nombre: "ENARGAS (Tasa regulatoria)", tasa: 0.005, normativa: "Ley 24.076" },
    ],
    porcentajeImpuestosEstimado: 0.122,
    nota: "~12% de la factura son impuestos.",
  },
  agua: {
    nombre: "Agua y Cloacas",
    cargasEnFactura: [
      { nombre: "IVA 10.5%", tasa: 0.105, normativa: "Ley 23.349" },
      { nombre: "ERAS (Tasa regulatoria)", tasa: 0.003, normativa: "Ley 26.221" },
    ],
    porcentajeImpuestosEstimado: 0.108,
    nota: "~10.8% de la factura son impuestos.",
  },
};

// Totales precalculados para comodidad
export const TASA_TOTAL_APORTES_EMPLEADO = Object.values(APORTES_EMPLEADO).reduce(
  (sum, v) => sum + v.tasa, 0
);
export const TASA_TOTAL_CONTRIBUCIONES_PATRONALES = Object.values(CONTRIBUCIONES_PATRONALES).reduce(
  (sum, v) => sum + v.tasa, 0
);
