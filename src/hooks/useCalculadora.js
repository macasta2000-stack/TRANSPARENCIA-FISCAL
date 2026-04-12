import { useState, useCallback, useMemo } from "react";
import { calcularTaxFreedomDay } from "../utils/taxFreedomDay";

const INITIAL_STATE = {
  paso: 1,
  sueldo: {
    tipo: "neto",
    monto: "",
    relacion: "dependencia",
    categoriaMonotributo: "A",
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
      const nextPaso = prev.paso + 1;
      if (nextPaso === 4) {
        const resultado = calcularTaxFreedomDay({
          sueldo: {
            ...prev.sueldo,
            monto: parseFloat(prev.sueldo.monto) || 0,
          },
          provincia: prev.provincia,
          gastos: Object.fromEntries(
            Object.entries(prev.gastos).map(([k, v]) => [
              k,
              typeof v === "boolean" ? v : parseFloat(v) || 0,
            ])
          ),
          auto: prev.auto
            ? {
                valuacion: parseFloat(prev.auto.valuacion) || 0,
                seguro: parseFloat(prev.auto.seguro) || 0,
              }
            : null,
          inmueble: prev.inmueble
            ? {
                ...prev.inmueble,
                valuacionFiscal: parseFloat(prev.inmueble.valuacionFiscal) || 0,
                montoBimestral: parseFloat(prev.inmueble.montoBimestral) || 0,
              }
            : null,
        });
        return { ...prev, paso: nextPaso, resultado };
      }
      return { ...prev, paso: nextPaso };
    });
  }, []);

  const anterior = useCallback(() => {
    setState((prev) => ({ ...prev, paso: Math.max(1, prev.paso - 1) }));
  }, []);

  const reiniciar = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  const puedeAvanzar = useMemo(() => {
    switch (state.paso) {
      case 1:
        return (
          state.sueldo.monto &&
          parseFloat(state.sueldo.monto) > 0 &&
          state.sueldo.relacion
        );
      case 2:
        return !!state.provincia;
      case 3:
        return true; // All categories are optional
      case 4:
        return true;
      default:
        return false;
    }
  }, [state.paso, state.sueldo, state.provincia]);

  return {
    ...state,
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
