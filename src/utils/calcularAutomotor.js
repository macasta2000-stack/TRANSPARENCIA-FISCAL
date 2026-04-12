import { AUTOMOTOR } from "../data/automotor";

export function calcularAutomotor(auto, provincia) {
  if (!auto || !auto.valuacion) return 0;

  const config = AUTOMOTOR[provincia];
  if (!config) return 0;

  const valuacion = auto.valuacion;

  // Find the applicable rate from the progressive scale
  let alicuota = config.escala[0].alicuota;
  for (const tramo of config.escala) {
    if (valuacion <= tramo.hasta) {
      alicuota = tramo.alicuota;
      break;
    }
  }

  // Annual tax
  const impuestoAnual = valuacion * alicuota;

  // Also add insurance tax (IVA on insurance)
  const seguroImpuesto = auto.seguro ? auto.seguro * 0.21 : 0;

  // Return monthly amount
  return impuestoAnual / 12 + seguroImpuesto;
}
