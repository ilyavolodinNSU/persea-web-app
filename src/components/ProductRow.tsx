import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { ProductItem, ProductSearchItem } from "../api/types";
import { ProductVisual } from "./ProductVisual";
import { RatingBadge } from "./RatingBadge";

interface Props {
  product: ProductItem | ProductSearchItem;
  meta?: string;
}

export function ProductRow({ product, meta }: Props) {
  const brand = "brand" in product ? product.brand?.name : undefined;

  return (
    <Link className="product-row" to={`/products/${product.id}`}>
      <ProductVisual product={product} />
      <div className="product-row-body">
        <h3>{product.name}</h3>
        <p>{brand || meta || "Бутилированная вода"}</p>
        <RatingBadge rating={product.rating} compact />
      </div>
      <ChevronRight className="row-chevron" size={24} strokeWidth={2.2} />
    </Link>
  );
}
