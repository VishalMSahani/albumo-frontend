import type { Metadata } from "next";
import CheckoutPage from "@/features/checkout/CheckoutPage";
export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};
export default CheckoutPage;
