import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type {
  Brand,
  Category,
  ProductFilters,
  ProductSearchItem,
} from "../api/types";
import { useApi } from "../api/useApi";
import { ProductRow } from "../components/ProductRow";
import { SectionHeader } from "../components/SectionHeader";
import { StatusView } from "../components/StatusView";

const ratingSegments = [
  { label: "Все", minRating: undefined, maxRating: undefined },
  { label: "80+", minRating: 80, maxRating: undefined },
  { label: "60-79", minRating: 60, maxRating: 79 },
  { label: "<60", minRating: undefined, maxRating: 59 },
];

export function ExplorePage() {
  const api = useApi();
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [brandIds, setBrandIds] = useState<number[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [products, setProducts] = useState<ProductSearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    Promise.all([api.getCategories(), api.getBrands()])
      .then(([nextCategories, nextBrands]) => {
        if (!alive) return;
        setCategories(nextCategories);
        setBrands(nextBrands);
        setCategoryId(nextCategories[0]?.id);
      })
      .catch(() => undefined);

    return () => {
      alive = false;
    };
  }, [api]);

  useEffect(() => {
    let alive = true;
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      return;
    }

    const id = window.setTimeout(() => {
      api
        .getSuggestions(trimmed, 5)
        .then((next) => {
          if (alive) setSuggestions(next);
        })
        .catch(() => {
          if (alive) setSuggestions([]);
        });
    }, 250);

    return () => {
      alive = false;
      window.clearTimeout(id);
    };
  }, [api, query]);

  const filters = useMemo<ProductFilters>(() => {
    const segment = ratingSegments[segmentIndex];
    return {
      q: submittedQuery,
      categoryId,
      brandIds,
      minRating: segment.minRating,
      maxRating: segment.maxRating,
      page: 0,
      size: 24,
    };
  }, [brandIds, categoryId, segmentIndex, submittedQuery]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    api
      .searchProducts(filters)
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
  }, [api, filters]);

  function submit(event: FormEvent) {
    event.preventDefault();
    setSubmittedQuery(query.trim());
    setSuggestions([]);
  }

  function toggleBrand(id: number) {
    setBrandIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  return (
    <div className="page-stack explore-page">
      <header className="hero-band">
        <div>
          <p className="eyebrow">Persea Water</p>
          <h1>Найти воду, которой можно доверять</h1>
        </div>
        <div className="hero-score">
          <strong>70/30</strong>
          <span>безопасность / полноценность</span>
        </div>
      </header>

      <form className="search-panel" onSubmit={submit}>
        <Search size={22} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Акваника, Архыз, BonAqua"
          aria-label="Поиск продукта"
        />
        {query && (
          <button
            type="button"
            className="icon-button"
            onClick={() => {
              setQuery("");
              setSubmittedQuery("");
            }}
            aria-label="Очистить поиск"
          >
            <X size={18} />
          </button>
        )}
        <button className="btn btn-dark" type="submit">
          <Search size={18} />
          Найти
        </button>
      </form>

      {suggestions.length > 0 && (
        <div className="suggestions-row">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => {
                setQuery(suggestion);
                setSubmittedQuery(suggestion);
                setSuggestions([]);
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <section className="filter-strip">
        <div className="segmented-control" aria-label="Фильтр рейтинга">
          {ratingSegments.map((segment, index) => (
            <button
              key={segment.label}
              className={segmentIndex === index ? "active" : ""}
              onClick={() => setSegmentIndex(index)}
              type="button"
            >
              {segment.label}
            </button>
          ))}
        </div>

        <label className="select-filter">
          <Filter size={18} />
          <select
            value={categoryId ?? ""}
            onChange={(event) =>
              setCategoryId(
                event.target.value ? Number(event.target.value) : undefined,
              )
            }
            aria-label="Категория"
          >
            <option value="">Все категории</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="brand-strip" aria-label="Бренды">
        <span>
          <SlidersHorizontal size={18} />
        </span>
        {brands.map((brand) => (
          <button
            key={brand.id}
            className={brandIds.includes(brand.id) ? "active" : ""}
            onClick={() => toggleBrand(brand.id)}
            type="button"
          >
            {brand.name}
          </button>
        ))}
      </section>

      <section>
        <SectionHeader
          title="Каталог"
          meta={products.length ? `${products.length} найдено` : undefined}
        />

        {loading && <StatusView state="loading" title="Ищем продукты" />}
        {error && (
          <StatusView
            state="error"
            title="Сервис каталога недоступен"
            text={error}
          />
        )}
        {!loading && !error && products.length === 0 && (
          <StatusView state="empty" title="Ничего не найдено" />
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
