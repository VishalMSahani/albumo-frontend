"use client";
import Link from "next/link";
import { useState } from "react";
import type { Product, CatalogueCategory } from "@/lib/catalogue-model";
import { ui } from "@/lib/ui";
import ProductCard from "../ProductCard";

export default function ProductGrid({
  products,
  categories,
  available,
  selectedCategory = "",
  initialSearch = "",
}: {
  products: Product[];
  categories: CatalogueCategory[];
  available: boolean;
  selectedCategory?: string;
  initialSearch?: string;
}) {
  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState("featured");
  const parent = categories.find(
    (item) =>
      item.id === selectedCategory ||
      item.subcategories.some((child) => child.id === selectedCategory),
  );
  const category = parent ? selectedCategory : "";
  const query = search.trim().toLowerCase();
  const visible = products.filter(
    (product) =>
      (!category ||
        product.superCategoryId === category ||
        product.category === category) &&
      (!query ||
        [
          product.title,
          product.description,
          product.categoryName,
          product.superCategoryName,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query)),
  );
  if (sort === "price-low") visible.sort((a, b) => a.price - b.price);
  if (sort === "price-high") visible.sort((a, b) => b.price - a.price);
  const categoryLink = (id: string) =>
    id ? "/products?" + new URLSearchParams({ category: id }) : "/products";
  return (
    <section className="pb-14 sm:pb-20" id="product-grid" aria-label="Product collection">
      <div className={ui.container}>
        <nav
          data-reveal
          aria-label="Super categories"
          className="mb-6 flex flex-wrap gap-2 rounded-[24px] border border-line/60 bg-surface p-2"
        >
          {[{ id: "", name: "All products" }, ...categories].map((item) => (
            <Link
              key={item.id}
              href={categoryLink(item.id)}
              scroll={false}
              aria-current={item.id === (parent?.id || "") ? "page" : undefined}
              className="inline-flex min-h-11 items-center rounded-full px-5 py-2 text-sm font-medium hover:bg-surface aria-[current=page]:bg-berry aria-[current=page]:text-white"
            >
              {item.name}
            </Link>
          ))}
        </nav>
        {parent && (
          <nav aria-label="Categories" className="mb-7 flex flex-wrap gap-2">
            {parent.subcategories.map((child) => (
              <Link
                key={child.id}
                href={categoryLink(child.id)}
                scroll={false}
                aria-current={category === child.id ? "page" : undefined}
                className="inline-flex min-h-11 items-center rounded-full border border-line px-4 py-2 text-sm hover:border-berry aria-[current=page]:border-berry aria-[current=page]:text-berry"
              >
                {child.name}
              </Link>
            ))}
          </nav>
        )}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <label className="grid w-full gap-2 text-sm font-medium sm:max-w-sm">
            Search the collection
            <input
              type="search"
              name="product-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Try travel, wedding or a canvas"
              className="min-h-12 rounded-2xl border border-line bg-white px-4 text-base font-normal placeholder:text-muted"
            />
          </label>
          <div className="flex items-end justify-between gap-5">
            <p role="status" className="pb-3 text-sm text-muted">
              {visible.length} {visible.length === 1 ? "product" : "products"}
            </p>
            <label className="grid gap-2 text-sm font-medium">
              Sort by
              <select
                name="product-sort"
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="min-h-12 rounded-2xl border border-line bg-white px-3 text-base font-normal"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
              </select>
            </label>
          </div>
        </div>
        {!available ? (
          <div
            role="alert"
            className="rounded-[28px] border border-line bg-surface p-10 text-center"
          >
            <h2 className="text-xl font-semibold">
              The collection is temporarily unavailable
            </h2>
            <p className="mt-3 text-muted">
              Please try again shortly, or contact us for help choosing your keepsake.
            </p>
            <Link href="/contact" className={ui.buttonOutline + " mt-6"}>
              Contact Albumo
            </Link>
          </div>
        ) : visible.length ? (
          <div className="grid items-start gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] border border-line bg-surface px-6 py-14 text-center">
            <h2 className="text-xl font-semibold">
              {products.length ? "No products found" : "Our collection is taking shape"}
            </h2>
            <p className="mt-3 text-base text-muted">
              {products.length
                ? "Try another search or browse a different category."
                : "New albums, wall art and gifts will appear here as they become available."}
            </p>
            {query && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className={ui.buttonOutline + " mt-6"}
              >
                Clear search
              </button>
            )}
          </div>
        )}
        {products.length > 0 && (
          <p className="mt-9 text-sm text-muted">
            Starting prices include the lowest-priced required choices. Your selection
            determines the indicative total.
          </p>
        )}
      </div>
    </section>
  );
}
