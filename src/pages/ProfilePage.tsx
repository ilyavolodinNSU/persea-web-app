import { CheckCircle2, Clock3, Heart, LogOut, ScanLine, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import type { ProductItem } from "../api/types";
import { useApi } from "../api/useApi";
import { useAuth } from "../auth/AuthProvider";
import { ProductRow } from "../components/ProductRow";
import { SectionHeader } from "../components/SectionHeader";
import { StatusView } from "../components/StatusView";

type ProfileTab = "favorites" | "viewed" | "scanned";

const tabs: Array<{ id: ProfileTab; label: string; icon: typeof Heart }> = [
  { id: "favorites", label: "Избранное", icon: Heart },
  { id: "viewed", label: "История", icon: Clock3 },
  { id: "scanned", label: "Сканы", icon: ScanLine },
];

export function ProfilePage() {
  const api = useApi();
  const { profile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>("favorites");
  const [items, setItems] = useState<Record<ProfileTab, ProductItem[]>>({
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

  const displayName =
    profile?.name || profile?.preferred_username || profile?.email || "Persea";
  const activeItems = items[activeTab];

  return (
    <div className="page-stack">
      <header className="profile-hero">
        <div className="avatar">
          <UserRound size={32} />
        </div>
        <div>
          <p className="eyebrow">OIDC profile</p>
          <h1>{displayName}</h1>
          <p>{profile?.email ?? profile?.sub}</p>
        </div>
        <button className="icon-button" onClick={logout} aria-label="Выйти">
          <LogOut size={20} />
        </button>
      </header>

      <section className="profile-facts">
        <div>
          <span>Роли</span>
          <strong>{profile?.roles.join(", ") || "app_user"}</strong>
        </div>
        <div>
          <span>Email</span>
          <strong>
            {profile?.email_verified ? (
              <>
                <CheckCircle2 size={18} /> verified
              </>
            ) : (
              "unknown"
            )}
          </strong>
        </div>
        <div>
          <span>Subject</span>
          <strong>{profile?.sub?.slice(0, 8) ?? "token"}</strong>
        </div>
      </section>

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
        <SectionHeader title={tabs.find((tab) => tab.id === activeTab)?.label ?? ""} />
        {loading && <StatusView state="loading" title="Загружаем профиль" />}
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
