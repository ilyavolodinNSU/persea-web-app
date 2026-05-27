import { RefreshCcw, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import type { ProductItem } from "../api/types";
import { useApi } from "../api/useApi";
import { ProductRow } from "../components/ProductRow";
import { SectionHeader } from "../components/SectionHeader";
import { StatusView } from "../components/StatusView";

export function FeedPage() {
  const api = useApi();
  const [items, setItems] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    api
      .getFeed(20, 0)
      .then(setItems)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [api]);

  return (
    <div className="page-stack">
      <header className="page-title-row">
        <div>
          <p className="eyebrow">Recommendations</p>
          <h1>Персональная лента</h1>
        </div>
        <button className="icon-button" onClick={load} aria-label="Обновить">
          <RefreshCcw size={20} />
        </button>
      </header>

      <section className="insight-band">
        <Sparkles size={26} />
        <div>
          <strong>Сигналы пользователя</strong>
          <span>Избранное весит сильнее просмотров, сканирование сильнее обычного открытия.</span>
        </div>
      </section>

      <section>
        <SectionHeader title="Подборка" meta={items.length || undefined} />
        {loading && <StatusView state="loading" title="Собираем ленту" />}
        {error && (
          <StatusView
            state="error"
            title="Recommendation service недоступен"
            text={error}
          />
        )}
        {!loading && !error && items.length === 0 && (
          <StatusView state="empty" title="Лента пока пустая" />
        )}
        {!loading && !error && items.length > 0 && (
          <div className="product-list">
            {items.map((item) => (
              <ProductRow key={item.id} product={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
