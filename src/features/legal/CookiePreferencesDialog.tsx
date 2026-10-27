"use client";

import Link from "next/link";
import { Heading } from "react-aria-components";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Button } from "@/components/base/buttons/button";
import type { CookiePreferences } from "./CookieConsent";

const choices = [
  {
    key: "essential",
    label: "Essential",
    description: "Sign-in, security, and remembering your consent.",
  },
  {
    key: "preferences",
    label: "Preferences",
    description: "Optional settings that make the site feel familiar.",
  },
  {
    key: "analytics",
    label: "Analytics",
    description: "Help us understand how people use Albumo.",
  },
  {
    key: "marketing",
    label: "Marketing",
    description: "Optional advertising and campaign measurement.",
  },
] as const;

type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  preferences: CookiePreferences;
  onChange: (preferences: CookiePreferences) => void;
  onSave: () => void;
  busy: boolean;
  notice: string;
};

export default function CookiePreferencesDialog({
  isOpen,
  onOpenChange,
  preferences,
  onChange,
  onSave,
  busy,
  notice,
}: Props) {
  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable={!busy}
      isKeyboardDismissDisabled={busy}
    >
      <Modal>
        <Dialog>
          <div className="flex items-start justify-between gap-4">
            <Heading slot="title" className="font-display text-3xl leading-tight">
              Your cookie choices.
            </Heading>
            <Button
              color="tertiary"
              autoFocus
              isDisabled={busy}
              onPress={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
          <p className="mt-4 text-base text-muted">
            Choose what you&apos;re comfortable with. You can change this anytime.
          </p>
          <div className="my-6 divide-y divide-line">
            {choices.map(({ key, label, description }) => (
              <label key={key} className="flex cursor-pointer gap-4 py-4">
                <input
                  name={key}
                  type="checkbox"
                  checked={preferences[key]}
                  disabled={key === "essential" || busy}
                  onChange={(event) =>
                    onChange({ ...preferences, [key]: event.target.checked })
                  }
                  className="mt-1 size-5 shrink-0 accent-berry disabled:cursor-not-allowed"
                />
                <span>
                  <span className="text-sm font-semibold">{label}</span>
                  <span className="mt-1 block text-sm leading-6 text-muted">
                    {description}
                  </span>
                </span>
              </label>
            ))}
          </div>
          <Button color="dark" isLoading={busy} onPress={onSave} className="w-full">
            {busy ? "Saving..." : "Save my choices"}
          </Button>
          {notice && (
            <p role="status" className="mt-4 text-sm">
              {notice}
            </p>
          )}
          <Link href="/cookie-policy" className="mt-4 block py-2 text-sm underline">
            Read the cookie policy
          </Link>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
