import type { Metadata } from "next";
import Link from "next/link";
import OrderPage from "@/features/checkout/OrderPage";
export const metadata: Metadata = {
  title: "Payment status",
  robots: { index: false, follow: false },
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string | string[] }>;
}) {
  const { orderId } = await searchParams;
  return typeof orderId === "string" && orderId.length <= 100 ? (
    <OrderPage id={orderId} />
  ) : (
    <div className="mx-auto max-w-xl px-6 py-20">
      <h1 className="text-3xl">Find your order</h1>
      <Link href="/account" className="mt-5 inline-block underline">
        View orders in your account
      </Link>
    </div>
  );
}
