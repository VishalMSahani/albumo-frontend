import Link from "next/link";
import { getCatalogue } from "@/lib/catalogue";
import { ui } from "@/lib/ui";
import { cx } from "@/lib/cx";
import { homeUi } from "./home/home-ui";
import HomeProductCard from "./home/HomeProductCard";

export default async function Products() {
  const { products, available } = await getCatalogue();
  const featured = [
    ...products.filter((item) => item.isFeatured),
    ...products.filter((item) => !item.isFeatured),
  ].slice(0, 3);
  return (
    <section className={homeUi.section} id="products" aria-labelledby="collection-title">
      <div className={homeUi.container}>
        <div
          data-reveal
          className="mb-10 flex flex-col items-start justify-between gap-6 sm:mb-12 md:flex-row md:items-end"
        >
          <div>
            <span className={homeUi.eyebrow}>The collection</span>
            <h2 id="collection-title" className={homeUi.heading}>
              A little more <span className="text-berry">personal.</span>
            </h2>
          </div>
          <Link
            href="/products"
            className={cx(ui.buttonOutline, "shrink-0 rounded-full")}
          >
            View all products <span aria-hidden="true">↗</span>
          </Link>
        </div>
        {featured.length ? (
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product, index) => (
              <div data-reveal data-reveal-delay={index * 130} key={product.id}>
                <HomeProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-line bg-surface p-8 text-base text-muted">
            <p>
              {available
                ? "Our collection is taking shape. New keepsakes will be here soon."
                : "The collection is temporarily unavailable. Please check back shortly."}
            </p>
            <Link href="/contact" className={cx(ui.textLink, "mt-4")}>
              Talk to Albumo <span aria-hidden="true">↗</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
