"use client";
import { Button } from "@/components/base/buttons/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import PageIntro from "@/components/PageIntro";
import { Field, FormNotice, Honeypot, TextareaField } from "@/components/forms/FormUI";
import { useAuth } from "@/features/auth/AuthProvider";
import SupportReceipt from "@/features/support/SupportReceipt";
import { rememberTicket } from "@/features/support/support.service";
import { errorMessage } from "@/lib/api-client";
import { ui } from "@/lib/ui";
import ContactDetails from "./ContactDetails";
import { sendContactRequest, type EnquiryReceipt } from "./contact.service";

export default function ContactPage() {
  const params = useSearchParams();
  const { user } = useAuth();
  const [intent, setIntent] = useState(
    params.get("intent") === "custom" ? "CUSTOM_PROJECT" : "GENERAL",
  );
  const [receipt, setReceipt] = useState<EnquiryReceipt | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const body: Record<string, string | boolean> = {
      intent,
      consent: form.get("consent") === "on",
    };
    for (const field of [
      "name",
      "email",
      "subject",
      "message",
      "phone",
      "organization",
      "projectType",
      "budget",
      "timeline",
      "website",
    ])
      body[field] = String(form.get(field) || "").trim();
    try {
      const result = await sendContactRequest(body);
      rememberTicket(result.ticketNumber, result.email);
      setReceipt(result);
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <>
      <PageIntro
        page="Contact"
        eyebrow="A good place to start"
        description="A trip worth keeping, an event to remember, or just a question. We’d love to hear what you have in mind."
      >
        Tell us <em>your story.</em>
      </PageIntro>
      <section
        className={
          ui.container +
          " grid items-start gap-10 pb-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20"
        }
      >
        <aside data-reveal className="order-2 space-y-8 lg:order-1">
          <div className="rounded-[28px] bg-linear-to-br from-rose to-sand/50 p-7 sm:p-8">
            <h2 className="font-sans text-2xl font-medium tracking-tight">
              Already made a start?
            </h2>
            <p className="my-4 text-sm text-muted">
              For an existing order, delivery, or account question, keep everything
              together in a support request.
            </p>
            <Link href="/support/new" className={ui.textLink}>
              Get a little help
            </Link>
          </div>
          <div>
            <h2 className="mb-5 font-sans text-2xl font-medium tracking-tight">
              However you like to talk.
            </h2>
            <ContactDetails />
          </div>
          <p className="border-t border-line pt-6 text-sm leading-6 text-muted">
            No account needed. Every enquiry gets a reference so you can follow up without
            starting again.
          </p>
        </aside>
        <div className="order-1 rounded-[28px] border border-line/80 bg-white p-6 shadow-[0_16px_50px_-36px_#3a2e2a35] sm:p-9 lg:order-2">
          {receipt ? (
            <SupportReceipt number={receipt.ticketNumber} email={receipt.email} />
          ) : (
            <form onSubmit={submit} className="grid gap-5">
              <fieldset disabled={busy} className="grid gap-5">
                <legend className="mb-4 font-sans text-2xl font-medium tracking-tight">
                  What brings you here?
                </legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    ["GENERAL", "A quick question"],
                    ["CUSTOM_PROJECT", "An event or project"],
                  ].map(([value, label]) => (
                    <label
                      key={value}
                      className="flex cursor-pointer items-center gap-3 rounded-2xl border border-line p-4 text-sm has-checked:border-berry has-checked:bg-rose/30"
                    >
                      <input
                        type="radio"
                        name="intent"
                        value={value}
                        checked={intent === value}
                        onChange={() => setIntent(value)}
                        className="accent-berry"
                      />
                      {label}
                    </label>
                  ))}
                </div>
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
                    name="email"
                    label="Email address"
                    defaultValue={user?.email || ""}
                    required
                    type="email"
                    maxLength={254}
                    autoComplete="email"
                  />
                </div>
                {intent === "CUSTOM_PROJECT" && (
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      name="organization"
                      label="Group or organisation (optional)"
                      maxLength={120}
                      autoComplete="organization"
                    />
                    <Field
                      name="phone"
                      label="Phone (optional)"
                      type="tel"
                      maxLength={30}
                      autoComplete="tel"
                    />
                    <Field
                      name="projectType"
                      label="What are you planning?"
                      placeholder="A group trip, celebration, event..."
                      maxLength={80}
                    />
                    <Field name="budget" label="Budget (optional)" maxLength={100} />
                    <Field
                      name="timeline"
                      label="When do you have in mind? (optional)"
                      maxLength={100}
                    />
                  </div>
                )}
                <Field
                  name="subject"
                  label="A few words about it"
                  defaultValue={(params.get("subject") || "").slice(0, 130)}
                  required
                  minLength={5}
                  maxLength={130}
                />
                <TextareaField
                  name="message"
                  label="Tell us a little more"
                  defaultValue={(params.get("message") || "").slice(0, 4000)}
                  required
                  minLength={20}
                  maxLength={4000}
                  rows={5}
                />
                <Honeypot />
                <label className="flex items-start gap-3 text-sm leading-6">
                  <input
                    name="consent"
                    type="checkbox"
                    required
                    className="mt-1 size-4 shrink-0 accent-berry"
                  />
                  <span>
                    You may contact me about this enquiry. I’ve read the{" "}
                    <Link href="/privacy-policy" className="underline">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
                <FormNotice error>{error}</FormNotice>
                <Button type="submit" color="dark" isLoading={busy} className="w-fit">
                  {busy ? "Sending..." : "Start the conversation"}
                </Button>
              </fieldset>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
