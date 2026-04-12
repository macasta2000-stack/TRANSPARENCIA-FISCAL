export const IVA = {
  general: 0.21,
  reducido: 0.105,
  exento: 0,
};

export const IMPUESTO_COMBUSTIBLES = {
  nafta_super: {
    iva_porcentaje: 0.21,
    impuesto_transferencia: 137.09,
    tasa_infraestructura: 0.091,
  },
};

export const IMPUESTO_INTERNO_TELECOM = 0.17;
export const TASA_CNC = 0.01;

export const IMPUESTO_DEBITOS_CREDITOS = 0.006;

export const GANANCIAS_4TA = {
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

export const APORTES_EMPLEADO = {
  jubilacion: 0.11,
  obraSocial: 0.03,
  pami: 0.03,
  anssal: 0.005,
};

export const CONTRIBUCIONES_PATRONALES = {
  jubilacion: 0.1077,
  obraSocial: 0.06,
  art: 0.025,
  asignaciones: 0.0444,
};

export const MONOTRIBUTO_2026 = {
  A: { impuesto: 5014, jubilacion: 13245, obraSocial: 18513 },
  B: { impuesto: 5532, jubilacion: 13245, obraSocial: 18513 },
  C: { impuesto: 6254, jubilacion: 13245, obraSocial: 18513 },
  D: { impuesto: 7806, jubilacion: 13245, obraSocial: 18513 },
  E: { impuesto: 10128, jubilacion: 13245, obraSocial: 18513 },
  F: { impuesto: 13245, jubilacion: 13245, obraSocial: 18513 },
  G: { impuesto: 17419, jubilacion: 13245, obraSocial: 18513 },
  H: { impuesto: 30060, jubilacion: 13245, obraSocial: 18513 },
  I: { impuesto: 36072, jubilacion: 13245, obraSocial: 18513 },
  J: { impuesto: 47336, jubilacion: 13245, obraSocial: 18513 },
  K: { impuesto: 57002, jubilacion: 13245, obraSocial: 18513 },
};

export const TASA_TOTAL_APORTES_EMPLEADO = Object.values(APORTES_EMPLEADO).reduce(
  (sum, v) => sum + v,
  0
);

export const TASA_TOTAL_CONTRIBUCIONES_PATRONALES = Object.values(
  CONTRIBUCIONES_PATRONALES
).reduce((sum, v) => sum + v, 0);
