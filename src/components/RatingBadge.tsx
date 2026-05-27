import { ratingLabel, toneClass } from "../utils/rating";

interface Props {
  rating?: number | null;
  compact?: boolean;
}

export function RatingBadge({ rating, compact }: Props) {
  return (
    <span className={`rating-badge ${toneClass(rating)} ${compact ? "compact" : ""}`}>
      <span className="rating-dot" />
      <strong>{rating ?? "?"}</strong>
      {!compact && <span>/100</span>}
      <em>{ratingLabel(rating)}</em>
    </span>
  );
}
