"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { errorMessage } from "@/lib/api-client";
import { cx } from "@/lib/cx";
import { ui } from "@/lib/ui";
import { useResource } from "@/lib/use-resource";
import { AccountIcon } from "./AccountIcon";
import { accountApi } from "./account.service";
import type {
  AccountOrder,
  AlbumOccasion,
  AlbumProject,
  AlbumProjectList,
  OrderStatus,
} from "./types";

export type AccountCollectionProps = {
  userId: string;
  preview?: boolean;
  onViewAll?: () => void;
};

type CollectionKind = "albums" | "orders";

const occasionLabels: Record<AlbumOccasion, string> = {
  EVERYDAY: "Everyday moments",
  FAMILY: "Family & friends",
  TRAVEL: "A little adventure",
  CELEBRATION: "A celebration",
  OTHER: "A story of my own",
};
const statusLabels: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Awaiting payment",
  PAID: "Paid",
  PROCESSING: "Processing",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  RETURN_REQUESTED: "Return requested",
  RETURNED: "Returned",
  REFUND_INITIATED: "Refund initiated",
  REFUNDED: "Refunded",
  CANCELLED: "Cancelled",
};
const paymentLabels = {
  CREATED: "Awaiting payment",
  SUCCESS: "Successful",
  FAILED: "Failed",
  REFUNDED: "Refunded",
};
const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
});
const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});
const money = (cents: number) => currency.format(cents / 100);
function dateLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : dateFormatter.format(date);
}

function secureStudioOrigin(): string | null {
  const configured =
    process.env.NEXT_PUBLIC_STUDIO_URL?.trim() ||
    (process.env.NODE_ENV === "development" ? "http://localhost:3001" : "");
  if (!configured) return null;
  try {
    const url = new URL(configured);
    const localDevelopment =
      process.env.NODE_ENV === "development" &&
      url.protocol === "http:" &&
      ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    if ((url.protocol !== "https:" && !localDevelopment) || url.username || url.password)
      return null;
    // Studio uses root /projects/:id routes, as in its own dashboard.
    return url.origin;
  } catch {
    return null;
  }
}
const studioOrigin = secureStudioOrigin();

function trackingHref(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}

function accountRequest<T>(
  controller: AbortController,
  loader: (signal: AbortSignal) => Promise<T>,
): Promise<T> {
  const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(20_000)]);
  return loader(signal).catch((error: unknown) => {
    if (signal.aborted && !controller.signal.aborted)
      throw new Error("Loading is taking longer than expected. Please try again.");
    throw error;
  });
}

/** useResource handles stale results; abort also stops work after retry/unmount. */
function useAccountResource<T>(
  key: string,
  loader: (signal: AbortSignal) => Promise<T>,
  enabled: boolean,
) {
  const controller = useRef<AbortController | null>(null);
  const resource = useResource(
    key,
    () => {
      controller.current?.abort();
      const next = new AbortController();
      controller.current = next;
      return accountRequest(next, loader);
    },
    enabled,
  );
  useEffect(
    () => () => {
      controller.current?.abort();
    },
    [key, enabled],
  );
  return resource;
}

function PanelHeading({
  id,
  kind,
  preview,
  onViewAll,
}: {
  id: string;
  kind: CollectionKind;
  preview: boolean;
  onViewAll?: () => void;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="flex min-w-0 items-start gap-3 sm:gap-4">
        <span
          className={cx(
            "flex size-12 shrink-0 items-center justify-center rounded-2xl text-ink",
            kind === "albums" ? "bg-sage" : "bg-rose",
          )}
        >
          <AccountIcon name={kind} className="size-6" />
        </span>
        <div className="min-w-0">
          <h2
            id={id}
            className="font-sans text-2xl font-medium tracking-[-0.04em] text-ink"
          >
            {kind === "albums" ? "Albums & projects" : "Orders"}
          </h2>
        </div>
      </div>
      {preview && (
        <Button
          color="tertiary"
          onPress={onViewAll}
          isDisabled={!onViewAll}
          className="shrink-0 text-berry"
          aria-label={`View all ${kind}`}
        >
          <span className="flex items-center gap-2">
            View all <AccountIcon name="arrow" className="size-4" />
          </span>
        </Button>
      )}
    </div>
  );
}

