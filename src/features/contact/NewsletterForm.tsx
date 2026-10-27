"use client";
import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { FormNotice, Honeypot } from "@/components/forms/FormFeedback";
import { fieldClass } from "@/components/base/input/styles";
import { ui } from "@/lib/ui";
import { cx } from "@/lib/cx";
import { errorMessage } from "@/lib/api-client";
import { useContact } from "./ContactProvider";
import { newsletterRequest } from "./contact.service";

export default function NewsletterForm({
  compact = false,
  tone = "default",
}: {
  compact?: boolean;
  tone?: "default" | "inverse";
}) {
  const inverse = tone === "inverse";
  const settings = useContact();
  const [mode, setMode] = useState<"subscribe" | "manage">("subscribe");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const lock = useRef(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    const form = new FormData(event.currentTarget);
    try {
      const result = await newsletterRequest(mode, {
        email: String(form.get("email") || "").trim(),
        website: String(form.get("website") || ""),
        ...(mode === "subscribe"
          ? {
              consent: form.get("consent") === "on",
              source: compact ? "FOOTER" : "NEWSLETTER",
            }
          : {}),
      });
      setNotice(
        result.message ||
          (mode === "subscribe"
            ? "You’re subscribed. Thanks for joining us."
            : "Check your email for a link to manage your subscription."),
      );
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  const paused = settings.data?.newsletterEnabled === false && mode === "subscribe";
  return (
    <div className={cx("grid gap-4", compact && "gap-2")}>
      {!compact && (
        <div className="flex flex-wrap gap-5 text-sm">
          {(["subscribe", "manage"] as const).map((value) => (
            <button
              key={value}
              onClick={() => {
                setMode(value);
                setNotice("");
                setError("");
              }}
              aria-pressed={mode === value}
              className="min-h-11 border-b border-transparent aria-pressed:border-berry"
            >
              {value === "subscribe" ? "Join the list" : "Manage my emails"}
            </button>
          ))}
        </div>
      )}
      {paused ? (
        <p className="text-sm">Newsletter sign-ups are paused for now.</p>
      ) : (
        <form
          onSubmit={submit}
          aria-busy={busy}
          className={cx("grid gap-4", compact && "grid-cols-[minmax(0,1fr)_auto] gap-2")}
        >
          <label className="grid min-w-0 gap-2 text-sm font-medium">
            <span className={compact ? "sr-only" : undefined}>Email address</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              maxLength={254}
              required
              placeholder={compact ? "Email address" : undefined}
              className={cx(fieldClass, compact && "min-h-11 px-3 py-2")}
            />
          </label>
          <Honeypot />
          {mode === "subscribe" && (
            <label
              className={cx(
                "flex items-start gap-3 text-sm leading-5",
                compact && "col-span-2 row-start-2 gap-2 text-xs",
              )}
            >
              <input
                name="consent"
                type="checkbox"
                required
                className={cx(
                  "mt-0.5 size-4 shrink-0 accent-berry",
                  inverse && "accent-white",
                )}
              />
              <span>
                I’d like occasional Albumo emails. Unsubscribe anytime.{" "}
                <Link href="/privacy-policy" className="underline">
                  Privacy
                </Link>
              </span>
            </label>
          )}
          <button
            type="submit"
            disabled={busy}
            aria-busy={busy || undefined}
            className={cx(
              compact ? ui.button : ui.buttonDark,
              "w-fit disabled:cursor-wait disabled:opacity-60",
              compact && "col-start-2 row-start-1 min-h-11 w-18 px-3 py-2",
              inverse &&
                "border-white bg-white text-berry hover:border-rose hover:bg-rose",
            )}
          >
            {busy && (
              <span
                aria-hidden="true"
                className="size-4 shrink-0 rounded-full border-2 border-current border-r-transparent motion-safe:animate-spin"
              />
            )}
            {busy ? (
              <span className={compact ? "sr-only" : undefined}>Please wait...</span>
            ) : mode === "subscribe" ? (
              compact ? (
                "Join"
              ) : (
                "Count me in"
              )
            ) : (
              "Send preferences link"
            )}
          </button>
        </form>
      )}
      <FormNotice error className={inverse ? "border-rose bg-rose" : undefined}>
        {error}
      </FormNotice>
      <FormNotice>{notice}</FormNotice>
      {compact && (
        <Link
          href="/newsletter"
          className="inline-flex min-h-11 w-fit items-center py-1 text-xs underline underline-offset-4 lg:min-h-8"
        >
          Manage your emails
        </Link>
      )}
    </div>
  );
}
