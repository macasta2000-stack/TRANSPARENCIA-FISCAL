import { forwardRef } from "react";

const ShareCard = forwardRef(function ShareCard({ taxFreedomDay, porcentaje }, ref) {
  return (
    <div ref={ref} className="share-card">
      <div className="share-card-inner">
        <div className="share-card-header">
          <span className="share-card-logo">HASTA CUÁNDO</span>
        </div>

        <div className="share-card-body">
          <p className="share-card-pre">TRABAJO PARA EL ESTADO</p>
          <p className="share-card-pre">HASTA EL</p>
          <h2 className="share-card-fecha">
            {taxFreedomDay.dia} DE {taxFreedomDay.mes.toUpperCase()}
          </h2>
        </div>

        <div className="share-card-stat">
          <p>
            De cada $100 que genero, <strong>${porcentaje}</strong> son impuestos
          </p>
        </div>

        <div className="share-card-footer">
          <span className="share-card-cta">Calculá el tuyo</span>
          <span className="share-card-url">hastacuando.ar</span>
        </div>
      </div>
    </div>
  );
});

export default ShareCard;
