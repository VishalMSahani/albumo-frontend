"use client";
import { Button } from "@/components/base/buttons/button";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Field, FormNotice } from "@/components/forms/FormUI";
import { api, API_BASE_URL, ApiError, errorMessage } from "@/lib/api-client";
import { useResource } from "@/lib/use-resource";
import { ui } from "@/lib/ui";
import { createLegalAcceptance, LEGAL_POLICY_VERSION } from "@/features/legal/constants";
import AuthLayout from "./AuthLayout";
import LegalAcceptance from "./LegalAcceptance";
import { useAuth } from "./AuthProvider";
import { safeRedirect, type AuthResponse, type AuthConfig } from "./types";
import { secondsRemaining } from "./phone";

export type PasswordMode =
  "login" | "register" | "forgot" | "reset" | "verify" | "callback";
const titles: Record<PasswordMode, string> = {
  login: "Welcome back.",
  register: "Make yourself at home.",
  forgot: "A fresh start.",
  reset: "Choose a new password.",
  verify: "Check your email.",
  callback: "Welcome to Albumo.",
};

export default function PasswordAuthScreen({
  initialMode,
  initialIdentifier = "",
  initialPhone = "",
  onUseMobile,
}: {
  initialMode: PasswordMode;
  initialIdentifier?: string;
  initialPhone?: string;
  onUseMobile?: () => void;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const auth = useAuth();
  const [mode, setMode] = useState<PasswordMode>(initialMode);
  const [email, setEmail] = useState(params.get("email") || initialIdentifier);
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(params.get("error") || "");
  const [notice, setNotice] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [token, setToken] = useState("");
  const lock = useRef(false);
  const initialized = useRef(false);
  const config = useResource<AuthConfig>(
    "auth-config",
    () => api.get("/api/auth/config"),
    mode === "login" || mode === "register",
  );
  const destination = safeRedirect(params.get("redirect"));

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const value =
      new URLSearchParams(window.location.hash.slice(1)).get("token") ||
      params.get("token") ||
      "";
    setToken(value);
    if (value) window.history.replaceState(null, "", window.location.pathname);
  }, [params]);

  useEffect(() => {
    if (!resendAt) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [resendAt]);

  useEffect(() => {
    if (mode === "callback" && !auth.loading && auth.user) router.replace(destination);
  }, [mode, auth.loading, auth.user, destination, router]);

  function changeMode(next: PasswordMode) {
    if (lock.current) return;
    setMode(next);
    setError("");
    setNotice("");
    // A phone identifier must not become the email field on signup/recovery.
    if (next !== "login" && !email.includes("@")) setEmail("");
  }

  async function run(action: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await action();
    } catch (failure) {
      setError(errorMessage(failure));
      if (
        failure instanceof ApiError &&
        failure.details &&
        typeof failure.details === "object" &&
        "email" in failure.details &&
        typeof failure.details.email === "string"
      ) {
        setEmail(failure.details.email);
      }
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const password = String(values.get("password") || "");
    await run(async () => {
      if (mode === "register" || mode === "reset") {
        if (password !== values.get("confirmation"))
          throw new Error("Your passwords do not match.");
        if (new TextEncoder().encode(password).length > 72)
          throw new Error("Please use a password of 72 bytes or fewer.");
      }
      if (mode === "login") {
        const result = await api.post<AuthResponse>("/api/auth/login", {
          email: email.trim(),
          password,
          legalConsent: createLegalAcceptance(),
        });
        auth.signIn(result.user);
        router.replace(destination);
      } else if (mode === "register") {
        const result = await api.post<{ email: string }>("/api/auth/signup", {
          name: String(values.get("name") || "").trim(),
          email: email.trim(),
          password,
          ...(initialPhone ? { phone: initialPhone } : {}),
          legalConsent: createLegalAcceptance(),
        });
        setEmail(result.email);
        setMode("verify");
        setNotice(
          "Your account is created. Request an email code below to verify your address.",
        );
      } else if (mode === "forgot") {
        await api.post("/api/auth/forgot-password", { email: email.trim() });
        setNotice(
          "If this email has an eligible account, a password reset link is on its way.",
        );
      } else if (mode === "reset") {
        if (!/^[a-f0-9]{64}$/.test(token))
          throw new Error("Open a valid password reset link from your email.");
        await api.post("/api/auth/reset-password", { token, newPassword: password });
        setToken("");
        setMode("login");
        setNotice("Password updated. You can sign in now.");
      } else if (mode === "verify") {
        if (token)
          await api.get("/api/auth/verify-email?token=" + encodeURIComponent(token));
        else
          await api.post("/api/auth/verify-email", {
            email: email.trim(),
            code: String(values.get("code")),
          });
        setToken("");
        setMode("login");
        setNotice("Email verified. Sign in to continue.");
      }
    });
  }

  function resend() {
    if (secondsRemaining(resendAt, Date.now()) > 0) return;
    void run(async () => {
      await api.post("/api/auth/resend-verification", { email: email.trim() });
      setResendAt(Date.now() + 60_000);
      setNow(Date.now());
      setNotice("If verification is needed, a code will arrive shortly.");
    });
  }

  const seconds = secondsRemaining(resendAt, now);
  const newPassword = mode === "register" || mode === "reset";
  const credentials = mode === "login" || mode === "register";
  const mobileLink = "/login?" + new URLSearchParams({ redirect: destination });

  return (
    <AuthLayout
      title={titles[mode]}
      description={mode === "login" ? "Sign in with your account password." : undefined}
    >
      <div className="grid gap-5">
        <FormNotice error>{error}</FormNotice>
        <FormNotice>{notice}</FormNotice>
        {mode === "callback" ? (
          <>
            <p className="text-sm text-muted">
              {auth.loading
                ? "Checking your session..."
                : auth.user
                  ? "Taking you to your account..."
                  : "We could not complete sign-in. Please try again."}
            </p>
            <FormNotice error>{auth.error}</FormNotice>
            {!auth.loading && !auth.user && (
              <Link href={mobileLink} className={ui.buttonDark}>
                Return to sign in
              </Link>
            )}
          </>
        ) : (
          <form key={mode} onSubmit={submit} aria-busy={busy} className="grid gap-5">
            <fieldset disabled={busy} className="grid gap-5 disabled:opacity-70">
              {mode === "register" && (
                <Field
                  name="name"
                  label="Your name"
                  autoComplete="name"
                  maxLength={100}
                  required
                />
              )}
              {(credentials || mode === "forgot" || (mode === "verify" && !token)) && (
                <Field
                  name="email"
                  label={mode === "login" ? "Email or mobile number" : "Email address"}
                  type={mode === "login" ? "text" : "email"}
                  autoComplete={mode === "login" ? "username" : "email"}
                  value={email}
                  onChange={setEmail}
                  required
                  maxLength={254}
                />
              )}
              {mode === "verify" && !token && (
                <Field
                  name="code"
                  label="Six-digit email code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  minLength={6}
                  required
                />
              )}
              {(mode === "login" || newPassword) && (
                <Field
                  name="password"
                  label={newPassword ? "Create a password" : "Password"}
                  type="password"
                  autoComplete={newPassword ? "new-password" : "current-password"}
                  minLength={newPassword ? 12 : 1}
                  maxLength={72}
                  required
                  hint={newPassword ? "At least 12 characters." : undefined}
                />
              )}
              {newPassword && (
                <Field
                  name="confirmation"
                  label="Confirm password"
                  type="password"
                  autoComplete="new-password"
                  minLength={12}
                  maxLength={72}
                  required
                />
              )}
              {credentials && (
                <LegalAcceptance accepted={accepted} onChange={setAccepted} />
              )}
              <Button type="submit" color="dark" isLoading={busy} className="w-full">
                {busy
                  ? "Please wait..."
                  : mode === "forgot"
                    ? "Send reset link"
                    : mode === "verify"
                      ? "Verify and continue"
                      : mode === "reset"
                        ? "Update password"
                        : "Continue"}
              </Button>
            </fieldset>
          </form>
        )}
        {mode === "verify" && !token && (
          <button
            onClick={resend}
            disabled={busy || seconds > 0 || !email.includes("@")}
            className="min-h-11 text-sm underline disabled:opacity-50"
          >
            {seconds > 0 ? "Request another code in " + seconds + "s" : "Send a new code"}
          </button>
        )}
        {credentials && (
          <>
            {config.data?.google && (
              <button
                disabled={busy || !accepted}
                className={ui.buttonOutline + " disabled:opacity-50"}
                onClick={() => {
                  if (!accepted) return;
                  window.location.assign(
                    API_BASE_URL +
                      "/api/auth/google?" +
                      new URLSearchParams({
                        consentVersion: LEGAL_POLICY_VERSION,
                        redirect: destination,
                      }),
                  );
                }}
              >
                Continue with Google
              </button>
            )}
            <div className="flex flex-wrap justify-between gap-3 text-sm">
              {onUseMobile ? (
                <button
                  disabled={busy}
                  onClick={onUseMobile}
                  className="min-h-11 underline"
                >
                  Use WhatsApp instead
                </button>
              ) : (
                <Link href={mobileLink} className="py-3 underline">
                  Use WhatsApp instead
                </Link>
              )}
              <button
                disabled={busy}
                onClick={() => changeMode(mode === "login" ? "register" : "login")}
                className="min-h-11 underline"
              >
                {mode === "login" ? "Create an account" : "Already have an account?"}
              </button>
            </div>
            {mode === "login" && (
              <div className="flex flex-wrap gap-5 text-sm">
                <button
                  disabled={busy}
                  onClick={() => changeMode("forgot")}
                  className="py-2 underline"
                >
                  Forgot password?
                </button>
                <button
                  disabled={busy}
                  onClick={() => changeMode("verify")}
                  className="py-2 underline"
                >
                  Verify your email
                </button>
              </div>
            )}
          </>
        )}
        {!credentials &&
          mode !== "callback" &&
          (onUseMobile ? (
            <button
              disabled={busy}
              onClick={onUseMobile}
              className="min-h-11 text-sm underline disabled:opacity-50"
            >
              Back to sign in
            </button>
          ) : (
            <Link href={mobileLink} className="py-3 text-center text-sm underline">
              Back to sign in
            </Link>
          ))}
      </div>
    </AuthLayout>
  );
}
