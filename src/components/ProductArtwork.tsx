import type { Product } from "@/lib/site-content";
import PhotoPlaceholder from "./PhotoPlaceholder";

export const productBackgrounds = {
  rose: "bg-[#f7f0ef]",
  sage: "bg-[#f1f3ee]",
  sand: "bg-[#f5f1ec]",
  clay: "bg-[#f5ece6]",
};

const coverClasses = {
  album:
    "h-[74%] w-[57%] -rotate-8 border-l-[3px] border-[#e6dfd5] bg-paper px-[19px] pt-[19px] pb-3.5 shadow-[-3px_1px_0_#b2a89c,2px_4px_0_#d5cfc5,10px_18px_22px_#3a2e2a1c]",
  book: "h-[74%] w-[57%] rotate-7 border-l-[3px] border-[#9e5838] bg-terracotta px-[19px] pt-[19px] pb-3.5 text-paper shadow-[-3px_1px_0_#8f5947,2px_4px_0_#d5cfc5,10px_18px_22px_#3a2e2a1c]",
  print:
    "h-[70%] w-3/5 -rotate-4 border-[6px] border-[#a57352] bg-paper p-[13px] shadow-[8px_14px_14px_#3a2e2a1a]",
};

export default function ProductArtwork({
  product,
  large = false,
}: {
  product: Product;
  large?: boolean;
}) {
  if (product.format === "gift") {
    return (
      <div className="h-3/4 w-[78%]">
        <PhotoPlaceholder
          slot={`product-${product.id}`}
          tone={product.tone}
          label="Product photo"
        />
      </div>
    );
  }

  const isPrint = product.format === "print";

  return (
    <div
      className={`flex flex-col transition-transform duration-200 group-hover:-translate-y-1 group-hover:-rotate-4 motion-reduce:transform-none motion-reduce:transition-none ${coverClasses[product.format]}`}
    >
      {!isPrint && (
        <>
          <span className={`tracking-[0.14em] ${large ? "text-[8px]" : "text-[5px]"}`}>
            THE ALBUMO COLLECTION
          </span>
          <span
            className={`mt-[15px] font-display leading-[1.05] ${large ? "max-w-55 text-[clamp(28px,4.5vw,56px)]" : "max-w-35 text-[clamp(21px,2.1vw,30px)] max-[600px]:text-3xl"}`}
          >
            {product.cover}
          </span>
        </>
      )}
      <div
        className={`min-h-0 flex-1 overflow-hidden [&>div]:min-h-0 ${isPrint ? "" : "mt-[15px]"}`}
      >
        <PhotoPlaceholder
          slot={`product-${product.id}`}
          tone={product.tone === "rose" ? "clay" : "sand"}
          label="Your photo"
          sizes="(max-width: 600px) 60vw, 20vw"
        />
      </div>
      {!isPrint && (
        <span className={`mt-3 tracking-[0.14em] ${large ? "text-[8px]" : "text-[5px]"}`}>
          A STORY BY YOU
        </span>
      )}
    </div>
  );
}
