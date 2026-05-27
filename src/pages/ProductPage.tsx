import {
  ArrowLeft,
  Check,
  ChevronDown,
  Heart,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Star,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { ProductDetail, ProductItem } from "../api/types";
import { useApi } from "../api/useApi";
import { FactorGauge } from "../components/FactorGauge";
import { ProductRow } from "../components/ProductRow";
import { ProductVisual } from "../components/ProductVisual";
import { RatingBadge } from "../components/RatingBadge";
import { SectionHeader } from "../components/SectionHeader";
import { StatusView } from "../components/StatusView";
import {
  compactAmount,
  productSummary,
  splitImpactFactors,
  splitNumericFactors,
} from "../utils/rating";

function MiniFactor({
  name,
  value,
  good,
}: {
  name: string;
  value: string;
  good: boolean;
}) {
  return (
    <div className="mini-factor">
      <span className={good ? "positive" : "negative"}>
        {good ? <Check size={18} /> : <ShieldAlert size={18} />}
      </span>
      <div>
        <h3>{name}</h3>
        <p>{good ? "Положительный вклад" : "Штраф к доверию"}</p>
      </div>
      <strong>{value}</strong>
      <ChevronDown size={20} />
    </div>
  );
}

export function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const api = useApi();
  const productId = Number(id);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [favorites, setFavorites] = useState<ProductItem[]>([]);
  const [feed, setFeed] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favoriteBusy, setFavoriteBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    Promise.all([
      api.getProduct(productId),
      api.getFavorites().catch(() => []),
      api.getFeed(8, 0).catch(() => []),
    ])
      .then(([nextProduct, nextFavorites, nextFeed]) => {
        if (!alive) return;
        setProduct(nextProduct);
        setFavorites(nextFavorites);
        setFeed(nextFeed);
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
  }, [api, productId]);

  const isFavorite = favorites.some((item) => item.id === productId);

  const factors = useMemo(() => {
    if (!product) return null;
    return {
      numeric: splitNumericFactors(product.numericFactors ?? []),
      boolean: splitImpactFactors(product.booleanFactors ?? []),
      enum: splitImpactFactors(product.enumFactors ?? []),
      summary: productSummary(product),
    };
  }, [product]);

  const recommendations = feed
    .filter((item) => item.id !== productId)
    .slice(0, 4);

  async function toggleFavorite() {
    if (!product || favoriteBusy) return;
    setFavoriteBusy(true);
    try {
      if (isFavorite) {
        await api.removeFavorite(product.id);
        setFavorites((current) =>
          current.filter((item) => item.id !== product.id),
        );
      } else {
        await api.addFavorite(product.id);
        setFavorites((current) => [product, ...current]);
      }
    } finally {
      setFavoriteBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="page-stack">
        <StatusView state="loading" title="Открываем карточку" />
      </div>
    );
  }

  if (error || !product || !factors) {
    return (
      <div className="page-stack">
        <button className="text-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} /> Назад
        </button>
        <StatusView
          state="error"
          title="Карточка недоступна"
          text={error ?? "Продукт не найден"}
        />
      </div>
    );
  }

  return (
    <div className="page-stack product-page">
      <header className="top-bar">
        <button className="text-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} /> Назад
        </button>
        <button
          className="icon-button"
          onClick={() => navigator.share?.({ title: product.name })}
          aria-label="Поделиться"
        >
          <Share2 size={20} />
        </button>
      </header>

      <section className="product-hero">
        <ProductVisual product={product} size="lg" />
        <div>
          <p className="eyebrow">{product.category?.name ?? "WATER"}</p>
          <h1>{product.name}</h1>
          <p>{product.brand?.name ?? "Бренд не указан"}</p>
          <RatingBadge rating={product.rating} />
        </div>
      </section>

      <section className="score-explain">
        <div>
          <ShieldCheck size={24} />
          <span>Факторов</span>
          <strong>{factors.summary.totalFactors}</strong>
        </div>
        <div>
          <Star size={24} />
          <span>Плюсов</span>
          <strong>{factors.summary.positivesCount}</strong>
        </div>
        <div>
          <ShieldAlert size={24} />
          <span>Рисков</span>
          <strong>{factors.summary.concernsCount}</strong>
        </div>
      </section>

      <section>
        <SectionHeader
          title="Риски"
          meta={`по нормам ${product.category?.code ?? "WATER"}`}
        />
        {factors.numeric.concerns.length === 0 &&
          factors.boolean.concerns.length === 0 &&
          factors.enum.concerns.length === 0 && (
            <StatusView state="empty" title="Критичных отклонений нет" />
          )}
        <div className="factor-list">
          {factors.numeric.concerns.slice(0, 6).map((factor) => (
            <FactorGauge key={factor.id} factor={factor} />
          ))}
          {factors.boolean.concerns.map((factor) => (
            <MiniFactor
              key={factor.id}
              name={factor.factorName}
              value={factor.value ? "да" : "нет"}
              good={false}
            />
          ))}
          {factors.enum.concerns.map((factor) => (
            <MiniFactor
              key={factor.id}
              name={factor.factorName}
              value={factor.enumValue}
              good={false}
            />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader
          title="Сильные стороны"
          meta={`per serving ${product.category?.code ?? "WATER"}`}
        />
        <div className="factor-list">
          {factors.numeric.positives.slice(0, 5).map((factor) => (
            <MiniFactor
              key={factor.id}
              name={factor.factorName}
              value={`${compactAmount(factor.amount)} ${factor.unitName ?? ""}`}
              good
            />
          ))}
          {factors.boolean.positives.map((factor) => (
            <MiniFactor
              key={factor.id}
              name={factor.factorName}
              value={factor.value ? "да" : "нет"}
              good
            />
          ))}
          {factors.enum.positives.slice(0, 3).map((factor) => (
            <MiniFactor
              key={factor.id}
              name={factor.factorName}
              value={factor.enumValue}
              good
            />
          ))}
        </div>
      </section>

      <section>
        <SectionHeader
          title="Рекомендации"
          meta={<Link to="/feed">Смотреть все</Link>}
        />
        {recommendations.length === 0 ? (
          <StatusView state="empty" title="Лента еще не рассчитана" />
        ) : (
          <div className="product-list horizontal-products">
            {recommendations.map((item) => (
              <ProductRow key={item.id} product={item} />
            ))}
          </div>
        )}
      </section>

      <section className="options-list">
        <button onClick={toggleFavorite} disabled={favoriteBusy}>
          <span>{isFavorite ? "Убрать из избранного" : "Добавить в избранное"}</span>
          <Heart
            size={24}
            fill={isFavorite ? "currentColor" : "none"}
            strokeWidth={2}
          />
        </button>
      </section>
    </div>
  );
}
