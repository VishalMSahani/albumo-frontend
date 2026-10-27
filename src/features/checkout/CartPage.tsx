/* eslint-disable @next/next/no-img-element -- Private signed album covers. */
"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/base/buttons/button";
import { api, errorMessage } from "@/lib/api-client";
import { ui } from "@/lib/ui";
import { CommerceShell, money, OrderTotals } from "./CommerceShell";
import { SavedDesignPreview } from "./SavedDesignPreview";
import { StudioReviewLink } from "./StudioReviewLink";
import type { CartLine, CartQuote } from "./types";
export default function CartPage() {
  return (
    <CommerceShell
      title="Your stories, ready to keep."
      subtitle="Your saved album designs travel with your order, just as you reviewed them."
      path="/cart"
    >
      <Cart />
    </CommerceShell>
  );
}
function Cart() {
  const [cart, setCart] = useState<CartQuote | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function load() {
    setCart(await api.get<CartQuote>("/api/checkout/cart"));
  }
  useEffect(() => {
    const controller = new AbortController();
    api
      .get<CartQuote>("/api/checkout/cart", { signal: controller.signal })
      .then(setCart)
      .catch((e) => {
        if (!controller.signal.aborted) setError(errorMessage(e));
      });
    return () => controller.abort();
  }, []);
  async function change(line: CartLine, quantity: number | null) {
    setBusy(true);
    setError("");
    try {
      if (line.kind === "album")
        await api.patch(`/api/checkout/albums/${line.id}`, {
          version: line.version,
          quantity,
        });
      else
        await api.request(
          `/api/cart/items${quantity === null ? `/${encodeURIComponent(line.productId)}` : ""}`,
          {
            method: quantity === null ? "DELETE" : "PUT",
            ...(quantity === null
              ? {}
              : { body: { componentId: line.productId, quantity } }),
          },
        );
      await load();
    } catch (e) {
      setError(errorMessage(e));
      await load().catch(() => {});
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      {error && (
        <div role="alert" className={`${ui.card} mb-5`}>
          <p>{error}</p>
          <Button
            color="secondary"
            onPress={() =>
              load()
                .then(() => setError(""))
                .catch((e) => setError(errorMessage(e)))
            }
          >
            Refresh cart
          </Button>
        </div>
      )}
      {!cart ? (
        <p role="status">Loading your cart…</p>
      ) : !cart.lines.length ? (
        <div className={ui.card}>
          <h2 className="text-2xl">A story is waiting to begin.</h2>
          <p className="my-4 text-muted">
            Create an album in Studio, preview it, then add it here.
          </p>
          <Link href="/products" className={ui.button}>
            Find your album
          </Link>
          <Link href="/account" className={`${ui.textLink} ml-4`}>
            Your saved albums
          </Link>
        </div>
      ) : (
        <div className="grid items-start gap-7 lg:grid-cols-[1fr_340px]">
          <div className="min-w-0 space-y-5">
            {cart.lines.map((line) => (
              <article key={line.id} className={ui.card}>
                <div className="flex flex-wrap gap-5">
                  {line.imageUrl && (
                    <img
                      src={line.imageUrl}
                      alt={line.albumTitle || line.name}
                      referrerPolicy="no-referrer"
                      className="h-28 w-24 rounded-xl object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs tracking-wider text-berry uppercase">
                      {line.kind === "album"
                        ? `Your album · Version ${line.revision}`
                        : "Your keepsake"}
                    </p>
                    <h2 className="mt-1 text-xl font-medium break-words">
                      {line.albumTitle || line.name}
                    </h2>
                    <p className="text-sm text-muted">{line.name}</p>
                    <p className="mt-2 text-sm">
                      {line.options.map((o) => `${o.label}: ${o.value}`).join(" · ")}
                    </p>
                    <p className="mt-2 font-medium">
                      {money(line.unitPriceCents)} / copy
                    </p>
                  </div>
                </div>
                <div className="my-5 flex flex-wrap items-center justify-between gap-4">
                  <label className="text-sm">
                    Copies{" "}
                    <select
                      aria-label={`Copies of ${line.albumTitle || line.name}`}
                      value={line.quantity}
                      disabled={busy}
                      onChange={(e) => change(line, Number(e.target.value))}
                      className="ml-2 rounded-lg border border-line bg-white p-2"
                    >
                      {Array.from({ length: 100 }, (_, i) => (
                        <option key={i + 1}>{i + 1}</option>
                      ))}
                    </select>
                  </label>
                  <strong>{money(line.totalCents)}</strong>
                  <Button
                    color="tertiary"
                    isDisabled={busy}
                    onPress={() => change(line, null)}
                  >
                    Remove
                  </Button>
                </div>
                {line.issues.map((issue) => (
                  <p key={issue} role="alert" className="mb-3 text-sm text-berry">
                    {issue}
                  </p>
                ))}
                {line.kind === "album" && (
                  <div className="space-y-3">
                    <SavedDesignPreview
                      endpoint={`/api/checkout/albums/${line.id}/design`}
                    />
                    <StudioReviewLink projectId={line.projectId} />
                  </div>
                )}
              </article>
            ))}
          </div>
          <aside className={`${ui.card} space-y-6 lg:sticky lg:top-28`}>
            <h2 className="text-xl font-medium">Your little collection</h2>
            <OrderTotals totals={cart} />
            <p className="text-xs text-muted">
              Prices and availability are checked again before placing your order.
            </p>
            {cart.lines.some((l) => l.issues.length) ? (
              <p role="status" className="text-sm text-berry">
                Resolve the items above before checkout.
              </p>
            ) : busy ? (
              <Button className="w-full" isDisabled>
                Updating cart...
              </Button>
            ) : (
              <Link href="/checkout" className={`${ui.button} w-full`}>
                Continue to checkout
              </Link>
            )}
            <Link href="/account" className={ui.textLink}>
              Return to your albums
            </Link>
          </aside>
        </div>
      )}
    </>
  );
}
