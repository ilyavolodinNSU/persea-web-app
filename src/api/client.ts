import type {
  Brand,
  Category,
  Factor,
  ProductDetail,
  ProductFilters,
  ProductItem,
  ProductSearchItem,
  Unit,
} from "./types";

type TokenProvider = () => Promise<string>;

const productBase =
  import.meta.env.VITE_PRODUCT_API_BASE ?? "/api/product-service";
const userBase = import.meta.env.VITE_USER_API_BASE ?? "/api/user-service";
const recommendationBase =
  import.meta.env.VITE_RECOMMENDATION_API_BASE ??
  "/api/recommendation-service";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

function makeParams(params: Record<string, unknown>) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null) search.append(key, String(item));
      });
      return;
    }

    search.set(key, String(value));
  });

  const query = search.toString();
  return query ? `?${query}` : "";
}

async function request<T>(
  baseUrl: string,
  path: string,
  getToken: TokenProvider,
  init: RequestInit = {},
): Promise<T> {
  const token = await getToken();
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
  });

  if (response.status === 204) return undefined as T;

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new ApiError(response.status, message || response.statusText);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return (await response.text()) as T;
  }

  return response.json() as Promise<T>;
}

export function createApi(getToken: TokenProvider) {
  return {
    searchProducts(filters: ProductFilters) {
      return request<ProductSearchItem[]>(
        productBase,
        `/products${makeParams({
          q: filters.q,
          category_id: filters.categoryId,
          brand_ids: filters.brandIds,
          min_rating: filters.minRating,
          max_rating: filters.maxRating,
          page: filters.page ?? 0,
          size: filters.size ?? 24,
        })}`,
        getToken,
      );
    },

    getSuggestions(q: string, limit = 5) {
      return request<string[]>(
        productBase,
        `/products/suggestions${makeParams({ q, limit })}`,
        getToken,
      );
    },

    getProduct(id: number) {
      return request<ProductDetail>(
        productBase,
        `/products/${id}${makeParams({ include: "FACTORS" })}`,
        getToken,
      );
    },

    getCategories() {
      return request<Category[]>(productBase, "/products/categories", getToken);
    },

    getBrands() {
      return request<Brand[]>(productBase, "/products/brands", getToken);
    },

    getFactors() {
      return request<Factor[]>(productBase, "/factors", getToken);
    },

    getUnits() {
      return request<Unit[]>(productBase, "/factors/units", getToken);
    },

    getFeed(limit = 20, offset = 0) {
      return request<ProductItem[]>(
        recommendationBase,
        `/recommendation/feed/me${makeParams({ limit, offset })}`,
        getToken,
      );
    },

    recalculateFeed() {
      return request<string>(
        recommendationBase,
        "/recommendation/recalculate",
        getToken,
        { method: "POST" },
      );
    },

    getViewedProducts() {
      return request<ProductItem[]>(
        userBase,
        "/users/me/viewed-products",
        getToken,
      );
    },

    getScannedProducts() {
      return request<ProductItem[]>(
        userBase,
        "/users/me/scanned-products",
        getToken,
      );
    },

    getFavorites() {
      return request<ProductItem[]>(userBase, "/users/me/favorites", getToken);
    },

    addFavorite(productId: number) {
      return request<void>(
        userBase,
        `/users/me/favorites/${productId}`,
        getToken,
        { method: "POST" },
      );
    },

    removeFavorite(productId: number) {
      return request<void>(
        userBase,
        `/users/me/favorites/${productId}`,
        getToken,
        { method: "DELETE" },
      );
    },

    createBrand(payload: { name: string; description?: string }) {
      return request<Brand>(productBase, "/products/brands", getToken, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },

    createCategory(payload: { name: string; code: string }) {
      return request<Category>(
        productBase,
        "/products/categories",
        getToken,
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );
    },
  };
}
