import Link from "next/link";
import { formatPrice, type Product } from "@/lib/site-content";
import CdnImage from "./CdnImage";
export default function ProductCard({ product }: { product: Product }) {
  const href = "/products/" + encodeURIComponent(product.slug);
  return (
    <article data-reveal className="min-w-0 scroll-mt-28" id={"product-" + product.id}>
      <Link
        href={href}
        className="group relative grid aspect-[1.12] place-items-center overflow-hidden rounded-[28px] border border-line/60 bg-surface"
        aria-label={"Explore " + product.title}
      >
        {product.imageUrl ? (
          <CdnImage
            src={product.imageUrl}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-contain p-6 transition-transform duration-700 group-hover:scale-[1.04] motion-reduce:transform-none"
          />
        ) : (
          <span className="px-6 text-center text-sm text-muted">
            Product photographs coming soon
          </span>
        )}
      </Link>
      <div className="px-1 pt-5">
        <p className="mb-2 text-xs font-medium tracking-wider text-muted uppercase">
          {product.categoryName}
        </p>
        <h3 className="text-xl leading-snug font-medium tracking-[-0.025em]">
          <Link href={href} className="hover:text-berry">
            {product.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 min-h-11 text-sm leading-relaxed text-muted">
          {product.description}
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-lg font-semibold">
            <span className="mr-1 text-sm font-normal text-muted">From</span>{" "}
            {formatPrice(product.price)}
          </p>
          <Link
            href={href}
            className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm font-medium transition-colors hover:border-berry hover:text-berry"
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}
