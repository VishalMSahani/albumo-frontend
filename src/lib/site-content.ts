export type ImageSlot = { src: string; alt: string };

// Add a /public image path here to replace a placeholder throughout the site.
export const imageSlots: Record<string, ImageSlot> = {
  "hero-landscape": { src: "", alt: "A favourite landscape from your travels" },
  "hero-detail": { src: "", alt: "A little moment from a memorable trip" },
  travel: { src: "", alt: "Travel photographs and a journal" },
  wedding: { src: "", alt: "A favourite wedding memory" },
  everyday: { src: "", alt: "Everyday moments with the people you love" },
  studio: { src: "", alt: "The people and process behind Albumo" },
  craft: { src: "", alt: "A close-up of a printed album and its binding" },
};

export type { Product } from "./catalogue-model";

export const formatPrice = (price: number) => `₹${price.toLocaleString("en-IN")}`;
