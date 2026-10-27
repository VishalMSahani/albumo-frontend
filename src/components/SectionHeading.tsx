import Link from "next/link";
import type { ReactNode } from "react";
import { ui } from "@/lib/ui";
type Props = {
  eyebrow: string;
  children: ReactNode;
  description?: string;
  href?: string;
  linkLabel?: string;
};

export default function SectionHeading({
  eyebrow,
  children,
  description,
  href,
  linkLabel,
}: Props) {
  return (
    <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:mb-10 md:flex-row md:items-end md:gap-8">
      <div className="max-w-3xl">
        <span className={ui.eyebrow}>{eyebrow}</span>
        <h2 className={ui.heading}>{children}</h2>
        {description && (
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
            {description}
          </p>
        )}
      </div>
      {href && (
        <Link href={href} className={`${ui.textLink} shrink-0`}>
          {linkLabel}
          <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  );
}
