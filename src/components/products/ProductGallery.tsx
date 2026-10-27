"use client";
import { useState } from "react";
import type { Product } from "@/lib/catalogue-model";
import CdnImage from "../CdnImage";
export default function ProductGallery({ product }: { product: Product }) {
  const [index, setIndex] = useState(0);
  const image = product.images[index];
  return (
    <div>
      <div className="relative grid aspect-square place-items-center overflow-hidden rounded-[32px] border border-line/60 bg-linear-to-br from-surface to-sand/60">
        {image ? (
          <CdnImage
            src={image}
            alt={product.title + " - view " + (index + 1)}
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
            className="object-contain p-6 sm:p-10"
            preload
          />
        ) : (
          <p className="px-8 text-center text-sm text-muted">
            Product photographs coming soon
          </p>
        )}
      </div>
      {product.images.length > 1 && (
        <div
          className="mt-4 flex gap-3 overflow-x-auto pb-2"
          role="group"
          aria-label="Product photographs"
        >
          {product.images.map((url, i) => (
            <button
              key={url}
              type="button"
              aria-label={"View photograph " + (i + 1)}
              aria-pressed={index === i}
              onClick={() => setIndex(i)}
              className="relative size-20 shrink-0 overflow-hidden rounded-2xl border border-line aria-pressed:border-berry"
            >
              <CdnImage
                src={url}
                alt=""
                fill
                sizes="80px"
                className="object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
