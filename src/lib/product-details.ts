import type { Product } from "./catalogue-model";
export function getProductDetails(product: Product) {
  return {
    introduction: product.description,
    bestFor: product.bestFor || product.categoryName,
    material:
      product.specifications.find((row) => /material|paper|cover/i.test(row.label))
        ?.value || "See available product options",
    feature: product.configuration.personalizationEnabled
      ? "Personalisation available"
      : "Available as shown",
  };
}
