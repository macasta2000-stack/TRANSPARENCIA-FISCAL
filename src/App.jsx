import { useCalculadora } from "./hooks/useCalculadora";
import ProgressBar from "./components/ProgressBar";
import StepSueldo from "./components/StepSueldo";
import StepUbicacion from "./components/StepUbicacion";
import StepGastos from "./components/StepGastos";
import ResultadoFinal from "./components/ResultadoFinal";

export default function App() {
  const calc = useCalculadora();

  const renderStep = () => {
    switch (calc.paso) {
      case 1:
        return <StepSueldo sueldo={calc.sueldo} setSueldo={calc.setSueldo} />;
      case 2:
        return (
          <StepUbicacion
            provincia={calc.provincia}
            municipio={calc.municipio}
            setUbicacion={calc.setUbicacion}
          />
        );
      case 3:
        return (
          <StepGastos
            gastos={calc.gastos}
            setGastos={calc.setGastos}
            auto={calc.auto}
            setAuto={calc.setAuto}
            inmueble={calc.inmueble}
            setInmueble={calc.setInmueble}
            provincia={calc.provincia}
          />
        );
      case 4:
        return (
          <ResultadoFinal
            resultado={calc.resultado}
            provincia={calc.provincia}
            reiniciar={calc.reiniciar}
          />
        );
      default:
        return null;
    }
  };

  const isResultado = calc.paso >= 4;

  return (
    <div className="app">
      <header className="header">
        <h1 className="logo" onClick={calc.reiniciar}>
          HASTA CUÁNDO
        </h1>
        <p className="tagline">
          Calculá hasta cuándo del año trabajás para el Estado.
        </p>
      </header>

      {!isResultado && <ProgressBar paso={calc.paso} />}

      <main className="main">
        <div className="step-container">{renderStep()}</div>
      </main>

      {!isResultado && (
        <footer className="step-footer">
          <div className="step-nav">
            {calc.paso > 1 && (
              <button className="btn btn-secondary" onClick={calc.anterior}>
                ANTERIOR
              </button>
            )}
            <button
              className="btn btn-primary"
              onClick={calc.siguiente}
              disabled={!calc.puedeAvanzar}
            >
              {calc.paso === 3 ? "CALCULAR" : "SIGUIENTE"}
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
