export const AUTOMOTOR = {
  CABA: {
    nombre: "Patentes (Imp. Automotor)",
    normativa: "Ley Tarifaria CABA 6927/2026",
    escala: [
      { hasta: 1000000, alicuota: 0.016 },
      { hasta: 2000000, alicuota: 0.02 },
      { hasta: 4000000, alicuota: 0.025 },
      { hasta: Infinity, alicuota: 0.03 },
    ],
    pagos_anuales: 6,
    fuente: "AGIP 2026",
  },
  BUENOS_AIRES: {
    nombre: "Impuesto a los Automotores",
    normativa: "Ley Impositiva PBA 15.558/2026",
    escala: [
      { hasta: 1500000, alicuota: 0.017 },
      { hasta: 3000000, alicuota: 0.022 },
      { hasta: 6000000, alicuota: 0.028 },
      { hasta: Infinity, alicuota: 0.035 },
    ],
    pagos_anuales: 5,
    fuente: "ARBA 2026",
  },
  CORDOBA: {
    nombre: "Impuesto a la Propiedad Automotor",
    normativa: "Código Tributario Córdoba",
    escala: [
      { hasta: 2000000, alicuota: 0.018 },
      { hasta: 4000000, alicuota: 0.023 },
      { hasta: Infinity, alicuota: 0.028 },
    ],
    pagos_anuales: 6,
    fuente: "DGR Córdoba 2025",
  },
  SANTA_FE: {
    nombre: "Patente Única sobre Vehículos",
    normativa: "Ley Impositiva Santa Fe",
    escala: [
      { hasta: 1500000, alicuota: 0.016 },
      { hasta: 3500000, alicuota: 0.02 },
      { hasta: Infinity, alicuota: 0.025 },
    ],
    pagos_anuales: 6,
    fuente: "DGR Santa Fe 2025",
  },
  MENDOZA: {
    nombre: "Impuesto Automotor",
    normativa: "Ley Tarifaria Mendoza",
    escala: [
      { hasta: 2000000, alicuota: 0.015 },
      { hasta: 4000000, alicuota: 0.02 },
      { hasta: Infinity, alicuota: 0.025 },
    ],
    pagos_anuales: 4,
    fuente: "ATM Mendoza 2025",
  },

  // 19 provincias adicionales — escalas estimadas de códigos fiscales provinciales
  TUCUMAN: {
    nombre: "Impuesto Automotor", normativa: "Código Fiscal Tucumán",
    escala: [{ hasta: 1500000, alicuota: 0.018 }, { hasta: 3500000, alicuota: 0.024 }, { hasta: Infinity, alicuota: 0.03 }],
    pagos_anuales: 6, fuente: "DGR Tucumán 2025",
  },
  ENTRE_RIOS: {
    nombre: "Impuesto Automotor", normativa: "Código Fiscal Entre Ríos",
    escala: [{ hasta: 1500000, alicuota: 0.017 }, { hasta: 3000000, alicuota: 0.022 }, { hasta: Infinity, alicuota: 0.028 }],
    pagos_anuales: 6, fuente: "ATER Entre Ríos 2025",
  },
  SALTA: {
    nombre: "Impuesto Automotor", normativa: "Código Fiscal Salta",
    escala: [{ hasta: 1500000, alicuota: 0.016 }, { hasta: 3000000, alicuota: 0.021 }, { hasta: Infinity, alicuota: 0.027 }],
    pagos_anuales: 6, fuente: "DGR Salta 2025",
  },
  MISIONES: {
    nombre: "Impuesto Automotor", normativa: "Código Fiscal Misiones",
    escala: [{ hasta: 1500000, alicuota: 0.018 }, { hasta: 3000000, alicuota: 0.024 }, { hasta: Infinity, alicuota: 0.03 }],
    pagos_anuales: 6, fuente: "DGR Misiones 2025",
  },
  CHACO: {
    nombre: "Impuesto Automotor", normativa: "Código Fiscal Chaco",
    escala: [{ hasta: 1500000, alicuota: 0.017 }, { hasta: 3000000, alicuota: 0.023 }, { hasta: Infinity, alicuota: 0.029 }],
    pagos_anuales: 6, fuente: "ATP Chaco 2025",
  },
  CORRIENTES: {
    nombre: "Impuesto Automotor", normativa: "Código Fiscal Corrientes",
    escala: [{ hasta: 1500000, alicuota: 0.016 }, { hasta: 3000000, alicuota: 0.021 }, { hasta: Infinity, alicuota: 0.027 }],
    pagos_anuales: 6, fuente: "DGR Corrientes 2025",
  },
  SANTIAGO_DEL_ESTERO: {
    nombre: "Impuesto Automotor", normativa: "Código Fiscal Santiago del Estero",
    escala: [{ hasta: 1500000, alicuota: 0.018 }, { hasta: 3000000, alicuota: 0.024 }, { hasta: Infinity, alicuota: 0.03 }],
    pagos_anuales: 6, fuente: "DGR SdE 2025",
  },
  SAN_JUAN: {
    nombre: "Impuesto Automotor", normativa: "Código Fiscal San Juan",
    escala: [{ hasta: 1500000, alicuota: 0.016 }, { hasta: 3500000, alicuota: 0.021 }, { hasta: Infinity, alicuota: 0.026 }],
    pagos_anuales: 6, fuente: "DGR San Juan 2025",
  },
  SAN_LUIS: {
    nombre: "Impuesto Automotor", normativa: "Código Fiscal San Luis",
    escala: [{ hasta: 2000000, alicuota: 0.015 }, { hasta: 4000000, alicuota: 0.02 }, { hasta: Infinity, alicuota: 0.025 }],
    pagos_anuales: 6, fuente: "DPIP San Luis 2025",
  },
  JUJUY: {
    nombre: "Impuesto Automotor", normativa: "Código Fiscal Jujuy",
    escala: [{ hasta: 1500000, alicuota: 0.016 }, { hasta: 3000000, alicuota: 0.022 }, { hasta: Infinity, alicuota: 0.028 }],
    pagos_anuales: 6, fuente: "DPR Jujuy 2025",
  },
  RIO_NEGRO: {
    nombre: "Impuesto Automotor", normativa: "Código Fiscal Río Negro",
    escala: [{ hasta: 2000000, alicuota: 0.015 }, { hasta: 4000000, alicuota: 0.02 }, { hasta: Infinity, alicuota: 0.025 }],
    pagos_anuales: 6, fuente: "ART Río Negro 2025",
  },
  NEUQUEN: {
    nombre: "Impuesto Automotor", normativa: "Código Fiscal Neuquén",
    escala: [{ hasta: 2000000, alicuota: 0.015 }, { hasta: 4000000, alicuota: 0.02 }, { hasta: Infinity, alicuota: 0.026 }],
    pagos_anuales: 6, fuente: "DPR Neuquén 2025",
  },
  FORMOSA: {
    nombre: "Impuesto Automotor", normativa: "Código Fiscal Formosa",
    escala: [{ hasta: 1500000, alicuota: 0.018 }, { hasta: 3000000, alicuota: 0.024 }, { hasta: Infinity, alicuota: 0.03 }],
    pagos_anuales: 6, fuente: "DGR Formosa 2025",
  },
  CHUBUT: {
    nombre: "Impuesto Automotor", normativa: "Código Fiscal Chubut",
    escala: [{ hasta: 2000000, alicuota: 0.015 }, { hasta: 4000000, alicuota: 0.02 }, { hasta: Infinity, alicuota: 0.025 }],
    pagos_anuales: 6, fuente: "DGR Chubut 2025",
  },
  LA_PAMPA: {
    nombre: "Impuesto Automotor", normativa: "Código Fiscal La Pampa",
    escala: [{ hasta: 2000000, alicuota: 0.015 }, { hasta: 4000000, alicuota: 0.02 }, { hasta: Infinity, alicuota: 0.025 }],
    pagos_anuales: 6, fuente: "DGR La Pampa 2025",
  },
  CATAMARCA: {
    nombre: "Impuesto Automotor", normativa: "Código Fiscal Catamarca",
    escala: [{ hasta: 1500000, alicuota: 0.017 }, { hasta: 3000000, alicuota: 0.023 }, { hasta: Infinity, alicuota: 0.028 }],
    pagos_anuales: 6, fuente: "AGIP Catamarca 2025",
  },
  LA_RIOJA: {
    nombre: "Impuesto Automotor", normativa: "Código Fiscal La Rioja",
    escala: [{ hasta: 2000000, alicuota: 0.015 }, { hasta: 4000000, alicuota: 0.02 }, { hasta: Infinity, alicuota: 0.025 }],
    pagos_anuales: 6, fuente: "DGIP La Rioja 2025",
  },
  SANTA_CRUZ: {
    nombre: "Impuesto Automotor", normativa: "Código Fiscal Santa Cruz",
    escala: [{ hasta: 2000000, alicuota: 0.014 }, { hasta: 4000000, alicuota: 0.019 }, { hasta: Infinity, alicuota: 0.024 }],
    pagos_anuales: 6, fuente: "ASIP Santa Cruz 2025",
  },
  TIERRA_DEL_FUEGO: {
    nombre: "Impuesto Automotor", normativa: "Código Fiscal TdF",
    escala: [{ hasta: 2000000, alicuota: 0.012 }, { hasta: 4000000, alicuota: 0.017 }, { hasta: Infinity, alicuota: 0.022 }],
    pagos_anuales: 4, fuente: "AREF TdF 2025",
  },
};
