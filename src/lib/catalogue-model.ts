import { emptyConfiguration, type ProductConfiguration } from "./catalogue-types";

export type CatalogueCategory = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  subcategories: {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
  }[];
};
export type ApiProduct = {
  id: string;
  slug: string | null;
  name: string;
  description: string | null;
  imageUrl: string | null;
  media: { id: string; url: string }[];
  categoryId: string;
  categoryName: string;
  superCategoryId: string;
  superCategoryName: string;
  unitPriceCents: number;
  discountedPriceCents: number | null;
  isBestSeller: boolean;
  specifications: { label: string; value: string }[];
  countryOfOrigin: string | null;
  warranty: string | null;
  typicalUseCase: string | null;
  configuration: ProductConfiguration;
};
export type Product = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  categoryName: string;
  superCategoryId: string;
  superCategoryName: string;
  basePriceCents: number;
  price: number;
  compareAtPriceCents: number | null;
  sizes: string[];
  tone: "rose" | "sand" | "sage" | "clay";
  cover: string;
  format: ProductConfiguration["format"];
  configuration: ProductConfiguration;
  imageUrl: string | null;
  images: string[];
  isFeatured: boolean;
  specifications: { label: string; value: string }[];
  countryOfOrigin: string | null;
  warranty: string | null;
  bestFor: string | null;
};
export function minimumOptionPrice(configuration: ProductConfiguration) {
  return configuration.groups.reduce(
    (sum, group) =>
      sum +
      (group.required
        ? Math.min(...group.options.map((option) => option.priceAdjustmentCents))
        : 0),
    0,
  );
}
export function mapProduct(item: ApiProduct): Product {
  const configuration = item.configuration || emptyConfiguration;
  const basePriceCents = item.discountedPriceCents ?? item.unitPriceCents;
  return {
    id: item.id,
    slug: item.slug || item.id,
    title: item.name,
    description: (item.description || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
    category: item.categoryId,
    categoryName: item.categoryName,
    superCategoryId: item.superCategoryId,
    superCategoryName: item.superCategoryName,
    basePriceCents,
    price: (basePriceCents + minimumOptionPrice(configuration)) / 100,
    compareAtPriceCents: item.discountedPriceCents !== null ? item.unitPriceCents : null,
    sizes: configuration.groups
      .filter((group) => group.kind === "dimension")
      .flatMap((group) => group.options.map((option) => option.label)),
    tone:
      configuration.format === "print"
        ? "sand"
        : configuration.format === "gift"
          ? "sage"
          : "rose",
    cover: item.name,
    format: configuration.format,
    configuration,
    imageUrl: item.imageUrl,
    images: [
      ...new Set(
        [item.imageUrl, ...item.media.map((media) => media.url)].filter(
          (url): url is string => !!url,
        ),
      ),
    ],
    isFeatured: item.isBestSeller,
    specifications: item.specifications,
    countryOfOrigin: item.countryOfOrigin,
    warranty: item.warranty,
    bestFor: item.typicalUseCase,
  };
}
export function initialSelections(product: Product) {
  return Object.fromEntries(
    product.configuration.groups.map((group) => [group.id, group.defaultOptionId || ""]),
  );
}
export function selectedPrice(product: Product, selections: Record<string, string>) {
  return (
    product.basePriceCents +
    product.configuration.groups.reduce(
      (sum, group) =>
        sum +
        (group.options.find((option) => option.id === selections[group.id])
          ?.priceAdjustmentCents || 0),
      0,
    )
  );
}
export function buildCatalogueEnquiry(
  product: Product,
  selections: Record<string, string>,
  quantity: number,
  personalText: string,
) {
  const choices = product.configuration.groups.flatMap((group) => {
    const option = group.options.find((item) => item.id === selections[group.id]);
    return option
      ? [
          group.label +
            ": " +
            option.label +
            (option.width && option.height
              ? " (" + option.width + " x " + option.height + " " + option.unit + ")"
              : ""),
        ]
      : [];
  });
  const message = [
    "Hello Albumo,",
    "",
    "I'd like to enquire about " + product.title + ".",
    "Product reference: " + product.id,
    ...choices,
    "Quantity: " + quantity,
    ...(product.configuration.allowText && personalText.trim()
      ? ["Personal text: " + personalText.trim()]
      : []),
    "Indicative total: INR " +
      ((selectedPrice(product, selections) * quantity) / 100).toFixed(2),
    "",
    "Please confirm availability, the final price and delivery timing.",
  ].join("\n");
  return (
    "/contact?" + new URLSearchParams({ subject: "Enquiry: " + product.title, message })
  );
}
