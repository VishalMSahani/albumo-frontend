// Test-only catalogue. No sample products are written to the real database.
import { readFileSync } from "node:fs";
const manifest = JSON.parse(
  readFileSync(new URL("../src/generated/cdn-assets.json", import.meta.url), "utf8"),
);
const photo = "https://cdn.albumo.in/" + manifest.files["/hero1.png"].key;
const configuration = {
  format: "album",
  personalizationEnabled: true,
  allowPhotoUpload: true,
  allowText: true,
  instructions: "Send original photos after your enquiry.",
  productionDays: 5,
  groups: [
    {
      id: "size-layflat",
      kind: "dimension",
      label: "Size",
      required: true,
      defaultOptionId: "small",
      options: [
        {
          id: "small",
          label: "5 x 7",
          width: 5,
          height: 7,
          unit: "in",
          description: "Portrait format",
          priceAdjustmentCents: 0,
        },
        {
          id: "square",
          label: "8 x 8",
          width: 8,
          height: 8,
          unit: "in",
          description: "Square format",
          priceAdjustmentCents: 30000,
        },
      ],
    },
    {
      id: "cover",
      kind: "cover",
      label: "Cover quality",
      required: true,
      defaultOptionId: "hard",
      options: [
        {
          id: "hard",
          label: "Hardcover",
          description: "Printed hardcover",
          priceAdjustmentCents: 0,
        },
        {
          id: "linen",
          label: "Linen cover",
          description: "Textured linen",
          priceAdjustmentCents: 20000,
        },
      ],
    },
    {
      id: "design",
      kind: "design",
      label: "Design",
      required: false,
      defaultOptionId: "",
      options: [
        {
          id: "minimal",
          label: "Minimal",
          description: "Clean layouts",
          imageUrl: photo,
          priceAdjustmentCents: 0,
        },
      ],
    },
  ],
};
const make = (
  id,
  name,
  price,
  categoryId,
  categoryName,
  superCategoryId = "albums",
  superCategoryName = "Photo Albums",
) => ({
  id,
  slug: id,
  name,
  description: "A keepsake for your favourite memories.",
  imageUrl: photo,
  media: [],
  categoryId,
  categoryName,
  superCategoryId,
  superCategoryName,
  unitPriceCents: price * 100,
  discountedPriceCents: null,
  isBestSeller: id === "layflat",
  specifications: [{ label: "Binding", value: "Layflat" }],
  countryOfOrigin: "India",
  warranty: null,
  typicalUseCase: "Your favourite stories",
  configuration:
    id === "layflat"
      ? configuration
      : {
          ...configuration,
          groups: [],
          format: superCategoryId === "gifts" ? "gift" : "book",
        },
});
export const catalogueFixture = {
  categories: [
    {
      id: "albums",
      name: "Photo Albums",
      description: "",
      imageUrl: null,
      subcategories: [
        { id: "travel", name: "Travel Books", description: "", imageUrl: null },
        { id: "wedding", name: "Wedding Albums", description: "", imageUrl: null },
      ],
    },
    {
      id: "gifts",
      name: "Gifts",
      description: "",
      imageUrl: null,
      subcategories: [
        { id: "keepsakes", name: "Small Keepsakes", description: "", imageUrl: null },
      ],
    },
  ],
  products: [
    make("layflat", "Layflat Photo Album", 1499, "wedding", "Wedding Albums"),
    make("softcover", "Softcover Photo Book", 799, "travel", "Travel Books"),
    make("mini", "Mini Photo Book", 499, "travel", "Travel Books"),
    make("layflat-xl", "XL Layflat Album", 2499, "wedding", "Wedding Albums"),
    make(
      "keychain",
      "Photo Keychain",
      199,
      "keepsakes",
      "Small Keepsakes",
      "gifts",
      "Gifts",
    ),
  ],
};
