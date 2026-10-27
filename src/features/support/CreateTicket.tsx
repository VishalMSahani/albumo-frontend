"use client";
import { Button } from "@/components/base/buttons/button";
import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import PageIntro from "@/components/PageIntro";
import { Field, FormNotice, TextareaField, inputClass } from "@/components/forms/FormUI";
import { useAuth } from "@/features/auth/AuthProvider";
import { errorMessage } from "@/lib/api-client";
import { ui } from "@/lib/ui";
import { ticketCategories } from "./constants";
import { rememberTicket, supportApi } from "./support.service";
import type { SupportTicket, TicketCategory, TicketPriority } from "./types";
import SupportReceipt from "./SupportReceipt";

export default function CreateTicket() {
  const { user } = useAuth();
  const [receipt, setReceipt] = useState<SupportTicket | null>(null);
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
    const text = (key: string) => String(form.get(key) || "").trim();
    try {
      const ticket = await supportApi.createTicket({
        name: text("name"),
        email: text("email"),
        subject: text("subject"),
        description: text("description"),
        category: text("category") as TicketCategory,
        priority: text("priority") as TicketPriority,
        ...(text("orderId") ? { orderId: text("orderId") } : {}),
      });
      rememberTicket(ticket.ticketNumber, ticket.requesterEmail);
      setReceipt(ticket);
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
        page="Get support"
        eyebrow="We’re listening"
        description="A question about your album, an order, or your account? Share the details and we’ll take it from here."
      >
        Let’s sort <em>it out.</em>
      </PageIntro>
      <section
        className={ui.container + " grid gap-10 pb-20 lg:grid-cols-[1fr_300px] lg:gap-16"}
      >
        <div className="rounded-[28px] border border-line/80 bg-white p-6 shadow-[0_16px_50px_-36px_#3a2e2a35] sm:p-9">
          {receipt ? (
            <SupportReceipt
              number={receipt.ticketNumber}
              email={receipt.requesterEmail}
            />
          ) : (
            <form onSubmit={submit} className="grid gap-5">
              <fieldset disabled={busy} className="grid gap-5">
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
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-medium">
                    Topic
                    <select className={inputClass} name="category">
                      {ticketCategories.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm font-medium">
                    Priority
                    <select className={inputClass} name="priority" defaultValue="MEDIUM">
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Normal</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </label>
                </div>
                <Field
                  name="orderId"
                  label="Order reference (optional)"
                  maxLength={100}
                />
                <Field
                  name="subject"
                  label="A short summary"
                  required
                  minLength={5}
                  maxLength={160}
                />
                <TextareaField
                  name="description"
                  label="What would you like help with?"
                  required
                  minLength={20}
                  maxLength={5000}
                  rows={6}
                  placeholder="A little detail helps us get you the right answer."
                />
                <p className="text-sm text-muted">
                  We’ll use these details to respond to your request.{" "}
                  <Link href="/privacy-policy" className="underline">
                    Privacy Policy
                  </Link>
                </p>
                <FormNotice error>{error}</FormNotice>
                <Button type="submit" color="dark" isLoading={busy} className="w-fit">
                  {busy ? "Sending..." : "Send your request"}
                </Button>
              </fieldset>
            </form>
          )}
        </div>
        <aside className="space-y-5 text-sm">
          <h2 className="font-sans text-2xl font-medium tracking-tight">
            One conversation.
            <br />
            Everything in one place.
          </h2>
          <p className="text-muted">
            No account needed. Save your reference number and use the same email to read
            and reply.
          </p>
          <Link href="/support/tickets" className={ui.textLink}>
            Track an existing request
          </Link>
          <Link href="/help" className="block py-2 text-sm underline">
            Browse the help centre
          </Link>
        </aside>
      </section>
    </>
  );
}
