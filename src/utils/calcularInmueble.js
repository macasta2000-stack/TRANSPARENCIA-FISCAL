import { ABL_INMOBILIARIO } from "../data/impuestos-municipales";

export function calcularInmueble(inmueble, provincia) {
  if (!inmueble || inmueble.tipo !== "propietario") return { total: 0, items: [] };

  const config = ABL_INMOBILIARIO[provincia];
  if (!config) return { total: 0, items: [] };

  let montoMensual = 0;

  if (inmueble.montoBimestral) {
    montoMensual = inmueble.montoBimestral / 2;
  } else if (inmueble.valuacionFiscal) {
    const impuestoBimestral = Math.max(
      inmueble.valuacionFiscal * config.alicuota_base,
      config.minimo_bimestral || 0
    );
    montoMensual = impuestoBimestral / 2;
  }

  if (montoMensual <= 0) return { total: 0, items: [] };

  const items = [
    {
      nombre: config.nombre,
      monto: montoMensual,
      tasa: config.alicuota_base,
      nivel: "municipal",
      normativa: config.normativa,
      incluye: config.incluye,
      nota: config.incluye ? `Incluye: ${config.incluye.join(", ")}` : undefined,
    },
  ];

  return {
    total: montoMensual,
    items,
  };
}
