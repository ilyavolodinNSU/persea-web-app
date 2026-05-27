import { Clock3, Heart, ScanLine, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { ProductItem } from "../api/types";
import { useApi } from "../api/useApi";
import { ProductRow } from "../components/ProductRow";
import { SectionHeader } from "../components/SectionHeader";
import { StatusView } from "../components/StatusView";

type HistoryTab = "favorites" | "viewed" | "scanned";

const tabs: Array<{ id: HistoryTab; label: string; icon: typeof Heart }> = [
  { id: "favorites", label: "Избранное", icon: Heart },
  { id: "viewed", label: "История", icon: Clock3 },
  { id: "scanned", label: "Сканы", icon: ScanLine },
];

export function HistoryPage() {
  const api = useApi();
  const [activeTab, setActiveTab] = useState<HistoryTab>("viewed");
  const [items, setItems] = useState<Record<HistoryTab, ProductItem[]>>({
    favorites: [],
    viewed: [],
    scanned: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    Promise.all([
      api.getFavorites(),
      api.getViewedProducts(),
      api.getScannedProducts(),
    ])
      .then(([favorites, viewed, scanned]) => {
        if (!alive) return;
        setItems({ favorites, viewed, scanned });
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

  const activeItems = items[activeTab];

  return (
    <div className="page-stack">
      <header className="page-title-row">
        <div>
          <p className="eyebrow">Favorites</p>
          <h1>History</h1>
        </div>
        <Link className="icon-button" to="/profile" aria-label="Профиль">
          <UserRound size={21} />
        </Link>
      </header>

      <section className="segmented-control profile-tabs">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={activeTab === id ? "active" : ""}
            onClick={() => setActiveTab(id)}
            type="button"
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </section>

      <section>
        <SectionHeader
          title={tabs.find((tab) => tab.id === activeTab)?.label ?? ""}
          meta={activeItems.length || undefined}
        />
        {loading && <StatusView state="loading" title="Загружаем историю" />}
        {error && (
          <StatusView
            state="error"
            title="User service недоступен"
            text={error}
          />
        )}
        {!loading && !error && activeItems.length === 0 && (
          <StatusView state="empty" title="Здесь пока пусто" />
        )}
        {!loading && !error && activeItems.length > 0 && (
          <div className="product-list">
            {activeItems.map((item) => (
              <ProductRow key={item.id} product={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
