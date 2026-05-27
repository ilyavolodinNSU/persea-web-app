import { LayoutDashboard, RefreshCcw, Save } from "lucide-react";
import { FormEvent, useState } from "react";
import { useApi } from "../api/useApi";
import { useAuth } from "../auth/AuthProvider";
import { SectionHeader } from "../components/SectionHeader";

export function StudioPage() {
  const api = useApi();
  const { hasAnyRole } = useAuth();
  const [brandName, setBrandName] = useState("");
  const [brandDescription, setBrandDescription] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [categoryCode, setCategoryCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!hasAnyRole("moderator", "admin")) {
    return (
      <div className="page-stack">
        <SectionHeader title="Студия" />
        <section className="insight-band">
          <LayoutDashboard size={24} />
          <span>Нужна роль moderator или admin.</span>
        </section>
      </div>
    );
  }

  async function createBrand(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const brand = await api.createBrand({
        name: brandName.trim(),
        description: brandDescription.trim() || undefined,
      });
      setBrandName("");
      setBrandDescription("");
      setMessage(`Бренд создан: ${brand.name}`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Ошибка создания бренда");
    } finally {
      setBusy(false);
    }
  }

  async function createCategory(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const category = await api.createCategory({
        name: categoryName.trim(),
        code: categoryCode.trim().toUpperCase(),
      });
      setCategoryName("");
      setCategoryCode("");
      setMessage(`Категория создана: ${category.name}`);
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Ошибка создания категории",
      );
    } finally {
      setBusy(false);
    }
  }

  async function recalculate() {
    setBusy(true);
    setMessage(null);
    try {
      const result = await api.recalculateFeed();
      setMessage(result || "Пересчет запущен");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Ошибка пересчета");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page-stack">
      <header className="page-title-row">
        <div>
          <p className="eyebrow">Moderator</p>
          <h1>Студия данных</h1>
        </div>
        <div className="brand-mark">
          <LayoutDashboard size={30} />
        </div>
      </header>

      {message && <section className="toast-line">{message}</section>}

      <section className="studio-grid">
        <form className="studio-form" onSubmit={createBrand}>
          <SectionHeader title="Бренд" />
          <input
            className="form-control"
            value={brandName}
            onChange={(event) => setBrandName(event.target.value)}
            placeholder="Название"
            required
          />
          <textarea
            className="form-control"
            value={brandDescription}
            onChange={(event) => setBrandDescription(event.target.value)}
            placeholder="Описание"
            rows={4}
          />
          <button className="btn btn-dark" disabled={busy}>
            <Save size={18} />
            Сохранить
          </button>
        </form>

        <form className="studio-form" onSubmit={createCategory}>
          <SectionHeader title="Категория" />
          <input
            className="form-control"
            value={categoryName}
            onChange={(event) => setCategoryName(event.target.value)}
            placeholder="Название"
            required
          />
          <input
            className="form-control"
            value={categoryCode}
            onChange={(event) => setCategoryCode(event.target.value)}
            placeholder="Код"
            required
          />
          <button className="btn btn-dark" disabled={busy}>
            <Save size={18} />
            Сохранить
          </button>
        </form>
      </section>

      {hasAnyRole("admin") && (
        <section className="options-list">
          <button onClick={recalculate} disabled={busy}>
            <span>Пересчитать рекомендации</span>
            <RefreshCcw size={22} />
          </button>
        </section>
      )}
    </div>
  );
}
