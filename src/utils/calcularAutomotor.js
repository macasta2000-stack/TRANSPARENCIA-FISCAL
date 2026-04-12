import { AUTOMOTOR } from "../data/automotor";
import { COSTOS_REGULATORIOS_NACIONALES } from "../data/impuestos-nacionales";
import { IIBB } from "../data/impuestos-provinciales";

export function calcularAutomotor(auto, provincia) {
  if (!auto || !auto.valuacion) return { total: 0, items: [], costosRegulatorios: [] };

  const config = AUTOMOTOR[provincia];
  if (!config) return { total: 0, items: [], costosRegulatorios: [] };

  const valuacion = auto.valuacion;

  let alicuota = config.escala[0].alicuota;
  for (const tramo of config.escala) {
    if (valuacion <= tramo.hasta) {
      alicuota = tramo.alicuota;
      break;
    }
  }

  const impuestoAnual = valuacion * alicuota;
  const patenteMensual = impuestoAnual / 12;

  const items = [
    {
      nombre: config.nombre,
      monto: patenteMensual,
      tasa: alicuota,
      nivel: "provincial",
      normativa: config.normativa,
      nota: `Valuación fiscal: $${valuacion.toLocaleString("es-AR")} — Alícuota: ${(alicuota * 100).toFixed(1)}%`,
    },
  ];

  // Impuestos dentro del seguro
  let seguroImpuestos = 0;
  if (auto.seguro) {
    const seguroReg = COSTOS_REGULATORIOS_NACIONALES.seguroAutomotor;
    const iibbSeguros = IIBB[provincia]?.seguros?.tasa || 0.06;

    const ivaSeguro = auto.seguro * seguroReg.detalle.iva.tasa / (1 + seguroReg.porcentajeImpuestoEnSeguro);
    const iibbSeguro = auto.seguro * iibbSeguros / (1 + seguroReg.porcentajeImpuestoEnSeguro);
    const ssnSeguro = auto.seguro * seguroReg.detalle.ssn.tasa / (1 + seguroReg.porcentajeImpuestoEnSeguro);
    const bomberosSeguro = auto.seguro * seguroReg.detalle.bomberos.tasa / (1 + seguroReg.porcentajeImpuestoEnSeguro);

    seguroImpuestos = ivaSeguro + iibbSeguro + ssnSeguro + bomberosSeguro;

    items.push(
      { nombre: "IVA sobre prima de seguro", monto: ivaSeguro, tasa: seguroReg.detalle.iva.tasa, nivel: "nacional", normativa: "Ley 23.349" },
      { nombre: "IIBB sobre seguros", monto: iibbSeguro, tasa: iibbSeguros, nivel: "provincial", normativa: IIBB[provincia]?.seguros?.normativa || "" },
      { nombre: "Tasa SSN (Superintendencia de Seguros)", monto: ssnSeguro, tasa: seguroReg.detalle.ssn.tasa, nivel: "nacional", normativa: seguroReg.detalle.ssn.normativa },
      { nombre: "Contribución Bomberos Voluntarios", monto: bomberosSeguro, tasa: seguroReg.detalle.bomberos.tasa, nivel: "nacional", normativa: "" },
    );
  }

  // Costos regulatorios (no son impuestos pero son obligatorios)
  const vtv = COSTOS_REGULATORIOS_NACIONALES.vtv;
  const costosRegulatorios = [
    {
      nombre: vtv.nombre,
      montoMensual: vtv.costoAnualEstimado / 12,
      normativa: vtv.normativa,
      nota: vtv.nota,
    },
  ];

  return {
    total: patenteMensual + seguroImpuestos,
    items,
    costosRegulatorios,
  };
}
