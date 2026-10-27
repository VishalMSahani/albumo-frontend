import Image from "@/components/CdnImage";
import { imageSlots } from "@/lib/site-content";

type Props = {
  slot: string;
  tone?: "rose" | "sand" | "sage" | "clay";
  label?: string;
  className?: string;
  sizes?: string;
};

const tones = {
  rose: "bg-rose",
  sand: "bg-sand",
  sage: "bg-sage",
  clay: "bg-[#f0e0d6]",
};

export default function PhotoPlaceholder({
  slot,
  tone = "sand",
  label = "Your photo here",
  className = "",
  sizes = "(max-width: 600px) 100vw, 50vw",
}: Props) {
  const image = imageSlots[slot];

  return (
    <div
      className={`relative h-full min-h-25 w-full overflow-hidden ${tones[tone]} ${className}`}
    >
      {image?.src ? (
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          className="object-cover"
        />
      ) : (
        <div
          className="absolute inset-0 grid place-items-center"
          role="img"
          aria-label={`Image placeholder: ${image?.alt || label}`}
        >
          <span
            className="absolute top-4.5 left-4.5 size-4.5 border-t border-l border-ink/30"
            aria-hidden="true"
          />
          <span className="p-5 text-center text-xs tracking-[0.08em] text-[#5c4a41] uppercase">
            {label}
          </span>
          <span
            className="absolute right-4.5 bottom-4.5 size-4.5 border-r border-b border-ink/30"
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
}
