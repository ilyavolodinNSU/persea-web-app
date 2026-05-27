import { FlaskConical, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Brand, Category, Factor, Unit } from "../api/types";
import { useApi } from "../api/useApi";
import { SectionHeader } from "../components/SectionHeader";
import { StatusView } from "../components/StatusView";

export function LabPage() {
  const api = useApi();
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [factors, setFactors] = useState<Factor[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    Promise.all([
      api.getCategories(),
      api.getBrands(),
      api.getFactors(),
      api.getUnits(),
    ])
      .then(([nextCategories, nextBrands, nextFactors, nextUnits]) => {
        if (!alive) return;
        setCategories(nextCategories);
        setBrands(nextBrands);
        setFactors(nextFactors);
        setUnits(nextUnits);
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

  const filteredFactors = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return factors;
    return factors.filter((factor) =>
      `${factor.name} ${factor.description ?? ""} ${factor.type.name}`
        .toLowerCase()
        .includes(needle),
    );
  }, [factors, query]);

  return (
    <div className="page-stack">
      <header className="page-title-row">
        <div>
          <p className="eyebrow">Quality Model</p>
          <h1>Лабораторная база</h1>
        </div>
        <div className="brand-mark">
          <FlaskConical size={30} />
        </div>
      </header>

      <section className="metrics-grid">
        <div>
          <span>Категории</span>
          <strong>{categories.length}</strong>
        </div>
        <div>
          <span>Бренды</span>
          <strong>{brands.length}</strong>
        </div>
        <div>
          <span>Факторы</span>
          <strong>{factors.length}</strong>
        </div>
        <div>
          <span>Ед. изм.</span>
          <strong>{units.length}</strong>
        </div>
      </section>

      <label className="search-panel compact-search">
        <Search size={20} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Хлориды, pH, микробиология"
          aria-label="Поиск фактора"
        />
      </label>

      <section>
        <SectionHeader title="Факторы" meta={filteredFactors.length} />
        {loading && <StatusView state="loading" title="Загружаем модель" />}
        {error && (
          <StatusView
            state="error"
            title="Product service недоступен"
            text={error}
          />
        )}
        {!loading && !error && filteredFactors.length === 0 && (
          <StatusView state="empty" title="Факторы не найдены" />
        )}
        {!loading && !error && filteredFactors.length > 0 && (
          <div className="factor-table">
            {filteredFactors.map((factor) => (
              <article key={factor.id}>
                <span>{factor.type.name}</span>
                <div>
                  <h3>{factor.name}</h3>
                  <p>{factor.description || "Описание не задано"}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
