"use client";

import Image from "@/components/CdnImage";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/base/buttons/button";
import { useAuth } from "@/features/auth/AuthProvider";
import { ui } from "@/lib/ui";
import { cx } from "@/lib/cx";

const links = [
  { label: "Shop all", href: "/products" },
  { label: "By occasion", href: "/occasions" },
  { label: "Partners", href: "/partners" },
  { label: "Our story", href: "/about" },
  { label: "Help centre", href: "/help" },
  { label: "Cart", href: "/cart" },
];

type Props = { categories?: { id: string; name: string }[] };

export default function Navbar({ categories = [] }: Props) {
  const pathname = usePathname();
  // Reset the disclosure on route changes, including back/forward navigation.
  return <Navigation key={pathname} pathname={pathname} categories={categories} />;
}

function Navigation({ pathname, categories = [] }: Props & { pathname: string }) {
  const { user, loading } = useAuth();
  const profileName = user?.name?.trim() || "";
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);
  const scrollMarker = useRef<HTMLSpanElement>(null);
  const mobileNavigation = useRef<HTMLElement>(null);

  useEffect(() => {
    const marker = scrollMarker.current;
    if (!marker || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (header.current) header.current.dataset.scrolled = String(!entry.isIntersecting);
    });
    observer.observe(marker);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!menuOpen || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const animation = mobileNavigation.current?.animate(
      [
        { opacity: 0, transform: "translateY(-10px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 280, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
    );
    return () => animation?.cancel();
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    const closeOutside = (event: Event) => {
      if (event.target instanceof Node && !header.current?.contains(event.target))
        setMenuOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 1100px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("focusin", closeOutside);
    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("focusin", closeOutside);
      desktop.removeEventListener("change", closeOnDesktop);
    };
  }, [menuOpen]);

  const active = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <span
        ref={scrollMarker}
        aria-hidden="true"
        className="pointer-events-none -mb-px block h-px"
      />
      <header
        ref={header}
        className="group pointer-events-none sticky top-0 z-30 px-3 py-3 sm:px-8 sm:py-4"
      >
        <div className="pointer-events-auto relative mx-auto max-w-7xl rounded-full border border-line/70 bg-white p-1.5 shadow-[0_8px_32px_-16px_#3a2e2a30,inset_0_1px_0_#ffffff] transition-[transform,background-color,box-shadow] duration-500 ease-out group-data-[scrolled=true]:translate-y-1 group-data-[scrolled=true]:shadow-[0_12px_40px_-12px_#3a2e2a35,inset_0_1px_0_#ffffff] supports-backdrop-filter:bg-white/75 supports-backdrop-filter:backdrop-blur-2xl supports-backdrop-filter:backdrop-saturate-150 motion-reduce:transition-none sm:p-2">
          <div className="flex min-h-12 items-center justify-between gap-2 pr-1 pl-3 sm:gap-4 sm:pl-5">
            <Link
              href="/"
              aria-label="Albumo home"
              onClick={() => setMenuOpen(false)}
              className="shrink-0 rounded-lg"
            >
              <Image
                src="/Albumo Text Logo.png"
                alt="Albumo — Document memories"
                width={1394}
                height={558}
                className="h-auto w-24 sm:w-28"
                preload
              />
            </Link>
            <nav
              aria-label="Main navigation"
              className="hidden items-center gap-1 text-sm font-medium min-[1100px]:flex"
            >
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active(link.href) ? "page" : undefined}
                  data-active={active(link.href)}
                  className="inline-flex min-h-11 items-center rounded-full px-3.5 transition-colors duration-200 hover:bg-rose/70 hover:text-berry data-[active=true]:bg-rose data-[active=true]:text-berry motion-reduce:transition-none"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex shrink-0 items-center gap-1 sm:gap-3">
              {loading ? (
                <span
                  data-account-loading
                  aria-hidden="true"
                  className="h-11 w-20 rounded-full bg-surface"
                />
              ) : user ? (
                <Link
                  href="/account"
                  onClick={() => setMenuOpen(false)}
                  aria-label={profileName ? "Profile: " + profileName : "Profile"}
                  aria-current={active("/account") ? "page" : undefined}
                  title={profileName || undefined}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-berry/30 px-3 text-sm font-medium whitespace-nowrap transition-colors hover:bg-rose/70 hover:text-berry motion-reduce:transition-none"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="hidden size-4 shrink-0 sm:block"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="8" r="3.25" />
                    <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
                  </svg>
                  <span className="flex min-w-0 flex-col text-left">
                    <span
                      className={
                        profileName ? "text-[11px] leading-4 text-muted" : undefined
                      }
                    >
                      Profile
                    </span>
                    {profileName && (
                      <span className="max-w-14 truncate text-xs leading-4 min-[360px]:max-w-20 sm:max-w-24 sm:text-sm sm:leading-5">
                        {profileName}
                      </span>
                    )}
                  </span>
                </Link>
              ) : (
                <Link
                  href="/login?redirect=/account"
                  onClick={() => setMenuOpen(false)}
                  className={cx(ui.buttonDark, "min-h-11 px-4 py-2")}
                >
                  Sign in
                </Link>
              )}
              <div className="hidden min-[1100px]:block">
                <Link href="/products" className={cx(ui.button, "rounded-full px-5")}>
                  Find your photo book <span aria-hidden="true">↗</span>
                </Link>
              </div>
              <Button
                ref={menuButton}
                color="tertiary"
                className="min-h-11 rounded-full px-3 text-sm min-[1100px]:hidden"
                aria-expanded={menuOpen}
                aria-controls="mobile-navigation"
                onPress={() => setMenuOpen(!menuOpen)}
              >
                <span className="flex items-center gap-2">
                  {menuOpen ? "Close" : "Menu"}
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="size-4"
                    aria-hidden="true"
                  >
                    <path d={menuOpen ? "m5 5 10 10M15 5 5 15" : "M3 7h14M3 13h14"} />
                  </svg>
                </span>
              </Button>
            </div>
          </div>
          <nav
            ref={mobileNavigation}
            id="mobile-navigation"
            aria-label="Mobile navigation"
            hidden={!menuOpen}
            className="absolute top-[calc(100%+10px)] right-0 left-0 max-h-[calc(100dvh-150px)] overflow-y-auto overscroll-contain rounded-3xl border border-line bg-white p-5 shadow-[0_20px_60px_-20px_#3a2e2a40] supports-backdrop-filter:bg-white/95 supports-backdrop-filter:backdrop-blur-2xl min-[1100px]:hidden sm:p-7"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active(link.href) ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
                className="flex min-h-13 items-center justify-between border-b border-line text-base font-medium hover:text-berry aria-[current=page]:text-berry"
              >
                {link.label}
                <span aria-hidden="true">↗</span>
              </Link>
            ))}
            {categories.length > 0 && (
              <>
                <p className="mt-6 mb-3 text-xs font-semibold tracking-widest text-muted uppercase">
                  Shop by category
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/products?category=${category.id}`}
                      onClick={() => setMenuOpen(false)}
                      className="flex min-h-12 items-center rounded-xl bg-surface px-3 py-2 text-sm hover:text-berry"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </>
            )}
            <Link
              href="/products"
              onClick={() => setMenuOpen(false)}
              className={cx(ui.button, "mt-5 w-full rounded-full")}
            >
              Explore photo books <span aria-hidden="true">↗</span>
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
