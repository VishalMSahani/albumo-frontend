/** JSON contracts for the existing owner-scoped account endpoints. */
export type AddressInput = {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  isDefault?: boolean;
};

export type Address = Omit<AddressInput, "line2" | "country" | "isDefault"> & {
  id: string;
  userId: string;
  line2: string | null;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "PROCESSING"
  | "PACKED"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "RETURN_REQUESTED"
  | "RETURNED"
  | "REFUND_INITIATED"
  | "REFUNDED"
  | "CANCELLED";

export type AccountOrderItem = {
  id: string;
  description: string;
  quantity: number;
  unitPriceCents: number;
  subtotalCents: number;
};

export type AccountPayment = {
  id: string;
  gateway: "PHONEPE" | "STRIPE" | "RAZORPAY" | "ZOHO" | "TEST";
  status: "CREATED" | "SUCCESS" | "FAILED" | "REFUNDED";
  amountCents: number;
  createdAt: string;
  updatedAt: string;
};

/** Both /api/orders/my and /api/orders/:id include these relations. */
export type AccountOrder = {
  id: string;
  status: OrderStatus;
  totalAmountCents: number;
  createdAt: string;
  updatedAt: string;
  address: Address;
  items: AccountOrderItem[];
  payments: AccountPayment[];
  trackingAwb: string | null;
  trackingUrl: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  notes: string | null;
};

export type AlbumOccasion = "EVERYDAY" | "FAMILY" | "TRAVEL" | "CELEBRATION" | "OTHER";

export type AlbumConfiguration = {
  schemaVersion: number;
  productId: string;
  productName: string;
  format: string;
  pageCount: number;
  minimumPhotos: number;
  recommendedPhotos: number;
  quantity: number;
  personalText: string;
  options: {
    groupId: string;
    kind: string;
    label: string;
    choiceId: string;
    value: string;
    width?: number;
    height?: number;
    unit?: string;
  }[];
};

/** StudioProject is a private album draft, not the inherited Project catalogue. */
export type AlbumProject = {
  id: string;
  title: string;
  occasion: AlbumOccasion;
  revision: number;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  productId: string | null;
  configuration: AlbumConfiguration | null;
  pageCount: number | null;
  minimumPhotos: number | null;
  recommendedPhotos: number | null;
};

export type AlbumProjectList = {
  items: AlbumProject[];
  nextCursor: string | null;
};
