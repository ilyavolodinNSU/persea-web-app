import { Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ProductSearchItem } from "../api/types";
import { useApi } from "../api/useApi";
import { ProductRow } from "../components/ProductRow";
import { SectionHeader } from "../components/SectionHeader";
import { StatusView } from "../components/StatusView";

export function TopsPage() {
  const api = useApi();
  const [products, setProducts] = useState<ProductSearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    api
      .searchProducts({ minRating: 70, page: 0, size: 40 })
      .then((next) => {
        if (alive) setProducts(next);
      })
      .catch((err: Error) => {
        if (alive) setError(err.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [api]);

  const sorted = useMemo(
    () =>
      [...products].sort((left, right) => (right.rating ?? 0) - (left.rating ?? 0)),
    [products],
  );

  return (
    <div className="page-stack">
      <header className="page-title-row">
        <div>
          <p className="eyebrow">Tops</p>
          <h1>Лучшие оценки</h1>
        </div>
        <div className="brand-mark">
          <Trophy size={30} />
        </div>
      </header>

      <section className="podium-band">
        {sorted.slice(0, 3).map((product, index) => (
          <article key={product.id}>
            <span>{index + 1}</span>
            <strong>{product.rating ?? "?"}</strong>
            <p>{product.name}</p>
          </article>
        ))}
      </section>

      <section>
        <SectionHeader title="Рейтинг" meta={sorted.length || undefined} />
        {loading && <StatusView state="loading" title="Собираем топ" />}
        {error && (
          <StatusView
            state="error"
            title="Product service недоступен"
            text={error}
          />
        )}
        {!loading && !error && sorted.length === 0 && (
          <StatusView state="empty" title="Пока нет продуктов с оценкой" />
        )}
        {!loading && !error && sorted.length > 0 && (
          <div className="product-list">
            {sorted.map((product) => (
              <ProductRow key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
