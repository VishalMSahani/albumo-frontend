"use client";

import { useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/base/buttons/button";
import { Field, FormNotice, TextareaField, inputClass } from "@/components/forms/FormUI";
import { useAuth } from "@/features/auth/AuthProvider";
import { errorMessage } from "@/lib/api-client";
import { partnerCategories, type PartnerType } from "./partner-content";
import { submitPartnerInquiry } from "./partner.service";

const subscribeToHydration = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

export default function PartnerForm({ partnerType }: { partnerType?: PartnerType }) {
  const { user } = useAuth();
  const ready = useSyncExternalStore(subscribeToHydration, clientReady, serverReady);
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  const feedbackRef = useRef<HTMLDivElement>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready || lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const value = (name: string) => String(form.get(name) || "").trim();
    try {
      await submitPartnerInquiry({
        partnerType: value("partnerType") as PartnerType,
        name: value("name"),
        email: value("email"),
        phone: value("phone"),
        companyName: value("companyName"),
        website: value("website") || undefined,
        city: value("city"),
        message: value("message"),
        expectedVolume: value("expectedVolume") || undefined,
        contactConsent: form.get("contactConsent") === "on",
        directoryConsent: form.get("directoryConsent") === "on",
        companyFax: value("companyFax"),
      });
      setSuccess(true);
      requestAnimationFrame(() => feedbackRef.current?.focus());
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  if (success) {
    return (
      <div ref={feedbackRef} tabIndex={-1} role="status" className="py-8 outline-none">
        <p className="text-sm font-medium text-berry">Enquiry received</p>
        <h3 className="mt-4 font-display text-3xl">Here’s to a new connection.</h3>
        <p className="mt-4 text-base leading-7 text-muted">
          Our team will review your idea and contact you using the details you shared. Any
          directory listing will be discussed and reviewed before it goes live.
        </p>
        <Link
          href="/partners#discover"
          className="mt-6 inline-block py-3 font-medium underline underline-offset-4 hover:text-berry"
        >
          Explore the partner network
        </Link>
      </div>
    );
  }

  return (
    <form
      method="post"
      onSubmit={submit}
      aria-label="Partnership enquiry"
      data-ready={ready}
    >
      <fieldset disabled={!ready || busy} className="grid min-w-0 gap-5">
        <legend className="mb-6 font-display text-2xl sm:text-3xl">
          Tell us about your business
        </legend>
        <label className="grid gap-2 text-sm font-medium">
          Business type <span className="sr-only">(required)</span>
          <select
            name="partnerType"
            required
            defaultValue={partnerType || ""}
            className={inputClass}
          >
            <option value="" disabled>
              Select your business type
            </option>
            {partnerCategories.map((category) => (
              <option key={category.type} value={category.type}>
                {category.title}
              </option>
            ))}
          </select>
        </label>
        <Field
          name="companyName"
          label="Business or studio name"
          required
          minLength={2}
          maxLength={150}
          autoComplete="organization"
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            name="name"
            label="Your name"
            defaultValue={user?.name || ""}
            required
            minLength={2}
            maxLength={100}
            autoComplete="name"
          />
          <Field
            name="city"
            label="City"
            required
            minLength={2}
            maxLength={100}
            autoComplete="address-level2"
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            name="email"
            label="Work email"
            required
            type="email"
            maxLength={254}
            autoComplete="email"
          />
          <Field
            name="phone"
            label="Phone number"
            type="tel"
            required
            minLength={6}
            maxLength={30}
            autoComplete="tel"
          />
        </div>
        <Field
          name="website"
          label="Website or portfolio (optional)"
          placeholder="https://"
          type="url"
          maxLength={500}
        />
        <label className="grid gap-2 text-sm font-medium">
          Albums per month (optional)
          <select name="expectedVolume" defaultValue="" className={inputClass}>
            <option value="">Still exploring</option>
            {["1–10", "11–50", "51–100", "100+"].map((volume) => (
              <option key={volume} value={volume}>
                {volume}
              </option>
            ))}
          </select>
        </label>
        <TextareaField
          name="message"
          label="What would you like to create together?"
          placeholder="Tell us about your customers and how an album could be part of their experience."
          required
          minLength={10}
          maxLength={3000}
          rows={4}
        />
        <div aria-hidden="true" className="hidden">
          <label>
            Leave this empty
            <input name="companyFax" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <div className="grid gap-4 border-t border-line pt-5">
          <label className="flex items-start gap-3 text-sm leading-6">
            <input
              name="directoryConsent"
              type="checkbox"
              className="mt-1 size-4 shrink-0 accent-berry"
            />
            <span>
              I would also like my business listed in the Albumo partner directory after
              onboarding and review. Only my approved business profile will be public.{" "}
              <span className="text-muted">(Optional)</span>
            </span>
          </label>
          <label className="flex items-start gap-3 text-sm leading-6">
            <input
              name="contactConsent"
              type="checkbox"
              required
              className="mt-1 size-4 shrink-0 accent-berry"
            />
            <span>
              I agree to be contacted about this enquiry and have read the{" "}
              <Link href="/privacy-policy" className="underline underline-offset-4">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
        </div>
        <FormNotice error>{error}</FormNotice>
        <Button
          type="submit"
          color="dark"
          isLoading={busy}
          isDisabled={!ready}
          className="w-full sm:w-fit"
        >
          {busy ? "Sending your enquiry…" : "Send partnership enquiry"}
        </Button>
        <p className="text-xs leading-5 text-muted">
          All fields are required unless marked optional. Directory participation is
          optional.
        </p>
      </fieldset>
      <noscript>
        <p className="mt-4 text-sm text-muted">
          Enable JavaScript to send a partnership enquiry, or contact us directly.
        </p>
      </noscript>
    </form>
  );
}
