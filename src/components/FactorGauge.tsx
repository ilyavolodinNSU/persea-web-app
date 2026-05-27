import type { ProductNumericFactor } from "../api/types";
import { compactAmount, isNumericConcern } from "../utils/rating";

interface Props {
  factor: ProductNumericFactor;
}

export function FactorGauge({ factor }: Props) {
  const range = factor.maxValue - factor.minValue;
  const raw =
    range === 0 ? 100 : ((factor.amount - factor.minValue) / range) * 100;
  const position = Math.max(0, Math.min(100, raw));
  const concern = isNumericConcern(factor);

  return (
    <div className="factor-gauge">
      <div className="factor-head">
        <div>
          <h3>{factor.factorName}</h3>
          <p>{concern ? "На границе нормы" : "В пределах ориентира"}</p>
        </div>
        <strong>
          {compactAmount(factor.amount)}
          {factor.unitName && <span> {factor.unitName}</span>}
        </strong>
      </div>
      <div className="gauge-track">
        <span className="gauge-safe" />
        <span className="gauge-mid" />
        <span className="gauge-risk" />
        <i style={{ left: `${position}%` }} />
      </div>
      <div className="gauge-scale">
        <span>{compactAmount(factor.minValue)}</span>
        <span>{compactAmount(factor.maxValue)}</span>
      </div>
    </div>
  );
}
