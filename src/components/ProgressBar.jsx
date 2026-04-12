export default function ProgressBar({ paso, totalPasos, labels }) {
  const steps = labels.map((label, i) => ({ num: i + 1, label }));
  const progreso = totalPasos > 1 ? ((paso - 1) / (totalPasos - 1)) * 100 : 0;

  return (
    <div className="progress-bar">
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progreso}%` }} />
      </div>
      <div className="progress-steps">
        {steps.map((p) => (
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
