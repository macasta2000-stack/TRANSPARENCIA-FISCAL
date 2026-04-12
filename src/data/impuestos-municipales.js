// =====================================================
// IMPUESTOS MUNICIPALES — Detalle por jurisdicción
// =====================================================

export const ABL_INMOBILIARIO = {
  CABA: {
    alicuota_base: 0.0035,
    minimo_bimestral: 8500,
    nombre: "ABL (Alumbrado, Barrido y Limpieza)",
    normativa: "Ley Tarifaria CABA 6927/2026",
    incluye: ["Alumbrado público", "Barrido y limpieza", "Mantenimiento de sumideros", "Pavimento y aceras"],
    fuente: "AGIP ABL 2026",
  },
  BUENOS_AIRES: {
    alicuota_base: 0.004,
    nombre: "Impuesto Inmobiliario + Tasa Municipal",
    normativa: "Ley Impositiva PBA 15.558/2026",
    incluye: ["Impuesto inmobiliario provincial", "Tasa de servicios urbanos"],
    fuente: "ARBA 2026",
  },
  CORDOBA: {
    alicuota_base: 0.0038,
    nombre: "Contribución Inmobiliaria",
    normativa: "Código Tributario Córdoba",
    incluye: ["Contribución inmobiliaria provincial", "Tasa servicios municipales"],
    fuente: "DGR Córdoba 2025",
  },
  SANTA_FE: {
    alicuota_base: 0.0035,
    nombre: "Impuesto Inmobiliario",
    normativa: "Ley Impositiva Santa Fe",
    incluye: ["Impuesto inmobiliario provincial", "TGI (Tasa General de Inmuebles)"],
    fuente: "DGR Santa Fe 2025",
  },
  MENDOZA: {
    alicuota_base: 0.003,
    nombre: "Impuesto Inmobiliario",
    normativa: "Ley Tarifaria Mendoza",
    incluye: ["Impuesto inmobiliario provincial", "Tasa municipal de servicios"],
    fuente: "ATM Mendoza 2025",
  },
};

// Tasas municipales sobre actividad comercial (trasladadas al consumidor)
export const TASAS_MUNICIPALES = {
  CABA: {
    tish: { tasa: 0, nombre: "N/A (CABA no cobra TISH separado)", normativa: "Incluido en IIBB CABA" },
    publicidad: { tasa: 0.003, nombre: "Contribución Publicidad y Propaganda", normativa: "Código Fiscal CABA" },
    total_estimado: 0.003,
    fuente: "AGIP CABA",
  },
  BUENOS_AIRES: {
    tish: { tasa: 0.008, nombre: "TISH (Tasa Insp. Seguridad e Higiene)", normativa: "Ordenanzas municipales PBA" },
    alumbrado: { tasa: 0.003, nombre: "Tasa Alumbrado Público", normativa: "Ordenanzas municipales PBA" },
    publicidad: { tasa: 0.002, nombre: "Tasa Publicidad y Propaganda", normativa: "Ordenanzas municipales PBA" },
    total_estimado: 0.013,
    fuente: "Municipalidades PBA",
    nota: "Varía significativamente por municipio. Valores promedio.",
  },
  CORDOBA: {
    tish: { tasa: 0.007, nombre: "Contribución Comercio e Industria", normativa: "Código Tributario Municipal Córdoba" },
    alumbrado: { tasa: 0.003, nombre: "Tasa Alumbrado Público", normativa: "Ordenanza municipal" },
    total_estimado: 0.01,
    fuente: "Municipalidad de Córdoba",
  },
  SANTA_FE: {
    drei: { tasa: 0.008, nombre: "DReI (Derecho Registro e Inspección)", normativa: "Código Tributario Municipal" },
    alumbrado: { tasa: 0.003, nombre: "TGI (Tasa General de Inmuebles)", normativa: "Código Tributario Municipal" },
    total_estimado: 0.011,
    fuente: "Municipalidades Santa Fe",
  },
  MENDOZA: {
    tish: { tasa: 0.006, nombre: "Derecho de Inspección y Registro", normativa: "Código Tributario Municipal" },
    alumbrado: { tasa: 0.002, nombre: "Tasa Alumbrado y Limpieza", normativa: "Ordenanza municipal" },
    total_estimado: 0.008,
    fuente: "Municipalidades Mendoza",
  },
};
