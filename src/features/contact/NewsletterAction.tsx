"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FormNotice } from "@/components/forms/FormUI";
import { errorMessage } from "@/lib/api-client";
import { ui } from "@/lib/ui";
import { newsletterRequest } from "./contact.service";
export default function NewsletterAction({
  action,
}: {
  action: "confirm" | "unsubscribe";
}) {
  const [token, setToken] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    setToken(new URLSearchParams(window.location.hash.slice(1)).get("token") || "");
    window.history.replaceState(null, "", window.location.pathname);
    setReady(true);
  }, []);
  async function apply() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await newsletterRequest(action, { token });
      setDone(true);
      setToken("");
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section data-reveal className={ui.container + " py-16 sm:py-24"}>
      <div className="mx-auto max-w-lg space-y-6 rounded-[28px] border border-line/80 bg-white p-7 shadow-[0_16px_50px_-36px_#3a2e2a35] sm:p-10">
        <span className={ui.eyebrow}>Letters from Albumo</span>
        <h1 className={ui.heading}>
          {done
            ? action === "confirm"
              ? "You’re on the list."
              : "All taken care of."
            : action === "confirm"
              ? "A little inspiration?"
              : "Time for fewer emails?"}
        </h1>
        <p role="status" className="text-sm text-muted">
          {done
            ? action === "confirm"
              ? "Thanks for confirming your subscription."
              : "You’re unsubscribed from our newsletter. Order and support updates are unaffected."
            : "Your preferences only change when you confirm below."}
        </p>
        <FormNotice error>{error}</FormNotice>
        {ready &&
          !done &&
          (/^[a-f0-9]{64}$/.test(token) ? (
            <button
              onClick={() => void apply()}
              disabled={busy}
              className={ui.buttonDark + " disabled:opacity-60"}
            >
              {busy
                ? "Updating..."
                : action === "confirm"
                  ? "Confirm subscription"
                  : "Unsubscribe"}
            </button>
          ) : (
            <p className="text-sm">
              Open the link in your email, or request a fresh link.
            </p>
          ))}
        <Link href="/newsletter" className="block py-2 text-sm underline">
          Newsletter preferences
        </Link>
      </div>
    </section>
  );
}
