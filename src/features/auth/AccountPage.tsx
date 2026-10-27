"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { Button } from "@/components/base/buttons/button";
import { FormNotice } from "@/components/forms/FormUI";
import { AccountIcon, type AccountIconName } from "@/features/account/AccountIcon";
import { AlbumsPanel, OrdersPanel } from "@/features/account/AccountCollections";
import AddressBook from "@/features/account/AddressBook";
import ProfileDetails from "@/features/account/ProfileDetails";
import { errorMessage } from "@/lib/api-client";
import { cx } from "@/lib/cx";
import { ui } from "@/lib/ui";
import { useAuth } from "./AuthProvider";
import type { User } from "./types";

const sections = [
  { id: "profile", label: "Profile", icon: "profile" },
  { id: "orders", label: "Orders", icon: "orders" },
  { id: "albums", label: "Albums & projects", icon: "albums" },
  { id: "addresses", label: "Address book", icon: "addresses" },
] as const satisfies readonly { id: string; label: string; icon: AccountIconName }[];
type Section = (typeof sections)[number]["id"];

export default function AccountPage() {
  return (
    <Suspense fallback={<AccountLoading />}>
      <AccountScreen />
    </Suspense>
  );
}

function AccountLoading() {
  return (
    <section className={ui.container + " py-16"}>
      <h1 className="text-4xl font-medium tracking-[-0.045em]">Your account</h1>
      <p role="status" className="mt-8 text-sm text-muted">
        Checking your account...
      </p>
    </section>
  );
}

function AccountScreen() {
  const auth = useAuth();
  const params = useSearchParams();
  const selected = sections.find((section) => section.id === params.get("tab"));
  const active: Section = selected?.id || "profile";
  const redirect = selected ? encodeURIComponent("/account?tab=" + active) : "/account";

  return (
    <section className="relative isolate overflow-clip bg-surface/70 pt-7 pb-16 sm:pt-10 sm:pb-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 right-0 -z-10 size-140 rounded-full bg-rose/80 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-110 -left-60 -z-10 size-140 rounded-full bg-sage/80 blur-3xl"
      />
      <div className={ui.container}>
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <nav
              aria-label="Breadcrumb"
              className="mb-4 flex items-center gap-2 text-xs text-muted"
            >
              <Link href="/" className="hover:text-berry">
                Home
              </Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">Your account</span>
            </nav>
            <h1 className="text-[clamp(32px,4vw,46px)] leading-[1.12] font-medium tracking-[-0.05em]">
              Your account
            </h1>
          </div>
          {auth.user && (
            <Link
              href="/products"
              className={cx(
                ui.buttonOutline,
                "hidden border-white bg-white/80 px-5 shadow-sm supports-backdrop-filter:backdrop-blur-lg lg:inline-flex",
              )}
            >
              Make a photo book <span aria-hidden="true">↗</span>
            </Link>
          )}
        </div>
        {auth.loading ? (
          <div role="status" className={cx(ui.glass, "mt-8 p-7 text-sm text-muted")}>
            Checking your account...
          </div>
        ) : !auth.user ? (
          <div className={cx(ui.glass, "mt-8 max-w-2xl p-7 sm:p-10")}>
            <h2 className="text-3xl leading-tight font-medium tracking-[-0.04em]">
              Sign in to your account
            </h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-muted">
              Access your profile, orders, addresses and saved albums.
            </p>
            <div className="mt-5">
              <FormNotice error>{auth.error}</FormNotice>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href={"/login?redirect=" + redirect} className={ui.buttonDark}>
                Sign in <span aria-hidden="true">→</span>
              </Link>
              <Link href={"/register?redirect=" + redirect} className={ui.buttonOutline}>
                Create an account
              </Link>
              {auth.error && (
                <Button color="tertiary" onPress={() => void auth.restore()}>
                  Try again
                </Button>
              )}
            </div>
          </div>
        ) : (
          <AccountWorkspace
            key={auth.user.id}
            user={auth.user}
            active={active}
            sectionSelected={!!selected}
          />
        )}
      </div>
    </section>
  );
}

