import { Droplets } from "lucide-react";
import { useState } from "react";
import type { ProductItem } from "../api/types";
import { normalizeProductImage, ratingTone } from "../utils/rating";

interface Props {
  product: Pick<ProductItem, "name" | "imageURI" | "rating">;
  size?: "sm" | "md" | "lg";
}

export function ProductVisual({ product, size = "md" }: Props) {
  const [failed, setFailed] = useState(false);
  const src = failed ? undefined : normalizeProductImage(product);
  const initials = product.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className={`product-visual product-visual-${size} ${ratingTone(product.rating)}`}>
      {src ? (
        <img
          src={src}
          alt={product.name}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="product-visual-fallback">
          <Droplets size={size === "lg" ? 40 : 24} strokeWidth={1.8} />
          <span>{initials || "P"}</span>
        </div>
      )}
    </div>
  );
}
