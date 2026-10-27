import Link from "next/link";
import Image from "@/components/CdnImage";
import { getCatalogue } from "@/lib/catalogue";
import { formatPrice } from "@/lib/site-content";
import { cx } from "@/lib/cx";
import { homeUi } from "./home/home-ui";

export default async function ShopCategories() {
  const { categories, products } = await getCatalogue();
  if (!categories.length) return null;
  return (
    <nav aria-label="Shop by category" className="pb-6 sm:pb-10">
      <div
        className={cx(
          homeUi.container,
          "grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(230px,1fr))]",
        )}
      >
        {categories.map((category, index) => {
          const items = products.filter(
            (product) => product.superCategoryId === category.id,
          );
          return (
            <Link
              data-reveal
              data-reveal-delay={index * 90}
              key={category.id}
              href={"/products?" + new URLSearchParams({ category: category.id })}
              className={cx(
                homeUi.lift,
                "group flex min-h-28 items-center gap-4 rounded-3xl border border-line/70 bg-surface px-5 py-5 hover:border-berry/30 hover:shadow-[0_12px_30px_-20px_#c63f6540] sm:px-6",
              )}
            >
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl border border-white bg-white text-berry">
                {category.imageUrl ? (
                  <Image
                    src={category.imageUrl}
                    alt=""
                    width={56}
                    height={56}
                    className="size-12 object-contain"
                  />
                ) : (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="size-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                  >
                    <path
                      d={
                        /gift/i.test(category.name)
                          ? "M3 8h18v4H3zM5 12v9h14v-9M12 8v13M12 8H8a3 3 0 1 1 3-3l1 3Zm0 0h4a3 3 0 1 0-3-3l-1 3Z"
                          : /wall|print/i.test(category.name)
                            ? "M3 3h18v18H3zM6 17l5-6 3 3 2-2 2 5M7 7h.01"
                            : "M3 4h6a3 3 0 0 1 3 3v14a4 4 0 0 0-4-3H3V4Zm18 0h-6a3 3 0 0 0-3 3v14a4 4 0 0 1 4-3h5V4Z"
                      }
                    />
                  </svg>
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-medium tracking-tight group-hover:text-berry sm:text-lg">
                  {category.name}
                </span>
                <span className="mt-1 block text-sm text-muted">
                  {items.length
                    ? "From " + formatPrice(Math.min(...items.map((item) => item.price)))
                    : "Explore the collection"}
                </span>
              </span>
              <span
                aria-hidden="true"
                className="text-xl text-muted transition-transform duration-300 group-hover:translate-x-1 group-hover:text-berry motion-reduce:transform-none"
              >
                ↗
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
