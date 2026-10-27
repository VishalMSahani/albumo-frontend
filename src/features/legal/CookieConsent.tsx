"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api-client";
import { ui } from "@/lib/ui";
import { LEGAL_POLICY_VERSION } from "./constants";

export type CookiePreferences = {
  essential: true;
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
};
type StoredConsent = {
  version: string;
  preferences: CookiePreferences;
  pending: boolean;
  source: "COOKIE_BANNER" | "COOKIE_SETTINGS";
};
const CookiePreferencesDialog = dynamic(() => import("./CookiePreferencesDialog"), {
  loading: () => (
    <p
      role="status"
      className="fixed bottom-4 left-4 z-50 rounded-md border border-line bg-white px-4 py-3 text-sm shadow-sm"
    >
      Opening cookie settings...
    </p>
  ),
});
const storageKey = "albumo-cookie-preferences";
const essential: CookiePreferences = {
  essential: true,
  preferences: false,
  analytics: false,
  marketing: false,
};
export function openCookieSettings() {
  window.dispatchEvent(new Event("albumo-cookie-settings"));
}
function writeStored(record: StoredConsent) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(record));
  } catch {
    /* This browser may block persistence. */
  }
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(essential);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const current = useRef<StoredConsent | null>(null);
  const syncQueue = useRef<Promise<boolean>>(Promise.resolve(true));

  function sync(record: StoredConsent): Promise<boolean> {
    // Send choices in order, including when a previously offline choice is retrying.
    const request = syncQueue.current.then(async () => {
      try {
        await api.post("/api/legal/consents/cookies", {
          preferences: record.preferences,
          source: record.source,
        });
        if (current.current === record) {
          record.pending = false;
          writeStored(record);
        }
        return true;
      } catch {
        return false;
      }
    });
    syncQueue.current = request;
    return request;
  }
  // Consent is hydrated from browser storage after SSR, then synchronized on events.
  /* eslint-disable react-hooks/set-state-in-effect -- Browser-only persistence hydration. */
  useEffect(() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem(storageKey) || "null",
      ) as StoredConsent | null;
      if (
        stored?.version === LEGAL_POLICY_VERSION &&
        stored.preferences?.essential === true
      ) {
        const values = stored.preferences;
        stored.preferences = {
          essential: true,
          preferences: values.preferences === true,
          analytics: values.analytics === true,
          marketing: values.marketing === true,
        };
        current.current = stored;
        setPreferences(stored.preferences);
        if (stored.pending) void sync(stored);
      } else setVisible(true);
    } catch {
      setVisible(true);
    }
    const open = () => {
      setNotice("");
      setDialogOpen(true);
    };
    const online = () => {
      if (current.current?.pending) void sync(current.current);
    };
    window.addEventListener("albumo-cookie-settings", open);
    window.addEventListener("online", online);
    return () => {
      window.removeEventListener("albumo-cookie-settings", open);
      window.removeEventListener("online", online);
    };
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */
  async function save(values: CookiePreferences, source: StoredConsent["source"]) {
    if (busy) return;
    setBusy(true);
    const record: StoredConsent = {
      version: LEGAL_POLICY_VERSION,
      preferences: values,
      pending: true,
      source,
    };
    current.current = record;
    setPreferences(values);
    writeStored(record);
    window.dispatchEvent(new CustomEvent("albumo-cookie-choice", { detail: values }));
    setVisible(false);
    const recorded = await sync(record);
    setNotice(
      recorded
        ? "Your preferences have been saved."
        : "Saved on this device. We’ll try to sync your choice when the service is available.",
    );
    setBusy(false);
  }
  return (
    <>
      {visible && (
        <section
          aria-label="Cookie preferences"
          className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-5xl rounded-sm border border-line bg-paper p-5 shadow-lg sm:p-6"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <h2 className="font-display text-xl">A little choice is a good thing.</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                Essential cookies keep Albumo working. Optional cookies stay off until you
                choose.{" "}
                <Link href="/cookie-policy" className="underline">
                  About cookies
                </Link>
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                disabled={busy}
                onClick={() => void save(essential, "COOKIE_BANNER")}
                className={ui.buttonDark + " min-h-11 px-4 text-sm disabled:opacity-60"}
              >
                Essential only
              </button>
              <button
                disabled={busy}
                onClick={() =>
                  void save(
                    {
                      essential: true,
                      preferences: true,
                      analytics: true,
                      marketing: true,
                    },
                    "COOKIE_BANNER",
                  )
                }
                className={
                  ui.buttonOutline + " min-h-11 px-4 text-sm disabled:opacity-60"
                }
              >
                Accept all
              </button>
              <button
                onClick={openCookieSettings}
                className="min-h-11 px-2 text-sm underline"
              >
                Choose
              </button>
            </div>
          </div>
        </section>
      )}
      {dialogOpen && (
        <CookiePreferencesDialog
          isOpen={dialogOpen}
          onOpenChange={setDialogOpen}
          preferences={preferences}
          onChange={setPreferences}
          onSave={() => void save(preferences, "COOKIE_SETTINGS")}
          busy={busy}
          notice={notice}
        />
      )}
    </>
  );
}
export function CookieSettingsButton() {
  return (
    <button
      onClick={openCookieSettings}
      className="min-h-11 text-sm underline-offset-4 hover:underline"
    >
      Cookie settings
    </button>
  );
}
