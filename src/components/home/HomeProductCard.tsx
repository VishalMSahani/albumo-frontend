import Link from "next/link";
import { formatPrice, type Product } from "@/lib/site-content";
import CdnImage from "../CdnImage";

export default function HomeProductCard({ product }: { product: Product }) {
  const href = "/products/" + encodeURIComponent(product.slug);
  return (
    <article className="min-w-0" id={"product-" + product.id}>
      <Link
        href={href}
        aria-label={"Explore " + product.title}
        className="group relative grid aspect-[1.08] place-items-center overflow-hidden rounded-[28px] border border-line/60 bg-surface"
      >
        {product.isFeatured && (
          <span className="absolute top-4 left-4 z-10 rounded-full border border-white bg-white/85 px-3 py-1.5 text-xs font-medium text-berry backdrop-blur-md">
            Featured
          </span>
        )}
        {product.imageUrl ? (
          <CdnImage
            src={product.imageUrl}
            alt={product.title}
            fill
            sizes="(max-width: 639px) 90vw, (max-width: 1023px) 45vw, 30vw"
            className="object-contain p-6 transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transform-none"
          />
        ) : (
          <span className="flex flex-col items-center gap-5 px-8 text-center text-muted">
            <svg
              viewBox="0 0 64 64"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="size-20"
              aria-hidden="true"
            >
              <rect x="12" y="8" width="40" height="48" rx="4" />
              <path d="M18 8v48M26 24h18M26 31h13M26 44h10" />
            </svg>
            <span className="text-sm">Product photographs coming soon</span>
          </span>
        )}
        <span
          aria-hidden="true"
          className="absolute right-4 bottom-4 grid size-11 place-items-center rounded-full border border-line/60 bg-white text-xl transition-colors group-hover:bg-berry group-hover:text-white"
        >
          ↗
        </span>
      </Link>
      <div className="px-1 pt-5">
        <p className="mb-2 text-xs font-medium tracking-[0.1em] text-muted uppercase">
          {product.categoryName}
        </p>
        <h3 className="text-xl leading-snug font-medium tracking-[-0.025em]">
          <Link href={href} className="hover:text-berry">
            {product.title}
          </Link>
        </h3>
        <p className="mt-3 text-lg font-medium">
          <span className="mr-1 text-sm font-normal text-muted">From</span>{" "}
          {formatPrice(product.price)}
        </p>
      </div>
    </article>
  );
}