function AccountWorkspace({
  user,
  active,
  sectionSelected,
}: {
  user: User;
  active: Section;
  sectionSelected: boolean;
}) {
  const auth = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");
  const signOutLock = useRef(false);
  const panel = useRef<HTMLDivElement>(null);
  const menu = useRef<HTMLElement>(null);
  const previous = useRef<Section | null>(sectionSelected ? active : null);
  const initials = (
    user.name
      ?.trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("") ||
    user.email[0] ||
    "A"
  ).toUpperCase();

  useEffect(() => {
    const selected = sectionSelected ? active : null;
    if (previous.current === selected) return;
    const lastSection = previous.current;
    previous.current = selected;
    const mobile = window.matchMedia("(max-width: 1023px)").matches;
    if (!sectionSelected && mobile) {
      menu.current
        ?.querySelector<HTMLAnchorElement>(
          `a[href="/account?tab=${lastSection || active}"]`,
        )
        ?.focus();
    } else {
      panel.current?.focus({ preventScroll: true });
      if (mobile) panel.current?.scrollIntoView({ block: "start", behavior: "instant" });
    }
  }, [active, sectionSelected]);

  async function signOut() {
    if (signOutLock.current) return;
    signOutLock.current = true;
    setSigningOut(true);
    setError("");
    try {
      await auth.signOut();
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      signOutLock.current = false;
      setSigningOut(false);
    }
  }

  return (
    <div className="mt-8 grid items-start gap-5 lg:mt-10 lg:grid-cols-[256px_minmax(0,1fr)] lg:gap-7">
      <aside
        aria-label="Account navigation"
        className={cx(
          ui.glass,
          "min-w-0 overflow-hidden p-4 supports-backdrop-filter:backdrop-saturate-150 lg:sticky lg:top-28 lg:p-5",
          sectionSelected && "hidden lg:block",
        )}
      >
        <div className="flex min-w-0 items-center gap-4 px-1 pb-4 lg:flex-col lg:gap-3 lg:pt-3 lg:pb-6 lg:text-center">
          <span
            aria-hidden="true"
            className="flex size-14 shrink-0 items-center justify-center rounded-full border-[3px] border-white bg-linear-to-br from-rose to-sand text-lg font-medium tracking-tight text-berry shadow-sm lg:size-20 lg:text-2xl"
          >
            {initials}
          </span>
          <div className="min-w-0">
            <p className="text-lg leading-6 font-medium tracking-[-0.025em] break-words">
              {user.name || "Your Albumo account"}
            </p>
            <p className="mt-1 text-xs break-all text-muted">{user.email}</p>
          </div>
        </div>
        <nav
          ref={menu}
          aria-label="Your account"
          className="flex flex-col gap-1 border-t border-line/70 pt-3 lg:pt-4"
        >
          {sections.map((section) => (
            <Link
              key={section.id}
              href={"/account?tab=" + section.id}
              scroll={false}
              aria-current={active === section.id ? "page" : undefined}
              className={cx(
                "inline-flex min-h-12 w-full items-center gap-3 rounded-2xl px-4 text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-berry motion-reduce:transition-none",
                active === section.id && sectionSelected
                  ? "bg-white text-berry shadow-[0_2px_12px_-4px_var(--color-line)] ring-1 ring-line/60"
                  : "text-muted hover:bg-white/70 hover:text-ink",
                active === section.id &&
                  !sectionSelected &&
                  "lg:bg-white lg:text-berry lg:shadow-[0_2px_12px_-4px_var(--color-line)] lg:ring-1 lg:ring-line/60",
              )}
            >
              <AccountIcon name={section.icon} className="size-[18px] shrink-0" />
              {section.label}
              <AccountIcon name="arrow" className="ml-auto size-4 shrink-0 lg:hidden" />
              {active === section.id && (
                <span
                  aria-hidden="true"
                  className="ml-auto hidden size-1.5 rounded-full bg-berry lg:block"
                />
              )}
            </Link>
          ))}
        </nav>
        <div className="mt-4 border-t border-line/70 pt-2">
          <Link
            href="/support/tickets"
            className="flex min-h-11 items-center gap-3 rounded-2xl px-4 text-xs text-muted hover:text-berry"
          >
            <AccountIcon name="help" className="size-4" />
            Support tickets
          </Link>
          <Link
            href="/help"
            className="flex min-h-11 items-center gap-3 rounded-2xl px-4 text-xs text-muted hover:text-berry"
          >
            <AccountIcon name="help" className="size-4" />
            Help centre
          </Link>
          <Button
            color="tertiary"
            isLoading={signingOut}
            onPress={() => void signOut()}
            className="w-full justify-start px-4 text-xs text-muted"
          >
            <span className="flex items-center gap-3">
              <AccountIcon name="logout" className="size-4" />
              {signingOut ? "Signing out..." : "Sign out"}
            </span>
          </Button>
        </div>
        <FormNotice error>{error}</FormNotice>
      </aside>
      <div
        id="account-panel"
        ref={panel}
        role="region"
        tabIndex={-1}
        aria-label={sections.find((section) => section.id === active)?.label}
        className={cx(
          "min-w-0 scroll-mt-28 rounded-[28px] outline-none",
          !sectionSelected && "hidden lg:block",
        )}
      >
        <Link
          href="/account"
          scroll={false}
          className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-full px-2 text-sm font-medium text-muted hover:text-berry focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-berry lg:hidden"
        >
          <AccountIcon name="arrow" className="size-4 rotate-180" />
          Back to account
        </Link>
        {active === "profile" && <ProfileDetails user={user} />}
        {active === "orders" && <OrdersPanel userId={user.id} />}
        {active === "albums" && <AlbumsPanel userId={user.id} />}
        {active === "addresses" && <AddressBook userId={user.id} />}
      </div>
    </div>
  );
}
