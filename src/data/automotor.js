export const AUTOMOTOR = {
  CABA: {
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
    escala: [
      { hasta: 2000000, alicuota: 0.018 },
      { hasta: 4000000, alicuota: 0.023 },
      { hasta: Infinity, alicuota: 0.028 },
    ],
    pagos_anuales: 6,
    fuente: "DGR Córdoba 2025",
  },
  SANTA_FE: {
    escala: [
      { hasta: 1500000, alicuota: 0.016 },
      { hasta: 3500000, alicuota: 0.02 },
      { hasta: Infinity, alicuota: 0.025 },
    ],
    pagos_anuales: 6,
    fuente: "DGR Santa Fe 2025",
  },
  MENDOZA: {
    escala: [
      { hasta: 2000000, alicuota: 0.015 },
      { hasta: 4000000, alicuota: 0.02 },
      { hasta: Infinity, alicuota: 0.025 },
    ],
    pagos_anuales: 4,
    fuente: "ATM Mendoza 2025",
  },
};
