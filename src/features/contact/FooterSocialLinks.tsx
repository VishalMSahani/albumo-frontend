"use client";

import { useContact } from "./ContactProvider";
import type { SocialPlatform, SocialProfile } from "./social-links";

function SocialIcon({ platform }: { platform: SocialPlatform }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-4 shrink-0"
    >
      {platform === "facebook" && (
        <path d="M14 21v-8h3l.5-4H14V7c0-1 .5-1.5 1.5-1.5H18V2h-3c-3 0-5 2-5 5v2H7v4h3v8" />
      )}
      {platform === "instagram" && (
        <>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r=".75" fill="currentColor" stroke="none" />
        </>
      )}
      {platform === "youtube" && (
        <>
          <rect x="2" y="5" width="20" height="14" rx="4" />
          <path d="m10 9 5 3-5 3Z" />
        </>
      )}
      {platform === "whatsapp" && (
        <>
          <path d="M21 11.5a9 9 0 0 1-13.5 8L3 21l1.5-4.5A9 9 0 1 1 21 11.5Z" />
          <path d="m9 7 2 3-1.5 1.5a7 7 0 0 0 3 3L14 13l3 2c-1 3-4 2-7-1S6 8 9 7Z" />
        </>
      )}
    </svg>
  );
}

export default function FooterSocialLinks({ profiles }: { profiles: SocialProfile[] }) {
  const { data } = useContact();
  const whatsapp = data?.whatsapp;
  const links: SocialProfile[] = [
    ...profiles,
    {
      platform: "whatsapp",
      label: "WhatsApp",
      href:
        whatsapp && /^[1-9]\d{7,14}$/.test(whatsapp)
          ? "https://wa.me/" + whatsapp
          : undefined,
    },
  ];
  const pill =
    "inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-full border border-white bg-white px-3 py-2 text-xs font-medium text-ink";

  return (
    <section aria-labelledby="footer-social-title">
      <h2 id="footer-social-title" className="text-sm font-medium">
        Connect with us
      </h2>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {links.map((link) =>
          link.href ? (
            <a
              key={link.platform}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={
                pill +
                " transition-colors hover:border-rose hover:bg-rose motion-reduce:transition-none"
              }
            >
              <SocialIcon platform={link.platform} />
              {link.label}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ) : (
            <span
              key={link.platform}
              role="link"
              aria-disabled="true"
              title={link.label + " profile is not connected yet"}
              className={pill + " opacity-60"}
            >
              <SocialIcon platform={link.platform} />
              {link.label}
              <span className="sr-only"> (not connected yet)</span>
            </span>
          ),
        )}
      </div>
    </section>
  );
}
