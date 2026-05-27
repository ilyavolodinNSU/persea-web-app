import {
  FlaskConical,
  History,
  LayoutDashboard,
  LogOut,
  ScanLine,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserRound,
} from "lucide-react";
import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/AuthProvider";
import { ExplorePage } from "./pages/ExplorePage";
import { ProductPage } from "./pages/ProductPage";
import { FeedPage } from "./pages/FeedPage";
import { ProfilePage } from "./pages/ProfilePage";
import { LabPage } from "./pages/LabPage";
import { StudioPage } from "./pages/StudioPage";
import { HistoryPage } from "./pages/HistoryPage";
import { ScanPage } from "./pages/ScanPage";
import { TopsPage } from "./pages/TopsPage";

const navItems = [
  { to: "/history", label: "History", icon: History },
  { to: "/feed", label: "Recs", icon: Sparkles },
  { to: "/scan", label: "Scan", icon: ScanLine },
  { to: "/tops", label: "Tops", icon: Trophy },
  { to: "/", label: "Search", icon: Search },
];

function LoginScreen() {
  const { login } = useAuth();

  return (
    <main className="login-screen">
      <section className="login-panel">
        <div className="brand-mark">
          <ShieldCheck size={36} />
        </div>
        <p className="eyebrow">Persea</p>
        <h1>Честный разбор воды перед покупкой</h1>
        <p className="login-copy">
          Рейтинг собирается из лабораторных факторов, норм и личных сигналов:
          просмотров, избранного и рекомендаций.
        </p>
        <button className="btn btn-dark btn-lg" onClick={login}>
          Войти через Keycloak
        </button>
      </section>
    </main>
  );
}

function AppShell() {
  const { profile, logout, hasAnyRole } = useAuth();

  return (
    <div className="app-shell">
      <aside className="side-nav">
        <NavLink className="side-brand" to="/">
          <span className="brand-mark sm">
            <ShieldCheck size={22} />
          </span>
          <span>Persea</span>
        </NavLink>

        <nav>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === "/"}>
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
          {hasAnyRole("moderator", "admin") && (
            <NavLink to="/studio">
              <LayoutDashboard size={20} />
              <span>Студия</span>
            </NavLink>
          )}
          <NavLink to="/lab">
            <FlaskConical size={20} />
            <span>Факторы</span>
          </NavLink>
        </nav>

        <div className="side-profile">
          <NavLink className="side-profile-link" to="/profile">
            <UserRound size={18} />
            <div>
              <strong>{profile?.preferred_username ?? "persea"}</strong>
              <span>{profile?.email ?? "OIDC profile"}</span>
            </div>
          </NavLink>
          <button className="icon-button" onClick={logout} aria-label="Выйти">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <main className="main-surface">
        <Routes>
          <Route path="/" element={<ExplorePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/products/:id" element={<ProductPage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/tops" element={<TopsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/lab" element={<LabPage />} />
          <Route path="/studio" element={<StudioPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <nav className="bottom-nav">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === "/"}>
            <Icon size={22} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export function App() {
  const { initialized, authenticated } = useAuth();

  if (!initialized) {
    return (
      <main className="login-screen">
        <div className="status-view">
          <span className="loader" />
          <strong>Persea открывается</strong>
        </div>
      </main>
    );
  }

  if (!authenticated) return <LoginScreen />;

  return <AppShell />;
}
