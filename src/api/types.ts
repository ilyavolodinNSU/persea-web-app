export type Role = "app_user" | "moderator" | "admin" | string;

export interface NamedRef {
  id: number;
  name: string;
}

export interface Brand extends NamedRef {
  description?: string;
}

export interface Category extends NamedRef {
  code: string;
}

export interface FactorType extends NamedRef {}

export interface Factor {
  id: number;
  name: string;
  type: FactorType;
  description?: string;
}

export interface Unit extends NamedRef {}

export interface ProductSearchItem {
  id: number;
  name: string;
  rating: number | null;
  imageURI?: string;
}

export interface ProductItem extends ProductSearchItem {
  brand?: Brand | null;
  category?: Category | null;
}

export interface ProductNumericFactor {
  id: number;
  factorId: number;
  factorName: string;
  unitName?: string | null;
  amount: number;
  minValue: number;
  maxValue: number;
}

export interface ProductBooleanFactor {
  id: number;
  factorId: number;
  factorName: string;
  value: boolean;
  impact: number;
}

export interface ProductEnumFactor {
  id: number;
  factorId: number;
  factorName: string;
  enumValue: string;
  impact: number;
}

export interface ProductDetail extends ProductItem {
  numericFactors?: ProductNumericFactor[] | null;
  booleanFactors?: ProductBooleanFactor[] | null;
  enumFactors?: ProductEnumFactor[] | null;
}

export interface UserProfile {
  sub?: string;
  preferred_username?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  roles: Role[];
}

export interface ProductFilters {
  q?: string;
  categoryId?: number;
  brandIds?: number[];
  minRating?: number;
  maxRating?: number;
  page?: number;
  size?: number;
}
