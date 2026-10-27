"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/base/buttons/button";
import { Field, FormNotice } from "@/components/forms/FormUI";
import { useAuth } from "@/features/auth/AuthProvider";
import type { User } from "@/features/auth/types";
import { api, errorMessage } from "@/lib/api-client";
import { ui } from "@/lib/ui";
import { cx } from "@/lib/cx";
import { useResource } from "@/lib/use-resource";
import { AccountIcon } from "./AccountIcon";

export default function ProfileDetails({ user }: { user: User }) {
  const auth = useAuth();
  const passwordStatus = useResource("account-security:" + user.id, async () => {
    const metadata = await api.get<User>("/api/auth/me");
    if (typeof metadata.hasPassword !== "boolean")
      throw new Error("We couldn’t load your password settings. Please try again.");
    return metadata.hasPassword;
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const lock = useRef(false);
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current) return;
    const name = String(new FormData(event.currentTarget).get("name") || "").trim();
    if (!name) {
      setError("Please enter your name.");
      return;
    }
    lock.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const updated = await api.patch<User>("/api/auth/me", { name });
      if (!active.current) return;
      auth.updateUser(user.id, updated);
      setNotice("Your name has been updated.");
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <section
        aria-labelledby="profile-details-title"
        className={cx(ui.card, "p-5 sm:p-7")}
      >
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-rose text-berry">
            <AccountIcon name="profile" />
          </span>
          <div>
            <h2
              id="profile-details-title"
              className="text-xl font-medium tracking-[-0.035em] sm:text-2xl"
            >
              Profile
            </h2>
          </div>
        </div>
        <form onSubmit={save} className="mt-6 grid gap-5">
          <Field
            label="Name"
            name="name"
            defaultValue={user.name || ""}
            maxLength={100}
            autoComplete="name"
            required
            disabled={busy}
            className="max-w-xl"
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Email address"
              name="email"
              type="email"
              value={user.email}
              autoComplete="email"
              readOnly
              hint="Your sign-in email. Contact us if it needs to change."
            />
            <Field
              label="WhatsApp number"
              name="phone"
              type="tel"
              value={user.phone || ""}
              placeholder="No number linked"
              autoComplete="tel"
              readOnly
              hint="Delivery phone numbers are saved in your address book."
            />
          </div>
          <FormNotice error>{error}</FormNotice>
          <FormNotice>{notice}</FormNotice>
          <div className="flex justify-end border-t border-line pt-5">
            <Button type="submit" color="dark" isLoading={busy}>
              {busy ? "Saving..." : "Save details"}
            </Button>
          </div>
        </form>
      </section>
      <section
        aria-labelledby="account-security-title"
        className={cx(ui.card, "p-5 sm:p-7")}
      >
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sage text-ink">
            <AccountIcon name="lock" />
          </span>
          <div>
            <h2
              id="account-security-title"
              className="text-xl font-medium tracking-[-0.035em] sm:text-2xl"
            >
              Sign-in & security
            </h2>
          </div>
        </div>
        <div className="mt-5 divide-y divide-line">
          <div className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div>
              <p className="text-sm font-medium">Email verification</p>
              <p className="mt-1 text-sm break-all text-muted">{user.email}</p>
            </div>
            {user.emailVerified ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sage px-3 py-1 text-xs">
                <AccountIcon name="check" className="size-3.5" />
                Verified
              </span>
            ) : (
              <Link
                href={"/verify-email?email=" + encodeURIComponent(user.email)}
                className={cx(ui.buttonOutline, "min-h-11 px-4 py-2")}
              >
                Verify email
              </Link>
            )}
          </div>
          {user.phone && (
            <div className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="text-sm font-medium">WhatsApp sign-in</p>
                <p className="mt-1 text-sm text-muted">{user.phone}</p>
              </div>
              <span
                className={cx(
                  "rounded-full px-3 py-1 text-xs",
                  user.phoneVerified ? "bg-sage" : "bg-sand",
                )}
              >
                {user.phoneVerified ? "Verified" : "Not verified"}
              </span>
            </div>
          )}
          {passwordStatus.loading ? (
            <p role="status" className="py-4 text-sm text-muted">
              Checking your password settings...
            </p>
          ) : passwordStatus.error ? (
            <div className="space-y-3 py-4">
              <FormNotice error>{passwordStatus.error}</FormNotice>
              <Button color="secondary" onPress={passwordStatus.reload}>
                Try again
              </Button>
            </div>
          ) : (
            <PasswordSettings
              user={user}
              existingPassword={passwordStatus.data === true}
            />
          )}
        </div>
      </section>
      <section
        aria-labelledby="account-preferences-title"
        className={cx(ui.card, "p-5 sm:p-7")}
      >
        <h2
          id="account-preferences-title"
          className="text-xl font-medium tracking-[-0.035em] sm:text-2xl"
        >
          Preferences
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link
            href="/newsletter"
            className="group flex min-h-16 items-center justify-between gap-3 rounded-2xl bg-rose/50 px-5 py-4"
          >
            <span className="text-sm font-medium">Email preferences</span>
            <AccountIcon
              name="arrow"
              className="size-4 shrink-0 transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
            />
          </Link>
          <Link
            href="/privacy-policy"
            className="group flex min-h-16 items-center justify-between gap-3 rounded-2xl bg-surface px-5 py-4"
          >
            <span className="text-sm font-medium">Privacy & your data</span>
            <AccountIcon
              name="arrow"
              className="size-4 shrink-0 transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
            />
          </Link>
        </div>
      </section>
    </div>
  );
}

