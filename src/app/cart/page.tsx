import type { Metadata } from "next";
import CartPage from "@/features/checkout/CartPage";
export const metadata: Metadata = {
  title: "Your cart",
  robots: { index: false, follow: false },
};
export default CartPage;
