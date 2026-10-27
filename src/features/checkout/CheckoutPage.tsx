"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { api, ApiError, errorMessage } from "@/lib/api-client";
import { accountApi } from "@/features/account/account.service";
import { createLegalAcceptance, LEGAL_POLICY_LINKS } from "@/features/legal/constants";
import { ui } from "@/lib/ui";
import { useAuth } from "@/features/auth/AuthProvider";
import { CommerceShell, money, OrderTotals } from "./CommerceShell";
import { SavedDesignPreview } from "./SavedDesignPreview";
import { StudioReviewLink } from "./StudioReviewLink";
import type { CartQuote, ShippingAddress } from "./types";
const emptyAddress: ShippingAddress = {
  name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
};
const fields = [
  { key: "name", label: "Full name", auto: "name" },
  { key: "phone", label: "Mobile number", auto: "tel" },
  { key: "line1", label: "Street address", auto: "address-line1" },
  { key: "line2", label: "Apartment, landmark (optional)", auto: "address-line2" },
  { key: "city", label: "City", auto: "address-level2" },
  { key: "state", label: "State", auto: "address-level1" },
  { key: "pincode", label: "PIN code", auto: "postal-code" },
] as const;
export default function CheckoutPage() {
  return (
    <CommerceShell
      title="Almost in your hands."
      subtitle="A last look at your story, and somewhere special to send it."
      path="/checkout"
    >
      <Checkout />
    </CommerceShell>
  );
}
function Checkout() {
  const router = useRouter();
  const { user } = useAuth();
  const [cart, setCart] = useState<CartQuote | null>(null);
  const [addresses, setAddresses] = useState<(ShippingAddress & { id: string })[]>([]);
  const [selected, setSelected] = useState("");
  const [address, setAddress] = useState(emptyAddress);
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState("");
  const [legal, setLegal] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const lock = useRef(false);
  const recoveryKey = `albumo-checkout-attempt:${user!.id}`;
  useEffect(() => {
    const controller = new AbortController();
    async function init() {
      const previous = sessionStorage.getItem(recoveryKey);
      if (previous) {
        try {
          const found = await api.get<{ orderId: string }>(
            `/api/checkout/attempts/${previous}`,
            { signal: controller.signal },
          );
          router.replace(`/orders/${found.orderId}`);
          return;
        } catch (e) {
          if (!(e instanceof ApiError && e.status === 404)) throw e;
          sessionStorage.removeItem(recoveryKey);
        }
      }
      const quote = await api.get<CartQuote>("/api/checkout/cart", {
        signal: controller.signal,
      });
      setCart(quote);
      const saved = await accountApi.getAddresses(controller.signal);
      setAddresses(saved.map((a) => ({ ...a, line2: a.line2 || "" })));
    }
    init().catch((e) => {
      if (!controller.signal.aborted) setError(errorMessage(e));
    });
    return () => controller.abort();
  }, [recoveryKey, router]);
  async function applyCoupon() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      setCart(await api.post<CartQuote>("/api/checkout/quote", { couponCode: coupon }));
      setApplied(coupon.trim());
      setReviewed(false);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function submit() {
    if (lock.current || !cart || !legal || !reviewed) return;
    lock.current = true;
    setBusy(true);
    setError("");
    const requestId = crypto.randomUUID();
    try {
      sessionStorage.setItem(recoveryKey, requestId);
      const result = await api.post<{ orderId: string }>("/api/checkout/orders", {
        requestId,
        quoteHash: cart.quoteHash,
        couponCode: applied,
        ...(selected ? { shippingAddressId: selected } : { shippingAddress: address }),
        legalConsent: createLegalAcceptance(),
        designAccepted: true,
      });
      router.replace(`/orders/${result.orderId}`);
    } catch (e) {
      try {
        const found = await api.get<{ orderId: string }>(
          `/api/checkout/attempts/${requestId}`,
        );
        router.replace(`/orders/${found.orderId}`);
        return;
      } catch (recovery) {
        if (!(recovery instanceof ApiError && recovery.status === 404)) {
          setUncertain(true);
          setError(
            "We could not confirm whether your order was created. Refresh this page to recover it before trying again.",
          );
          return;
        }
      }
      sessionStorage.removeItem(recoveryKey);
      setError(errorMessage(e));
      setReviewed(false);
      await api
        .post<CartQuote>("/api/checkout/quote", { couponCode: applied })
        .then(setCart)
        .catch(() => {});
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <>
      {error && (
        <p role="alert" className="mb-5 rounded-xl bg-rose/30 p-4 text-berry">
          {error}
        </p>
      )}
      {!cart ? (
        <Button color="secondary" onPress={() => window.location.reload()}>
          Reload checkout
        </Button>
      ) : !cart.lines.length ? (
        <div className={ui.card}>
          <p>Your cart is empty.</p>
          <Link href="/cart" className={ui.textLink}>
            Return to cart
          </Link>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
          className="grid items-start gap-7 lg:grid-cols-[1fr_360px]"
        >
          <div className="min-w-0 space-y-6">
            <section className={ui.card}>
              <h2 className="mb-5 text-2xl">01. A final look</h2>
              {cart.lines.map((line) => (
                <div
                  key={line.id}
                  className="space-y-3 border-b border-line py-4 last:border-0"
                >
                  <h3 className="font-medium">
                    {line.albumTitle || line.name} × {line.quantity}
                  </h3>
                  <p className="text-sm text-muted">
                    {line.options.map((o) => `${o.label}: ${o.value}`).join(" · ")} ·{" "}
                    {money(line.totalCents)}
                  </p>
                  {line.issues.map((i) => (
                    <p key={i} className="text-berry">
                      {i}
                    </p>
                  ))}
                  {line.kind === "album" && (
                    <div className="space-y-3">
                      <SavedDesignPreview
                        endpoint={`/api/checkout/albums/${line.id}/design`}
                      />
                      {line.issues.length > 0 && (
                        <StudioReviewLink projectId={line.projectId} />
                      )}
                    </div>
                  )}
                </div>
              ))}
              <label className="mt-5 flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  required
                  checked={reviewed}
                  disabled={busy}
                  onChange={(e) => setReviewed(e.target.checked)}
                  className="mt-1 accent-[#c63c64]"
                />
                I have reviewed the saved layouts, photo crops, text and selected options
                for every item.
              </label>
              <p className="mt-3 text-xs text-muted">
                This confirms your digital design. Production specifications and print
                proof are reviewed separately.
              </p>
            </section>
            <section className={ui.card}>
              <h2 className="mb-5 text-2xl">02. Where it belongs</h2>
              {addresses.length > 0 && (
                <label className="mb-6 block text-sm">
                  Delivery address
                  <select
                    value={selected}
                    disabled={busy}
                    onChange={(e) => setSelected(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-line bg-white p-3"
                  >
                    <option value="">Use a new address</option>
                    {addresses.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}, {a.line1}, {a.pincode}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {selected ? (
                <p className="text-sm">
                  {Object.values(addresses.find((a) => a.id === selected) || {})
                    .filter((v) => v !== selected)
                    .join(", ")}
                </p>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2">
                  {fields.map((f) => (
                    <Input
                      key={f.key}
                      label={f.label}
                      value={address[f.key]}
                      onChange={(value) => setAddress((a) => ({ ...a, [f.key]: value }))}
                      autoComplete={f.auto}
                      isRequired={f.key !== "line2"}
                      isDisabled={busy}
                      maxLength={f.key === "pincode" ? 6 : 200}
                      type={f.key === "phone" ? "tel" : "text"}
                    />
                  ))}
                  <p className="text-sm text-muted">Delivery within India.</p>
                </div>
              )}
            </section>
          </div>
          <aside className={`${ui.card} space-y-6 lg:sticky lg:top-28`}>
            <h2 className="text-xl font-medium">Your order</h2>
            <div className="space-y-3">
              <Input
                label="Coupon code"
                value={coupon}
                onChange={setCoupon}
                isDisabled={busy}
                maxLength={60}
              />
              <Button color="secondary" onPress={applyCoupon} isDisabled={busy}>
                Apply coupon
              </Button>
              {applied && (
                <p className="text-sm text-berry">
                  Applied: {applied}. Clear the field and apply to remove.
                </p>
              )}
            </div>
            <OrderTotals totals={cart} />
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                required
                checked={legal}
                disabled={busy}
                onChange={(e) => setLegal(e.target.checked)}
                className="mt-1 accent-[#c63c64]"
              />
              <span>
                I accept the{" "}
                <Link
                  className="underline"
                  href={LEGAL_POLICY_LINKS.termsAndConditions}
                  target="_blank"
                >
                  terms
                </Link>
                ,{" "}
                <Link
                  className="underline"
                  href={LEGAL_POLICY_LINKS.privacyPolicy}
                  target="_blank"
                >
                  privacy policy
                </Link>
                , and{" "}
                <Link
                  className="underline"
                  href={LEGAL_POLICY_LINKS.refundPolicy}
                  target="_blank"
                >
                  refund policy
                </Link>
                ,{" "}
                <Link
                  className="underline"
                  href={LEGAL_POLICY_LINKS.shippingPolicy}
                  target="_blank"
                >
                  shipping policy
                </Link>{" "}
                and{" "}
                <Link
                  className="underline"
                  href={LEGAL_POLICY_LINKS.cancellationPolicy}
                  target="_blank"
                >
                  cancellation policy
                </Link>
                .
              </span>
            </label>
            <Button
              type="submit"
              className="w-full"
              isLoading={busy}
              isDisabled={
                !legal ||
                !reviewed ||
                uncertain ||
                cart.lines.some((l) => l.issues.length > 0)
              }
            >
              Place order
            </Button>
            <p className="text-xs text-muted">
              Next: secure payment through Zoho Payments. Your order is saved before you
              pay, so you can retry payment without ordering twice.
            </p>
            <Link href="/cart" className={ui.textLink}>
              Back to cart
            </Link>
          </aside>
        </form>
      )}
    </>
  );
}
