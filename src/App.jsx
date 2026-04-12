import { useCalculadora } from "./hooks/useCalculadora";
import ProgressBar from "./components/ProgressBar";
import StepModo from "./components/StepModo";
import StepSueldo from "./components/StepSueldo";
import StepUbicacion from "./components/StepUbicacion";
import StepGastos from "./components/StepGastos";
import ResultadoFinal from "./components/ResultadoFinal";

export default function App() {
  const calc = useCalculadora();

  const renderStep = () => {
    switch (calc.pasoActual) {
      case "modo":
        return (
          <StepModo
            modo={calc.modo}
            setModo={calc.setModo}
          />
        );
      case "sueldo":
        return <StepSueldo sueldo={calc.sueldo} setSueldo={calc.setSueldo} provincia={calc.provincia} />;
      case "ubicacion":
        return (
          <StepUbicacion
            provincia={calc.provincia}
            municipio={calc.municipio}
            setUbicacion={calc.setUbicacion}
          />
        );
      case "gastos":
        return (
          <StepGastos
            gastos={calc.gastos}
            setGastos={calc.setGastos}
            auto={calc.auto}
            setAuto={calc.setAuto}
            inmueble={calc.inmueble}
            setInmueble={calc.setInmueble}
            provincia={calc.provincia}
            municipio={calc.municipio}
          />
        );
      case "resultado":
        return (
          <ResultadoFinal
            resultado={calc.resultado}
            provincia={calc.provincia}
            modo={calc.modo}
            reiniciar={calc.reiniciar}
          />
        );
      default:
        return null;
    }
  };

  const isResultado = calc.pasoActual === "resultado";
  const isModo = calc.pasoActual === "modo";

  // Progress bar step labels depend on mode
  const stepLabels = calc.pasos
    ? calc.pasos.filter(p => p !== "modo").map(p => {
        switch (p) {
          case "sueldo": return "SUELDO";
          case "ubicacion": return "UBICACIÓN";
          case "gastos": return "GASTOS";
          case "resultado": return "RESULTADO";
          default: return p.toUpperCase();
        }
      })
    : [];

  return (
    <div className="app">
      <header className="header">
        <h1 className="logo" onClick={calc.reiniciar}>
          HASTA CUÁNDO
        </h1>
        <p className="tagline">
          Calculá hasta cuándo del año trabajás para el sistema.
        </p>
      </header>

      {!isResultado && !isModo && calc.modo && (
        <ProgressBar
          paso={calc.pasoNumero}
          totalPasos={calc.totalPasos}
          labels={stepLabels}
        />
      )}

      <main className="main">
        <div className="step-container">{renderStep()}</div>
      </main>

      {!isResultado && (
        <footer className="step-footer">
          <div className="step-nav">
            {!isModo && (
              <button className="btn btn-secondary" onClick={calc.anterior}>
                ANTERIOR
              </button>
            )}
            <button
              className="btn btn-primary"
              onClick={calc.siguiente}
              disabled={!calc.puedeAvanzar}
            >
              {calc.isLastStep ? "CALCULAR" : "SIGUIENTE"}
            </button>
          </div>
          <p className="privacy-note">
            Tu información no se envía a ningún servidor. Todo se calcula en tu
            dispositivo.
          </p>
        </footer>
      )}
    </div>
  );
}
