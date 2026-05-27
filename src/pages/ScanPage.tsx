import { Barcode, Camera, Search } from "lucide-react";
import { FormEvent, useState } from "react";
import type { ProductSearchItem } from "../api/types";
import { useApi } from "../api/useApi";
import { ProductRow } from "../components/ProductRow";
import { SectionHeader } from "../components/SectionHeader";
import { StatusView } from "../components/StatusView";

export function ScanPage() {
  const api = useApi();
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<ProductSearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  function submit(event: FormEvent) {
    event.preventDefault();
    const q = query.trim();
    if (!q) return;

    setSearched(true);
    setLoading(true);
    setError(null);
    api
      .searchProducts({ q, page: 0, size: 8 })
      .then(setProducts)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }

  return (
    <div className="page-stack">
      <header className="page-title-row">
        <div>
          <p className="eyebrow">Scan</p>
          <h1>Скан продукта</h1>
        </div>
        <div className="brand-mark">
          <Barcode size={30} />
        </div>
      </header>

      <section className="scan-frame">
        <Camera size={34} />
        <div className="scan-line" />
      </section>

      <form className="search-panel" onSubmit={submit}>
        <Barcode size={22} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Название или фрагмент этикетки"
          aria-label="Поиск после скана"
        />
        <button className="btn btn-dark" type="submit">
          <Search size={18} />
          Найти
        </button>
      </form>

      <section>
        <SectionHeader title="Результат" meta={products.length || undefined} />
        {loading && <StatusView state="loading" title="Ищем совпадения" />}
        {error && (
          <StatusView
            state="error"
            title="Product service недоступен"
            text={error}
          />
        )}
        {!loading && !error && searched && products.length === 0 && (
          <StatusView state="empty" title="Совпадений нет" />
        )}
        {!loading && !error && products.length > 0 && (
          <div className="product-list">
            {products.map((product) => (
              <ProductRow key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
