import { useState, useCallback, useMemo } from "react";
import { calcularTaxFreedomDay } from "../utils/taxFreedomDay";

// Modes define which steps are shown
const MODOS = {
  completo: {
    label: "Analisis completo",
    desc: "Sueldo + gastos + bienes",
    pasos: ["modo", "ubicacion", "sueldo", "gastos", "resultado"],
  },
  sueldo: {
    label: "Solo sueldo",
    desc: "Cuanto te sacan del sueldo",
    pasos: ["modo", "ubicacion", "sueldo", "resultado"],
  },
  gastos: {
    label: "Solo gastos",
    desc: "Cuanto pagas en consumo",
    pasos: ["modo", "ubicacion", "gastos", "resultado"],
  },
  empleador: {
    label: "Soy empleador",
    desc: "Cuanto cuesta realmente contratar",
    pasos: ["modo", "ubicacion", "sueldo", "resultado"],
  },
};

const INITIAL_STATE = {
  modo: null, // null = show mode selector
  pasoIdx: 0,
  sueldo: {
    tipo: "neto",
    monto: "",
    relacion: "dependencia",
    categoriaMonotributo: "A",
    sindicato: "otro",
    afiliadoSindicato: false,
    colegioProfesional: "no_aplica",
    colegioMontoCustom: "",
    cajaMontoCustom: "",
  },
  provincia: "",
  municipio: "",
  gastos: {},
  auto: null,
  inmueble: null,
  resultado: null,
};

export function useCalculadora() {
  const [state, setState] = useState(INITIAL_STATE);

  const modoCfg = state.modo ? MODOS[state.modo] : null;
  const pasos = modoCfg ? modoCfg.pasos : ["modo"];
  const pasoActual = pasos[state.pasoIdx] || "modo";
  const totalPasos = pasos.length - 1; // exclude "modo" from count

  const setModo = useCallback((modo) => {
    setState((prev) => ({ ...prev, modo }));
  }, []);

  const setSueldo = useCallback((updates) => {
    setState((prev) => ({
      ...prev,
      sueldo: { ...prev.sueldo, ...updates },
    }));
  }, []);

  const setUbicacion = useCallback((provincia, municipio) => {
    setState((prev) => ({ ...prev, provincia, municipio }));
  }, []);

  const setGastos = useCallback((updates) => {
    setState((prev) => ({
      ...prev,
      gastos: { ...prev.gastos, ...updates },
    }));
  }, []);

  const setAuto = useCallback((auto) => {
    setState((prev) => ({ ...prev, auto }));
  }, []);

  const setInmueble = useCallback((inmueble) => {
    setState((prev) => ({ ...prev, inmueble }));
  }, []);

  const siguiente = useCallback(() => {
    setState((prev) => {
      const cfg = MODOS[prev.modo];
      if (!cfg) return prev;
      // If we're on mode selector (pasoIdx 0), advance to 1
      const nextIdx = prev.pasoIdx + 1;
      const nextPaso = cfg.pasos[nextIdx];
      if (!nextPaso) return prev;

      if (nextPaso === "resultado") {
        // Build calculation input based on mode
        const sueldoInput = prev.modo !== "gastos" ? {
          ...prev.sueldo,
          monto: parseFloat(prev.sueldo.monto) || 0,
          // En modo empleador, forzar tipo bruto
          tipo: prev.modo === "empleador" ? "bruto" : prev.sueldo.tipo,
        } : {
          tipo: "bruto",
          monto: 0,
          relacion: "dependencia",
          sindicato: "otro",
          afiliadoSindicato: false,
        };

        const gastosInput = prev.modo !== "sueldo" ? Object.fromEntries(
          Object.entries(prev.gastos).map(([k, v]) => [
            k,
            typeof v === "boolean" ? v : parseFloat(v) || 0,
          ])
        ) : {};

        const autoInput = prev.modo !== "sueldo" && prev.auto
          ? {
              valuacion: parseFloat(prev.auto.valuacion) || 0,
              seguro: parseFloat(prev.auto.seguro) || 0,
            }
          : null;

        const inmuebleInput = prev.modo !== "sueldo" && prev.inmueble
          ? {
              ...prev.inmueble,
              valuacionFiscal: parseFloat(prev.inmueble.valuacionFiscal) || 0,
              montoBimestral: parseFloat(prev.inmueble.montoBimestral) || 0,
            }
          : null;

        const resultado = calcularTaxFreedomDay({
          sueldo: sueldoInput,
          provincia: prev.provincia,
          municipio: prev.municipio,
          gastos: gastosInput,
          auto: autoInput,
          inmueble: inmuebleInput,
        });

        return { ...prev, pasoIdx: nextIdx, resultado };
      }
      return { ...prev, pasoIdx: nextIdx };
    });
  }, []);

  const anterior = useCallback(() => {
    setState((prev) => {
      if (prev.pasoIdx <= 1) {
        // Go back to mode selection
        return { ...prev, modo: null, pasoIdx: 0 };
      }
      return { ...prev, pasoIdx: prev.pasoIdx - 1 };
    });
  }, []);

  const reiniciar = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  const puedeAvanzar = useMemo(() => {
    switch (pasoActual) {
      case "modo":
        return !!state.modo;
      case "sueldo":
        return (
          state.sueldo.monto &&
          parseFloat(state.sueldo.monto) > 0 &&
          state.sueldo.relacion
        );
      case "ubicacion":
        return !!state.provincia;
      case "gastos":
        return true;
      case "resultado":
        return true;
      default:
        return false;
    }
  }, [pasoActual, state.modo, state.sueldo, state.provincia]);

  // Step number for progress bar (1-indexed, excludes mode selector)
  const pasoNumero = state.pasoIdx;
  const isLastStep = pasos[state.pasoIdx + 1] === "resultado";

  return {
    ...state,
    pasoActual,
    pasoNumero,
    totalPasos,
    isLastStep,
    modoCfg,
    pasos,
    setModo,
    setSueldo,
    setUbicacion,
    setGastos,
    setAuto,
    setInmueble,
    siguiente,
    anterior,
    reiniciar,
    puedeAvanzar,
  };
}

export { MODOS };
