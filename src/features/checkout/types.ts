import type { PageAppearance } from "./page-appearance";
export type CartLine = {
  id: string;
  kind: "album" | "product";
  productId: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
  version: number;
  projectId: string | null;
  revision: number | null;
  albumTitle: string | null;
  options: { label: string; value: string }[];
  imageUrl: string | null;
  issues: string[];
};
export type Totals = {
  subtotalCents: number;
  shippingCents: number;
  discountCents: number;
  totalCents: number;
};
export type CartQuote = Totals & {
  lines: CartLine[];
  quoteHash: string;
  policyVersion: string;
  couponLabel: string | null;
};
export type ShippingAddress = {
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
};
export type CheckoutOrder = {
  id: string;
  status: string;
  totalAmountCents: number;
  address: ShippingAddress;
  trackingAwb: string | null;
  trackingUrl: string | null;
  checkoutAttempt: { summary: Totals } | null;
  payments: { status: string }[];
  items: {
    id: string;
    description: string;
    quantity: number;
    subtotalCents: number;
    album: {
      title: string;
      revision: number;
      options: { label: string; value: string }[];
    } | null;
  }[];
};
export type Placement = { assetId: string; x: number; y: number };
export type SavedDesign = {
  title: string;
  revision: number;
  configuration: { options: { kind: string; width?: number; height?: number; unit?: string }[] };
  document: {
    template: string;
    cover: { title: string; photo: Placement; appearance?: PageAppearance };
    pages: { id: string; caption: string; photos: Placement[]; appearance?: PageAppearance }[];
  };
  photos: { id: string; previewUrl: string | null }[];
};
