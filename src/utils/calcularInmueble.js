import { ABL_INMOBILIARIO } from "../data/impuestos-municipales";

export function calcularInmueble(inmueble, provincia) {
  if (!inmueble || inmueble.tipo !== "propietario") return 0;

  const config = ABL_INMOBILIARIO[provincia];
  if (!config) return 0;

  // If user entered the direct bimonthly amount
  if (inmueble.montoBimestral) {
    return inmueble.montoBimestral / 2;
  }

  // If user entered fiscal valuation, calculate
  if (inmueble.valuacionFiscal) {
    const impuestoBimestral = Math.max(
      inmueble.valuacionFiscal * config.alicuota_base,
      config.minimo_bimestral || 0
    );
    return impuestoBimestral / 2;
  }

  return 0;
}
