import Image from "@/components/CdnImage";
import Link from "next/link";
import { LEGAL_ENTITY, LEGAL_POLICY_LINKS } from "@/features/legal/constants";
import { ui } from "@/lib/ui";
import { cx } from "@/lib/cx";
import ContactDetails from "@/features/contact/ContactDetails";
import FooterSocialLinks from "@/features/contact/FooterSocialLinks";
import { socialProfiles } from "@/features/contact/social-links";
import NewsletterForm from "@/features/contact/NewsletterForm";
import { CookieSettingsButton } from "@/features/legal/CookieConsent";
import { partnerCategories } from "@/features/partners/partner-content";

const helpLinks = [
  { label: "Help centre", href: "/help" },
  { label: "Contact us", href: "/contact" },
  { label: "Support tickets", href: "/support/tickets" },
  { label: "My account", href: "/account" },
];
const policies = [
  ["Terms", LEGAL_POLICY_LINKS.termsAndConditions],
  ["Privacy", LEGAL_POLICY_LINKS.privacyPolicy],
  ["Shipping", LEGAL_POLICY_LINKS.shippingPolicy],
  ["Returns & refunds", LEGAL_POLICY_LINKS.refundPolicy],
  ["Cancellations", LEGAL_POLICY_LINKS.cancellationPolicy],
  ["Cookies", LEGAL_POLICY_LINKS.cookiePolicy],
  ["Disclaimer", LEGAL_POLICY_LINKS.disclaimer],
];
const footerLink =
  "inline-flex min-h-11 items-center py-2 text-sm text-white/75 underline-offset-4 transition-colors hover:text-white hover:underline motion-reduce:transition-none lg:min-h-8 lg:py-1";

export default function Footer({
  categories = [],
}: {
  categories?: { id: string; name: string }[];
}) {
  const shopLinks = [
    { label: "Shop all", href: "/products" },
    ...categories.map((category) => ({
      label: category.name,
      href: "/products?category=" + encodeURIComponent(category.id),
    })),
    { label: "Shop by occasion", href: "/occasions" },
    { label: "Our story", href: "/about" },
  ];

  return (
    <footer className="rounded-t-[32px] bg-ink pt-6 pb-3 text-white sm:rounded-t-[40px] sm:pt-8 [&_:focus-visible]:outline-white [&_[data-focus-visible]]:outline-white">
      <div className={ui.container}>
        <div className="grid items-stretch gap-3 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,2fr)] lg:gap-4">
          <div
            data-footer-card="brand"
            className="flex min-w-0 flex-col justify-between gap-7 rounded-[24px] border border-white/15 bg-berry p-5 sm:p-6"
          >
            <div>
              <Link href="/" aria-label="Albumo home" className="inline-flex rounded-lg">
                <Image
                  src="/Albumo Text Logo.png"
                  alt="Albumo — Document memories"
                  width={1394}
                  height={558}
                  className="h-auto w-36 brightness-0 invert"
                />
              </Link>
              <p className="mt-4 max-w-64 text-sm leading-6">
                Photo books and keepsakes for the memories that matter.
              </p>
            </div>
            <FooterSocialLinks profiles={socialProfiles} />
          </div>

          <div
            data-footer-card="navigation"
            className="min-w-0 rounded-[24px] border border-white/10 bg-white/5 p-5 sm:p-6"
          >
            <div className="grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-[0.85fr_1fr_1.45fr] sm:gap-x-6">
              <nav aria-label="Shop" className="min-w-0">
                <h2 className="text-sm font-semibold">Shop</h2>
                <ul className="mt-2 grid">
                  {shopLinks.map((link) => (
                    <li key={link.href} className="min-w-0">
                      <Link
                        href={link.href}
                        className={cx(footerLink, "wrap-break-word")}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="min-w-0">
                <nav aria-label="Here to help">
                  <h2 className="text-sm font-semibold">Here to help</h2>
                  <ul className="mt-2 grid">
                    {helpLinks.map((link) => (
                      <li key={link.href}>
                        <Link href={link.href} className={footerLink}>
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
                <details className="group mt-3 border-t border-white/10 pt-1">
                  <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 text-sm font-medium lg:min-h-8 [&::-webkit-details-marker]:hidden">
                    Partners
                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      aria-hidden="true"
                      className="size-4 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none"
                    >
                      <path d="m5 7 5 5 5-5" />
                    </svg>
                  </summary>
                  <nav aria-label="Explore the partner network" className="grid pt-2">
                    <Link href="/partners" className={footerLink}>
                      Partner with us
                    </Link>
                    <Link href="/partners#discover" className={footerLink}>
                      Discover partners
                    </Link>
                    {partnerCategories.map((category) => (
                      <Link
                        key={category.slug}
                        href={"/partners/" + category.slug}
                        className={footerLink}
                      >
                        {category.title}
                      </Link>
                    ))}
                  </nav>
                </details>
              </div>
              <div className="col-span-2 min-w-0 border-t border-white/10 pt-5 sm:col-span-1 sm:border-0 sm:pt-0">
                <section aria-labelledby="footer-contact-title">
                  <h2 id="footer-contact-title" className="text-sm font-semibold">
                    Get in touch
                  </h2>
                  <div className="mt-2 text-white/85 [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center [&_a]:py-2 lg:[&_a]:min-h-8 lg:[&_a]:py-1 [&_button]:min-h-11">
                    <ContactDetails showWhatsApp={false} />
                  </div>
                </section>
                <section aria-labelledby="footer-newsletter-title" className="mt-5">
                  <h2 id="footer-newsletter-title" className="text-sm font-semibold">
                    Newsletter
                  </h2>
                  <div className="mt-3">
                    <NewsletterForm compact tone="inverse" />
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-t border-white/15 py-2 text-xs text-white/75">
          <nav
            aria-label="Policies and privacy"
            className="flex flex-wrap items-center gap-x-4 gap-y-1"
          >
            {policies.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="inline-flex min-h-11 items-center py-2 underline-offset-4 hover:text-white hover:underline lg:min-h-8 lg:py-1"
              >
                {label}
              </Link>
            ))}
            <CookieSettingsButton />
          </nav>
          <p>
            © {new Date().getFullYear()} {LEGAL_ENTITY}.
          </p>
          {/* <a
            href="#main-content"
            className="inline-flex min-h-11 items-center gap-2 py-2 underline-offset-4 hover:text-white hover:underline"
          >
            Back to top <span aria-hidden="true">↑</span>
          </a> */}
        </div>
      </div>
    </footer>
  );
}