function PasswordSettings({
  user,
  existingPassword,
}: {
  user: User;
  existingPassword: boolean;
}) {
  const auth = useAuth();
  const [addedPassword, setAddedPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const lock = useRef(false);
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  const hasPassword = existingPassword || addedPassword;

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    const newPassword = String(values.get("newPassword") || "");
    setError("");
    setNotice("");
    if (newPassword !== values.get("confirmation")) {
      setError("Your new passwords do not match.");
      return;
    }
    if (new TextEncoder().encode(newPassword).length > 72) {
      setError("Please use a password of 72 bytes or fewer.");
      return;
    }
    lock.current = true;
    setBusy(true);
    try {
      await api.post("/api/auth/password", {
        newPassword,
        ...(hasPassword
          ? { currentPassword: String(values.get("currentPassword") || "") }
          : {}),
      });
      if (!active.current) return;
      form.reset();
      setAddedPassword(true);
      auth.updateUser(user.id, { hasPassword: true });
      setNotice("Your password is saved. Other sessions have been signed out.");
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  return (
    <details className="group py-4">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 text-sm [&::-webkit-details-marker]:hidden">
        <span>
          <span className="block font-medium">
            {hasPassword ? "Password" : "Backup password"}
          </span>
        </span>
        <span className="flex items-center gap-2 text-berry">
          <span className="group-open:hidden">{hasPassword ? "Change" : "Add"}</span>
          <span className="hidden group-open:inline">Close</span>
          <span aria-hidden="true" className="text-lg group-open:rotate-45">
            +
          </span>
        </span>
      </summary>
      <form
        onSubmit={save}
        className="mt-5 grid max-w-xl gap-4 rounded-2xl bg-surface p-5"
      >
        {!hasPassword && (
          <p className="text-sm text-muted">
            For your security, sign in with WhatsApp within the last 10 minutes before
            adding a backup password.
          </p>
        )}
        {hasPassword && (
          <Field
            label="Current password"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            maxLength={72}
            required
            disabled={busy}
          />
        )}
        <Field
          label="New password"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={12}
          maxLength={72}
          hint="At least 12 characters; no more than 72 bytes."
          required
          disabled={busy}
        />
        <Field
          label="Confirm new password"
          name="confirmation"
          type="password"
          autoComplete="new-password"
          minLength={12}
          maxLength={72}
          required
          disabled={busy}
        />
        <p className="text-xs text-muted">
          Saving a password signs out your other sessions. This session stays signed in.
        </p>
        <FormNotice error>{error}</FormNotice>
        <FormNotice>{notice}</FormNotice>
        <Button
          type="submit"
          color="dark"
          isLoading={busy}
          className="justify-self-start"
        >
          {busy ? "Saving..." : "Save password"}
        </Button>
        <Link
          href={"/forgot-password?email=" + encodeURIComponent(user.email)}
          className="inline-flex min-h-11 items-center justify-self-start text-sm text-muted underline underline-offset-4 hover:text-berry"
        >
          Forgot your current password?
        </Link>
      </form>
    </details>
  );
}