function LoadingCollection({ kind }: { kind: CollectionKind }) {
  return (
    <div role="status" className="space-y-3">
      <p className="text-sm text-muted">Loading your {kind}…</p>
      <div aria-hidden="true" className="space-y-3">
        {[0, 1].map((item) => (
          <div key={item} className="flex gap-4 rounded-2xl border border-line p-5">
            <div className="size-11 shrink-0 rounded-xl bg-surface" />
            <div className="grid flex-1 gap-3 py-1">
              <div className="h-3 w-2/3 rounded-full bg-surface" />
              <div className="h-3 w-1/3 rounded-full bg-surface" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CollectionError({ error, retry }: { error: string; retry: () => void }) {
  return (
    <div className="rounded-2xl border border-berry/15 bg-rose p-5">
      <p role="alert" className="text-sm leading-6 text-ink">
        {error}
      </p>
      <Button color="secondary" onPress={retry} className="mt-4 min-h-11 px-5 py-2">
        Try again
      </Button>
    </div>
  );
}

function EmptyCollection({ kind }: { kind: CollectionKind }) {
  return (
    <div className="rounded-[22px] border border-dashed border-line bg-surface p-6 sm:p-8">
      <h3 className="font-sans text-xl font-medium tracking-tight text-ink">
        {kind === "albums" ? "No saved albums yet." : "No orders yet."}
      </h3>
      <p className="mt-2 max-w-lg text-sm leading-6 text-muted">
        {kind === "albums"
          ? "Your saved Studio drafts will appear here."
          : "Your order updates and delivery details will appear here."}
      </p>
      <Link href="/products" className={cx(ui.button, "mt-5 min-h-11 px-5 py-2")}>
        Explore the collection <AccountIcon name="arrow" className="size-4" />
      </Link>
    </div>
  );
}

function AlbumCard({ project }: { project: AlbumProject }) {
  const config = project.configuration;
  const pageCount = config?.pageCount ?? project.pageCount;
  const href = studioOrigin
    ? new URL(`/projects/${encodeURIComponent(project.id)}`, studioOrigin).href
    : null;
  return (
    <article className="flex h-full flex-col rounded-[22px] border border-line bg-white p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-2 text-xs font-medium text-muted">
        <span className="rounded-full bg-sage px-3 py-1.5 text-ink">
          {occasionLabels[project.occasion] ?? project.occasion}
        </span>
        <span>Studio draft</span>
      </div>
      <h3 className="font-sans text-xl leading-snug font-medium tracking-tight break-words text-ink">
        {project.title}
      </h3>
      <p className="mt-2 text-xs leading-5 text-muted">
        Updated <time dateTime={project.updatedAt}>{dateLabel(project.updatedAt)}</time>
      </p>
      <div className="mt-4 flex-1 text-sm leading-6">
        {config ? (
          <>
            <p className="font-medium text-ink">{config.productName}</p>
            <p className="mt-1 text-muted">
              {[
                pageCount !== null ? `${pageCount} pages` : "",
                `${config.quantity} ${config.quantity === 1 ? "copy" : "copies"}`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {config.options.length > 0 && (
              <dl className="mt-3 space-y-1 text-xs leading-5">
                {config.options
                  .filter((option) => option.kind !== "pages")
                  .map((option) => (
                    <div key={option.groupId} className="flex flex-wrap gap-x-2">
                      <dt className="text-muted">{option.label}:</dt>
                      <dd className="break-words text-ink">{option.value}</dd>
                    </div>
                  ))}
              </dl>
            )}
          </>
        ) : (
          <p className="text-muted">
            Album options haven’t been selected for this draft yet.
          </p>
        )}
      </div>
      {href ? (
        <Link
          href={href}
          prefetch={false}
          className={cx(ui.buttonOutline, "mt-5 min-h-11 w-full px-4 py-2")}
        >
          Continue in Studio <AccountIcon name="arrow" className="size-4" />
        </Link>
      ) : (
        <Button color="secondary" isDisabled className="mt-5 min-h-11 w-full px-4 py-2">
          Continue in Studio
        </Button>
      )}
    </article>
  );
}

function AlbumsCollection({
  userId,
  preview = false,
  onViewAll,
}: AccountCollectionProps) {
  const headingId = useId();
  const albums = useAccountResource(
    `account-albums:${userId}`,
    (signal) => accountApi.listAlbums(undefined, signal),
    !!userId,
  );
  const [pages, setPages] = useState<AlbumProjectList[]>([]);
  const [moreError, setMoreError] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);
  const pending = useRef<AbortController | null>(null);
  useEffect(
    () => () => {
      pending.current?.abort();
    },
    [],
  );
  const combined = [
    ...(albums.data?.items ?? []),
    ...pages.flatMap((page) => page.items),
  ];
  const uniqueAlbums = Array.from(
    new Map(combined.map((item) => [item.id, item])).values(),
  );
  const shown = preview ? uniqueAlbums.slice(0, 2) : uniqueAlbums;
  const nextCursor = pages.length
    ? pages[pages.length - 1].nextCursor
    : albums.data?.nextCursor;

  async function loadMore() {
    if (!nextCursor || pending.current || preview) return;
    const controller = new AbortController();
    pending.current = controller;
    setLoadingMore(true);
    setMoreError("");
    try {
      const page = await accountRequest(controller, (signal) =>
        accountApi.listAlbums(nextCursor, signal),
      );
      if (!controller.signal.aborted && pending.current === controller)
        setPages((previous) => [...previous, page]);
    } catch (error) {
      if (!controller.signal.aborted && pending.current === controller)
        setMoreError(errorMessage(error));
    } finally {
      if (!controller.signal.aborted && pending.current === controller) {
        pending.current = null;
        setLoadingMore(false);
      }
    }
  }

  return (
    <section aria-labelledby={headingId} className={cx(ui.card, "min-w-0 font-sans")}>
      <PanelHeading
        id={headingId}
        kind="albums"
        preview={preview}
        onViewAll={onViewAll}
      />
      {!userId ? (
        <p className="text-sm text-muted">Sign in to see your saved albums.</p>
      ) : albums.loading ? (
        <LoadingCollection kind="albums" />
      ) : albums.error ? (
        <CollectionError error={albums.error} retry={albums.reload} />
      ) : shown.length === 0 ? (
        <EmptyCollection kind="albums" />
      ) : (
        <>
          {!studioOrigin && (
            <p
              role="status"
              className="mb-5 rounded-2xl bg-sage p-4 text-sm leading-6 text-ink"
            >
              Studio links aren’t configured for this site yet. Your saved albums are
              still here; you’ll be able to continue once Studio is connected.
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            {shown.map((project) => (
              <AlbumCard key={project.id} project={project} />
            ))}
          </div>
          {!preview && nextCursor && (
            <div className="mt-6 border-t border-line pt-5">
              {moreError && (
                <p role="alert" className="mb-3 text-sm leading-6 text-berry">
                  {moreError}
                </p>
              )}
              <Button
                color="secondary"
                onPress={() => void loadMore()}
                isLoading={loadingMore}
              >
                {loadingMore
                  ? "Loading more albums…"
                  : moreError
                    ? "Try loading more again"
                    : "Load more albums"}
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cx(
        "inline-flex shrink-0 rounded-full px-3 py-1.5 text-xs font-medium",
        ["DELIVERED", "PAID"].includes(status)
          ? "bg-sage text-ink"
          : ["CANCELLED", "RETURNED", "REFUNDED"].includes(status)
            ? "bg-sand text-muted"
            : "bg-rose text-berry",
      )}
    >
      {statusLabels[status] ?? status.replaceAll("_", " ")}
    </span>
  );
}

function OrderOverview({ order }: { order: AccountOrder }) {
  return (
    <div className="grid min-w-0 flex-1 gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted">
          Order #{order.id.slice(-8).toUpperCase()}
        </p>
        <OrderStatusBadge status={order.status} />
      </div>
      <h3 className="text-base leading-6 font-medium break-words text-ink">
        {order.items[0]?.description || "Order details"}
        {order.items.length > 1 && (
          <span className="font-normal text-muted"> + {order.items.length - 1} more</span>
        )}
      </h3>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <p className="text-muted">
          Placed <time dateTime={order.createdAt}>{dateLabel(order.createdAt)}</time>
        </p>
        <p className="font-medium text-ink">{money(order.totalAmountCents)}</p>
      </div>
    </div>
  );
}

function OrderDetails({ order }: { order: AccountOrder }) {
  const address = order.address;
  const subtotal = order.items.reduce((sum, item) => sum + item.subtotalCents, 0);
  const adjustments = order.totalAmountCents - subtotal;
  const tracking = trackingHref(order.trackingUrl);
  const payment = order.payments.reduce<(typeof order.payments)[number] | undefined>(
    (latest, current) =>
      !latest || current.createdAt > latest.createdAt ? current : latest,
    undefined,
  );
  return (
    <div className="border-t border-line p-5 sm:p-6">
      <p className="mb-5 text-xs leading-5 break-all text-muted">
        Order reference: {order.id}
      </p>
      <Link href={`/orders/${encodeURIComponent(order.id)}`} className={`${ui.textLink} mb-5`}>View order and payment</Link>
      <h4 className="text-sm font-semibold text-ink">Items</h4>
      <ul className="mt-3 divide-y divide-line">
        {order.items.map((item) => (
          <li
            key={item.id}
            className="flex items-start justify-between gap-4 py-3 first:pt-0"
          >
            <div className="min-w-0">
              <p className="text-sm leading-6 font-medium break-words text-ink">
                {item.description}
              </p>
              <p className="mt-1 text-xs leading-5 text-muted">
                Qty {item.quantity} · {money(item.unitPriceCents)} each
              </p>
            </div>
            <p className="shrink-0 text-sm leading-6 text-ink">
              {money(item.subtotalCents)}
            </p>
          </li>
        ))}
      </ul>
      {order.items.length === 0 && (
        <p className="mt-2 text-sm text-muted">Item details aren’t available.</p>
      )}
      <div className="mt-5 grid gap-6 border-t border-line pt-5 md:grid-cols-2">
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-ink">Delivery address</h4>
          <address className="mt-3 text-sm leading-6 break-words text-muted not-italic">
            <p className="font-medium text-ink">{address.name}</p>
            <p>{address.line1}</p>
            {address.line2 && <p>{address.line2}</p>}
            <p>
              {address.city}, {address.state} {address.pincode}
            </p>
            <p>{address.country}</p>
            <p className="mt-1">{address.phone}</p>
          </address>
          {(order.trackingAwb || order.shippedAt || order.deliveredAt) && (
            <div className="mt-4 space-y-1 text-xs leading-5 text-muted">
              {order.trackingAwb && (
                <p className="break-words">Tracking reference: {order.trackingAwb}</p>
              )}
              {order.shippedAt && <p>Shipped {dateLabel(order.shippedAt)}</p>}
              {order.deliveredAt && <p>Delivered {dateLabel(order.deliveredAt)}</p>}
            </div>
          )}
          {tracking && (
            <Link
              href={tracking}
              target="_blank"
              rel="noopener noreferrer"
              prefetch={false}
              className={cx(ui.textLink, "mt-2")}
            >
              Track delivery <span className="sr-only">(opens in a new tab)</span>
              <AccountIcon name="arrow" className="size-4" />
            </Link>
          )}
        </div>
        <div className="rounded-2xl bg-surface p-4 sm:p-5">
          <h4 className="text-sm font-semibold text-ink">Order summary</h4>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Items subtotal</dt>
              <dd>{money(subtotal)}</dd>
            </div>
            {adjustments !== 0 && (
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Other adjustments</dt>
                <dd>{money(adjustments)}</dd>
              </div>
            )}
            <div className="flex justify-between gap-3 border-t border-line pt-3 font-semibold text-ink">
              <dt>Order total</dt>
              <dd>{money(order.totalAmountCents)}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs leading-5 text-muted">
            The total includes any shipping or discounts. Separate amounts aren’t provided
            in the order record.
          </p>
          <div className="mt-4 border-t border-line pt-4 text-xs leading-5 text-muted">
            {payment ? (
              <p>
                Latest payment: {paymentLabels[payment.status]} ·{" "}
                {money(payment.amountCents)}
              </p>
            ) : (
              <p>No payment record available yet.</p>
            )}
          </div>
        </div>
      </div>
      <Link href="/support/new" className={cx(ui.textLink, "mt-5")}>
        Need a hand with this order? <AccountIcon name="arrow" className="size-4" />
      </Link>
    </div>
  );
}

function OrdersCollection({
  userId,
  preview = false,
  onViewAll,
}: AccountCollectionProps) {
  const headingId = useId();
  const filterId = useId();
  const orders = useAccountResource(
    `account-orders:${userId}`,
    accountApi.listOrders,
    !!userId,
  );
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const allOrders = orders.data ?? [];
  const term = query.trim().toLocaleLowerCase("en-IN");
  const filtered = allOrders.filter(
    (order) =>
      (!status || order.status === status) &&
      (!term ||
        [
          order.id,
          statusLabels[order.status],
          ...order.items.map((item) => item.description),
        ]
          .join(" ")
          .toLocaleLowerCase("en-IN")
          .includes(term)),
  );
  const shown = preview ? allOrders.slice(0, 2) : filtered;
  return (
    <section aria-labelledby={headingId} className={cx(ui.card, "min-w-0 font-sans")}>
      <PanelHeading
        id={headingId}
        kind="orders"
        preview={preview}
        onViewAll={onViewAll}
      />
      {!userId ? (
        <p className="text-sm text-muted">Sign in to see your orders.</p>
      ) : orders.loading ? (
        <LoadingCollection kind="orders" />
      ) : orders.error ? (
        <CollectionError error={orders.error} retry={orders.reload} />
      ) : allOrders.length === 0 ? (
        <EmptyCollection kind="orders" />
      ) : (
        <>
          {!preview && (
            <div className="mb-6 grid items-end gap-4 sm:grid-cols-[minmax(0,1fr)_200px]">
              <Input
                label="Search orders"
                name="account-order-search"
                type="search"
                placeholder="Order reference or item name"
                value={query}
                onChange={setQuery}
              />
              <div className="grid gap-2">
                <label htmlFor={filterId} className="text-sm font-medium text-ink">
                  Order status
                </label>
                <select
                  id={filterId}
                  name="account-order-status"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="min-h-12 w-full rounded-2xl border border-line bg-white px-4 py-3 text-base text-ink outline-offset-4 focus-visible:outline-2 focus-visible:outline-berry"
                >
                  <option value="">All statuses</option>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          {shown.length === 0 ? (
            <div role="status" className="rounded-2xl bg-surface p-6">
              <h3 className="text-base font-medium text-ink">
                No orders match those details.
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                Try another item name or clear your filters to see every order.
              </p>
              <Button
                color="secondary"
                className="mt-4 min-h-11 px-5 py-2"
                onPress={() => {
                  setQuery("");
                  setStatus("");
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {shown.map((order) =>
                preview ? (
                  <article
                    key={order.id}
                    className="rounded-[22px] border border-line p-5 sm:p-6"
                  >
                    <OrderOverview order={order} />
                    <Button
                      color="tertiary"
                      onPress={onViewAll}
                      isDisabled={!onViewAll}
                      className="mt-3 -ml-3 text-berry"
                      aria-label={`View all orders, including order ${order.id}`}
                    >
                      <span className="flex items-center gap-2">
                        View order <AccountIcon name="arrow" className="size-4" />
                      </span>
                    </Button>
                  </article>
                ) : (
                  <details
                    key={order.id}
                    className="group rounded-[22px] border border-line bg-white"
                  >
                    <summary className="cursor-pointer list-none rounded-[22px] p-5 outline-offset-4 focus-visible:outline-2 focus-visible:outline-berry sm:p-6 [&::-webkit-details-marker]:hidden">
                      <OrderOverview order={order} />
                      <span className="mt-4 flex min-h-11 items-center gap-2 text-sm font-medium text-berry">
                        <span className="group-open:hidden">View details</span>
                        <span className="hidden group-open:inline">Hide details</span>
                        <AccountIcon
                          name="arrow"
                          className="size-4 rotate-90 transition-transform group-open:-rotate-90 motion-reduce:transition-none"
                        />
                      </span>
                    </summary>
                    <OrderDetails order={order} />
                  </details>
                ),
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}

/** Keyed children immediately clear old identity data, filters, and pagination. */
export function AlbumsPanel(props: AccountCollectionProps) {
  return <AlbumsCollection key={props.userId} {...props} />;
}

export function OrdersPanel(props: AccountCollectionProps) {
  return <OrdersCollection key={props.userId} {...props} />;
}
