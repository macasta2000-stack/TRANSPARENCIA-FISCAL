const PASOS = [
  { num: 1, label: "Sueldo" },
  { num: 2, label: "Ubicación" },
  { num: 3, label: "Gastos" },
  { num: 4, label: "Resultado" },
];

export default function ProgressBar({ paso }) {
  const progreso = ((paso - 1) / (PASOS.length - 1)) * 100;

  return (
    <div className="progress-bar">
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progreso}%` }} />
      </div>
      <div className="progress-steps">
        {PASOS.map((p) => (
          <div
            key={p.num}
            className={`progress-step ${paso >= p.num ? "active" : ""} ${
              paso === p.num ? "current" : ""
            }`}
          >
            <span className="step-dot">{paso > p.num ? "✓" : p.num}</span>
            <span className="step-label">{p.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
