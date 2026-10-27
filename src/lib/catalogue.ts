import "server-only";
import { cache } from "react";
import {
  mapProduct,
  type ApiProduct,
  type CatalogueCategory,
  type Product,
} from "./catalogue-model";
import { cdnImageUrl } from "./cdn";

type Catalogue = {
  categories: CatalogueCategory[];
  products: Product[];
  available: boolean;
};
function safeImage(url: string | null) {
  if (!url) return null;
  try {
    return cdnImageUrl(url);
  } catch {
    return null;
  }
}
/** Request-scoped deduplication; a new request sees saved admin changes without a rebuild. */
export const getCatalogue = cache(async (): Promise<Catalogue> => {
  const origin = (
    process.env.ALBUMO_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV !== "production" ? "http://localhost:4000" : "")
  ).replace(/\/+$/, "");
  if (!origin) return { categories: [], products: [], available: false };
  try {
    const response = await fetch(origin + "/api/components/catalogue", {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error("Catalogue unavailable");
    const payload: { data: { categories: CatalogueCategory[]; products: ApiProduct[] } } =
      await response.json();
    return {
      available: true,
      categories: payload.data.categories,
      products: payload.data.products.map((item) => {
        const product = mapProduct(item);
        return {
          ...product,
          imageUrl: safeImage(product.imageUrl),
          images: product.images.map(safeImage).filter((url): url is string => !!url),
          configuration: {
            ...product.configuration,
            groups: product.configuration.groups.map((group) => ({
              ...group,
              options: group.options.map((option) => ({
                ...option,
                imageUrl: safeImage(option.imageUrl || null) || undefined,
              })),
            })),
          },
        };
      }),
    };
  } catch {
    return { categories: [], products: [], available: false };
  }
});

/** Header/footer navigation does not need product descriptions or option payloads. */
export const getCatalogueCategories = cache(async (): Promise<CatalogueCategory[]> => {
  const origin = (
    process.env.ALBUMO_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV !== "production" ? "http://localhost:4000" : "")
  ).replace(/\/+$/, "");
  if (!origin) return [];
  try {
    const response = await fetch(origin + "/api/components/catalogue/categories", {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return [];
    const payload: { data: CatalogueCategory[] } = await response.json();
    return payload.data;
  } catch {
    return [];
  }
});
