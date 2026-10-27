"use client";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { useAuth } from "@/features/auth/AuthProvider";
import { ui } from "@/lib/ui";
import type { Totals } from "./types";
export const money = (cents: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    cents / 100,
  );
export function CommerceShell({
  title,
  subtitle,
  path,
  children,
}: {
  title: string;
  subtitle: string;
  path: string;
  children: ReactNode;
}) {
  const { user, loading } = useAuth();
  return (
    <section className={`${ui.container} py-12 sm:py-20`}>
      <p className={ui.eyebrow}>Made by you. Kept forever.</p>
      <h1 className={ui.heading}>{title}</h1>
      <p className="mt-4 mb-9 max-w-2xl text-muted">{subtitle}</p>
      {loading ? (
        <p role="status">Opening your account…</p>
      ) : !user ? (
        <div className={ui.card}>
          <p className="mb-5">Sign in to securely access your albums and orders.</p>
          <Link
            className={ui.button}
            href={`/login?redirect=${encodeURIComponent(path)}`}
          >
            Sign in to continue
          </Link>
        </div>
      ) : (
        <Fragment key={user.id}>{children}</Fragment>
      )}
    </section>
  );
}
export function OrderTotals({ totals }: { totals: Totals }) {
  return (
    <dl className="space-y-3 text-sm">
      <div className="flex justify-between gap-4">
        <dt>Subtotal</dt>
        <dd>{money(totals.subtotalCents)}</dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt>Delivery</dt>
        <dd>{totals.shippingCents ? money(totals.shippingCents) : "Free"}</dd>
      </div>
      {totals.discountCents > 0 && (
        <div className="flex justify-between gap-4 text-berry">
          <dt>Discount</dt>
          <dd>−{money(totals.discountCents)}</dd>
        </div>
      )}
      <div className="flex justify-between gap-4 border-t border-line pt-4 text-lg font-semibold">
        <dt>Total</dt>
        <dd>{money(totals.totalCents)}</dd>
      </div>
    </dl>
  );
}
