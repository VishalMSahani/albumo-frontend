"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/base/buttons/button";
import { api, errorMessage } from "@/lib/api-client";
import { ui } from "@/lib/ui";
import { useAuth } from "@/features/auth/AuthProvider";
import { CommerceShell, money, OrderTotals } from "./CommerceShell";
import { SavedDesignPreview } from "./SavedDesignPreview";
import type { CheckoutOrder } from "./types";
export default function OrderPage({ id }: { id: string }) {
  return (
    <CommerceShell
      title="A story worth waiting for."
      subtitle="Your album is saved with this order. Follow payment and delivery here."
      path={`/orders/${encodeURIComponent(id)}`}
    >
      <Order id={id} />
    </CommerceShell>
  );
}
function Order({ id }: { id: string }) {
  const { user } = useAuth();
  const [order, setOrder] = useState<CheckoutOrder | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const endpoint = `/api/checkout/orders/${encodeURIComponent(id)}`;
  useEffect(() => {
    const controller = new AbortController();
    let polling = false;
    async function refresh() {
      if (polling || document.hidden) return;
      polling = true;
      try {
        const value = await api.get<CheckoutOrder>(endpoint, {
          signal: controller.signal,
        });
        setOrder(value);
        setError("");
        sessionStorage.removeItem(`albumo-checkout-attempt:${user!.id}`);
      } catch (e) {
        if (!controller.signal.aborted) setError(errorMessage(e));
      } finally {
        polling = false;
      }
    }
    void refresh();
    const timer = setInterval(refresh, 12000);
    window.addEventListener("focus", refresh);
    return () => {
      controller.abort();
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, [endpoint, user]);
  async function pay() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const result = await api.post<{ gateway: string; checkoutUrl: string }>(
        `/api/payments/${encodeURIComponent(id)}/initiate`,
      );
      const url = new URL(result.checkoutUrl);
      if (
        result.gateway !== "ZOHO" ||
        url.protocol !== "https:" ||
        !/^payments\.zoho\.(in|com|eu|com\.au|jp|ca)$/.test(url.hostname) ||
        url.username ||
        url.password
      )
        throw new Error(
          "The payment provider returned an unsupported checkout address. Please contact Albumo with your order number.",
        );
      window.location.assign(url.href);
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  }
  const pending = order?.status === "PENDING_PAYMENT";
  const status = order?.status.replaceAll("_", " ").toLowerCase();
  return (
    <>
      {error && (
        <p role="alert" className="mb-5 rounded-xl bg-rose/30 p-4 text-berry">
          {error}
        </p>
      )}
      {!order ? (
        <Button color="secondary" onPress={() => window.location.reload()}>
          Reload order
        </Button>
      ) : (
        <div className="grid items-start gap-7 lg:grid-cols-[1fr_350px]">
          <div className="min-w-0 space-y-6">
            <section className={ui.card}>
              <p className="text-xs break-all text-muted">Order {order.id}</p>
              <h2 role="status" className="mt-3 text-2xl capitalize">
                {status}
              </h2>
              <p className="mt-3 text-sm text-muted">
                {pending
                  ? "Your order is saved. Complete payment below. If you have just paid, we are waiting for confirmation from the payment provider; this page checks automatically."
                  : order.status === "PAID"
                    ? "Payment confirmed. Your saved design is ready for the Albumo team to review."
                    : order.status === "CANCELLED"
                      ? "This order has been cancelled. Your original project is still available in Studio."
                      : "Your latest order status is shown here."}
              </p>
              {pending && (
                <Button className="mt-5" onPress={pay} isLoading={busy}>
                  Pay {money(order.totalAmountCents)} securely
                </Button>
              )}
              {order.status === "REFUND_INITIATED" && (
                <p className="mt-4 text-sm">
                  Your payment needs a refund review. Contact us with this order number
                  for help.
                </p>
              )}
            </section>
            <section className={`${ui.card} space-y-5`}>
              <h2 className="text-xl font-medium">The stories in your order</h2>
              {order.items.map((item) => (
                <article key={item.id} className="space-y-3 border-t border-line pt-5">
                  <h3 className="font-medium">
                    {item.description} × {item.quantity}
                  </h3>
                  <p>{money(item.subtotalCents)}</p>
                  {item.album && (
                    <>
                      <p className="text-sm text-muted">
                        Version {item.album.revision} ·{" "}
                        {item.album.options
                          .map((o) => `${o.label}: ${o.value}`)
                          .join(" · ")}
                      </p>
                      <SavedDesignPreview
                        endpoint={`${endpoint}/items/${item.id}/design`}
                      />
                    </>
                  )}
                </article>
              ))}
            </section>
          </div>
          <aside className={`${ui.card} space-y-6`}>
            <h2 className="text-xl font-medium">Order details</h2>
            {order.checkoutAttempt ? (
              <OrderTotals totals={order.checkoutAttempt.summary} />
            ) : (
              <p>Total: {money(order.totalAmountCents)}</p>
            )}
            <div>
              <h3 className="mb-2 font-medium">Delivery to</h3>
              <address className="text-sm text-muted not-italic">
                {order.address.name}
                <br />
                {order.address.line1}
                <br />
                {order.address.line2 && (
                  <>
                    {order.address.line2}
                    <br />
                  </>
                )}
                {order.address.city}, {order.address.state} {order.address.pincode}
                <br />
                {order.address.country}
                <br />
                {order.address.phone}
              </address>
            </div>
            {order.trackingAwb && (
              <p className="text-sm">Tracking number: {order.trackingAwb}</p>
            )}
            <Link href="/account" className={`${ui.textLink} flex w-fit`}>
              Your account & orders
            </Link>
            <Link href="/contact" className={`${ui.textLink} flex w-fit`}>
              Need a hand?
            </Link>
          </aside>
        </div>
      )}
    </>
  );
}
