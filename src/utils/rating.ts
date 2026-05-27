import type {
  ProductBooleanFactor,
  ProductDetail,
  ProductEnumFactor,
  ProductNumericFactor,
  ProductItem,
} from "../api/types";

export type RatingTone = "excellent" | "good" | "watch" | "poor" | "unknown";

export function ratingTone(rating?: number | null): RatingTone {
  if (rating === undefined || rating === null) return "unknown";
  if (rating >= 85) return "excellent";
  if (rating >= 70) return "good";
  if (rating >= 50) return "watch";
  return "poor";
}

export function ratingLabel(rating?: number | null) {
  switch (ratingTone(rating)) {
    case "excellent":
      return "Отлично";
    case "good":
      return "Хорошо";
    case "watch":
      return "Проверить";
    case "poor":
      return "Риск";
    default:
      return "Нет оценки";
  }
}

export function toneClass(rating?: number | null) {
  return `tone-${ratingTone(rating)}`;
}

export function normalizeProductImage(item: Pick<ProductItem, "imageURI">) {
  if (!item.imageURI) return undefined;
  if (/\.(png|jpe?g|webp|gif|avif)(\?.*)?$/i.test(item.imageURI)) {
    return item.imageURI;
  }
  return undefined;
}

export function compactAmount(value: number) {
  if (Number.isInteger(value)) return String(value);
  if (Math.abs(value) < 0.01 && value !== 0) return value.toPrecision(2);
  return Number(value.toFixed(3)).toString();
}

export function isNumericConcern(factor: ProductNumericFactor) {
  if (factor.maxValue === factor.minValue) return factor.amount !== factor.maxValue;
  const width = factor.maxValue - factor.minValue;
  const lowerBuffer = factor.minValue + width * 0.12;
  const upperBuffer = factor.maxValue - width * 0.12;

  if (factor.minValue === 0) return factor.amount > upperBuffer;
  return factor.amount < lowerBuffer || factor.amount > upperBuffer;
}

export function splitNumericFactors(factors: ProductNumericFactor[] = []) {
  const concerns = factors.filter(isNumericConcern);
  const positives = factors.filter((factor) => !isNumericConcern(factor));
  return { concerns, positives };
}

export function splitImpactFactors<
  T extends ProductBooleanFactor | ProductEnumFactor,
>(factors: T[] = []) {
  return {
    concerns: factors.filter((factor) => factor.impact < 0),
    positives: factors.filter((factor) => factor.impact >= 0),
  };
}

export function productSummary(product: ProductDetail) {
  const numeric = splitNumericFactors(product.numericFactors ?? []);
  const bools = splitImpactFactors(product.booleanFactors ?? []);
  const enums = splitImpactFactors(product.enumFactors ?? []);

  return {
    concernsCount:
      numeric.concerns.length + bools.concerns.length + enums.concerns.length,
    positivesCount:
      numeric.positives.length + bools.positives.length + enums.positives.length,
    totalFactors:
      (product.numericFactors?.length ?? 0) +
      (product.booleanFactors?.length ?? 0) +
      (product.enumFactors?.length ?? 0),
  };
}
