"use client";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Field, FormNotice } from "@/components/forms/FormUI";
import { api, ApiError, errorMessage } from "@/lib/api-client";
import { useResource } from "@/lib/use-resource";
import { createLegalAcceptance } from "@/features/legal/constants";
import AuthLayout from "./AuthLayout";
import LegalAcceptance from "./LegalAcceptance";
import PasswordAuthScreen from "./PasswordAuthScreen";
import { useAuth } from "./AuthProvider";
import { safeRedirect, type AuthConfig, type AuthResponse } from "./types";
import {
  indianPhone,
  normalizeMobileInput,
  secondsRemaining,
  type PhoneAuthStart,
  type PhoneChallenge,
} from "./phone";

type Step = "number" | "code" | "details";
const headings: Record<Step, string> = {
  number: "Welcome to Albumo.",
  code: "Check your WhatsApp.",
  details: "Make yourself at home.",
};

export default function MobileAuthScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const auth = useAuth();
  const [step, setStep] = useState<Step>("number");
  const [passwordMode, setPasswordMode] = useState<"login" | "register" | null>(null);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [challenge, setChallenge] = useState<PhoneChallenge | null>(null);
  const [registrationToken, setRegistrationToken] = useState("");
  const [resendAt, setResendAt] = useState(0);
  const [expiresAt, setExpiresAt] = useState(0);
  const [now, setNow] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(params.get("error") || "");
  const [notice, setNotice] = useState("");
  const lock = useRef(false);
  const codeInput = useRef<HTMLInputElement>(null);
  const config = useResource<AuthConfig>("auth-config", () =>
    api.get("/api/auth/config"),
  );
  const destination = safeRedirect(params.get("redirect"));
  const seconds = secondsRemaining(resendAt, now);
  const expired = step === "code" && expiresAt > 0 && now >= expiresAt;
  const unavailable = config.data?.whatsappOtp === false;

  useEffect(() => {
    if (step !== "code" || passwordMode) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [step, passwordMode]);

  useEffect(() => {
    if (step === "code" && !busy && !passwordMode) codeInput.current?.focus();
  }, [step, busy, passwordMode]);

  function resetNumber() {
    if (lock.current) return;
    setStep("number");
    setPasswordMode(null);
    setChallenge(null);
    setRegistrationToken("");
    setCode("");
    setError("");
    setNotice("");
  }

  function openPassword(mode: "login" | "register" = "login") {
    if (lock.current) return;
    setRegistrationToken("");
    setPasswordMode(mode);
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
      if (failure instanceof ApiError && failure.code === "OTP_INVALID") {
        setCode("");
        codeInput.current?.focus();
      }
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  function acceptChallenge(result: PhoneChallenge) {
    const timestamp = Date.now();
    setChallenge(result);
    setCode("");
    setRegistrationToken("");
    setNow(timestamp);
    setResendAt(timestamp + result.resendAfter * 1000);
    setExpiresAt(timestamp + result.expiresIn * 1000);
    setStep("code");
    // Resends keep the same input mounted.
    codeInput.current?.focus();
  }

  function finish(result: AuthResponse) {
    setRegistrationToken("");
    auth.signIn(result.user);
    router.replace(destination);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    await run(async () => {
      if (!accepted) throw new Error("Please accept the terms to continue.");
      const number = indianPhone(phone);
      if (!number) throw new Error("Enter a valid 10-digit Indian mobile number.");

      if (step === "number") {
        const result = await api.post<PhoneAuthStart>("/api/auth/phone/start", {
          phone: number,
          legalConsent: createLegalAcceptance(),
        });
        if (result.kind === "otp") acceptChallenge(result);
        else setPasswordMode(result.kind === "signup" ? "register" : "login");
      } else if (step === "code") {
        if (expired || !challenge)
          throw new Error("This code has expired. Please send a new one.");
        const result = await api.post<
          AuthResponse | { kind: "signup"; registrationToken: string }
        >("/api/auth/otp/verify", {
          challengeId: challenge.challengeId,
          code,
          legalConsent: createLegalAcceptance(),
        });
        if ("user" in result) finish(result);
        else {
          setRegistrationToken(result.registrationToken);
          setStep("details");
        }
      } else {
        const password = String(values.get("password") || "");
        if (password !== values.get("confirmation"))
          throw new Error("Your passwords do not match.");
        if (new TextEncoder().encode(password).length > 72)
          throw new Error("Please use a password of 72 bytes or fewer.");
        if (!registrationToken) throw new Error("Please verify your number again.");
        finish(
          await api.post<AuthResponse>("/api/auth/otp/complete-signup", {
            registrationToken,
            name: String(values.get("name") || "").trim(),
            email: String(values.get("email") || "").trim(),
            password,
            legalConsent: createLegalAcceptance(),
          }),
        );
      }
    });
  }

  function resend() {
    if (seconds > 0) return;
    void run(async () => {
      const number = indianPhone(phone);
      if (!number) throw new Error("Please check your mobile number.");
      acceptChallenge(
        await api.post<PhoneChallenge>("/api/auth/otp/request", {
          phone: number,
          legalConsent: createLegalAcceptance(),
        }),
      );
      setNotice("A new code is on its way. Use the latest one.");
    });
  }

  if (passwordMode) {
    return (
      <PasswordAuthScreen
        key={passwordMode}
        initialMode={passwordMode}
        initialIdentifier={passwordMode === "login" ? indianPhone(phone) || "" : ""}
        initialPhone={indianPhone(phone) || ""}
        onUseMobile={resetNumber}
      />
    );
  }

  return (
    <AuthLayout
      title={headings[step]}
      description={
        step === "number"
          ? "Sign in or create an account with your mobile number."
          : step === "code"
            ? "Enter the six-digit code sent to " + challenge?.maskedPhone + "."
            : "Your number is verified. Just a few details to make this space yours."
      }
    >
      <div className="grid gap-5">
        <FormNotice error>{error}</FormNotice>
        <FormNotice>{notice}</FormNotice>
        {step === "number" && unavailable && (
          <FormNotice>
            WhatsApp sign-in is temporarily unavailable. You can use a password or create
            an account with email below.
          </FormNotice>
        )}
        {step === "number" && config.error && (
          <FormNotice error>
            We couldn&apos;t check WhatsApp availability. Try sending a code, or use your
            password below.
          </FormNotice>
        )}
        <form key={step} onSubmit={submit} aria-busy={busy} className="grid gap-5">
          <fieldset disabled={busy} className="grid gap-5 disabled:opacity-70">
            <legend className="sr-only">{headings[step]}</legend>
            {step === "number" && (
              <>
                <Input
                  id="mobile-number"
                  name="phone"
                  label="Mobile number"
                  type="tel"
                  autoComplete="tel-national"
                  inputMode="tel"
                  value={phone}
                  onChange={(value) => setPhone(normalizeMobileInput(value))}
                  pattern="[6-9][0-9]{9}"
                  maxLength={18}
                  placeholder="Your 10-digit number"
                  prefix="+91"
                  hint="Indian numbers (+91). We'll send a code on WhatsApp."
                  isRequired
                  inputClassName="min-h-14"
                />
                <LegalAcceptance accepted={accepted} onChange={setAccepted} />
              </>
            )}
            {step === "code" && (
              <>
                <Input
                  ref={codeInput}
                  id="whatsapp-code"
                  name="code"
                  label="WhatsApp code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                  value={code}
                  onChange={(value) => setCode(value.replace(/\D/g, "").slice(0, 6))}
                  pattern="[0-9]{6}"
                  minLength={6}
                  maxLength={6}
                  isRequired
                  inputClassName="min-h-16 text-center text-2xl tracking-[0.35em] tabular-nums"
                  hint={
                    expired
                      ? "This code has expired. Request a new one below."
                      : "Your code is valid for " +
                        Math.max(1, Math.ceil(challenge!.expiresIn / 60)) +
                        " minutes."
                  }
                />
              </>
            )}
            {step === "details" && (
              <>
                <Field
                  name="name"
                  label="Your name"
                  autoComplete="name"
                  maxLength={100}
                  autoFocus
                  required
                />
                <Field
                  name="email"
                  label="Email address"
                  type="email"
                  autoComplete="email"
                  maxLength={254}
                  required
                  hint="For updates about your orders."
                />
                <Field
                  name="password"
                  label="Create a backup password"
                  type="password"
                  autoComplete="new-password"
                  minLength={12}
                  maxLength={72}
                  required
                  hint="At least 12 characters. Use it when WhatsApp isn't available."
                />
                <Field
                  name="confirmation"
                  label="Confirm password"
                  type="password"
                  autoComplete="new-password"
                  minLength={12}
                  maxLength={72}
                  required
                />
              </>
            )}
            <Button
              color="dark"
              isLoading={busy}
              isDisabled={expired || (step === "number" && unavailable)}
              className="w-full"
              type="submit"
            >
              {busy
                ? step === "number"
                  ? "Sending your code..."
                  : step === "code"
                    ? "Verifying..."
                    : "Creating your account..."
                : step === "number"
                  ? "Send WhatsApp code"
                  : step === "code"
                    ? "Verify and continue"
                    : "Create my account"}
            </Button>
          </fieldset>
        </form>
        {step === "code" && (
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <button
              type="button"
              onClick={resend}
              disabled={busy || seconds > 0}
              className="min-h-11 underline underline-offset-4 disabled:no-underline disabled:opacity-60"
            >
              {seconds > 0 ? "Resend code in " + seconds + "s" : "Send a new code"}
            </button>
            <button
              type="button"
              onClick={resetNumber}
              disabled={busy}
              className="min-h-11 underline underline-offset-4 disabled:opacity-50"
            >
              Change number
            </button>
          </div>
        )}
        <div className="border-t border-line pt-4 text-center">
          <button
            type="button"
            onClick={() => openPassword()}
            disabled={busy}
            className="min-h-11 text-sm underline underline-offset-4 disabled:opacity-50"
          >
            {step === "details"
              ? "Already have an account? Use your password"
              : "Sign in with a password"}
          </button>
          {unavailable && step === "number" && (
            <button
              type="button"
              onClick={() => openPassword("register")}
              disabled={busy}
              className="block min-h-11 w-full text-sm underline underline-offset-4 disabled:opacity-50"
            >
              Create an account with email
            </button>
          )}
          {step === "details" && (
            <button
              type="button"
              onClick={resetNumber}
              disabled={busy}
              className="block min-h-11 w-full text-sm text-muted underline underline-offset-4 disabled:opacity-50"
            >
              Verify a different number
            </button>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}
