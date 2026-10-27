"use client";
import { Button } from "@/components/base/buttons/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import PageIntro from "@/components/PageIntro";
import { Field, FormNotice } from "@/components/forms/FormUI";
import { useAuth } from "@/features/auth/AuthProvider";
import { useResource } from "@/lib/use-resource";
import { ui } from "@/lib/ui";
import { rememberTicket, supportApi } from "./support.service";
import { formatDate, statusLabels } from "./constants";

export default function TicketList() {
  const router = useRouter();
  const auth = useAuth();
  const tickets = useResource(
    "tickets:" + auth.user?.id,
    supportApi.getMyTickets,
    !!auth.user,
  );
  function track(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const number = String(form.get("number") || "")
      .trim()
      .toUpperCase();
    rememberTicket(number, String(form.get("email") || "").trim());
    router.push("/support/tickets/" + encodeURIComponent(number));
  }
  return (
    <>
      <PageIntro
        page="Your conversations"
        eyebrow="Pick up where you left off"
        description="Read a reply, share an update, or check how your request is progressing."
      >
        A little <em>follow-up.</em>
      </PageIntro>
      <section className={ui.container + " grid gap-10 pb-20 lg:grid-cols-[1fr_360px]"}>
        <div>
          {auth.loading || tickets.loading ? (
            <p role="status">Loading your conversations...</p>
          ) : auth.user ? (
            <>
              <FormNotice error>{tickets.error}</FormNotice>
              {tickets.error && (
                <button onClick={tickets.reload} className="min-h-11 underline">
                  Try again
                </button>
              )}
              {tickets.data?.length === 0 && (
                <p className="text-muted">
                  No requests yet. We’re here whenever you need a hand.
                </p>
              )}
              <div className="divide-y divide-line">
                {tickets.data?.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={"/support/tickets/" + encodeURIComponent(ticket.ticketNumber)}
                    className="block py-6 first:pt-0"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                      <span className="text-muted">{ticket.ticketNumber}</span>
                      <span className="rounded-full bg-rose/50 px-3 py-1">
                        {statusLabels[ticket.status]}
                      </span>
                    </div>
                    <h2 className="mt-3 font-sans text-2xl font-medium tracking-tight">
                      {ticket.subject}
                    </h2>
                    <p className="mt-2 text-sm text-muted">
                      Updated {formatDate(ticket.lastActivityAt)}
                    </p>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-5">
              <FormNotice error>{auth.error}</FormNotice>
              <h2 className="font-sans text-2xl font-medium tracking-tight">
                Keep your conversations together.
              </h2>
              <p className="text-sm text-muted">
                Sign in to see requests linked to your account, or use your reference and
                email.
              </p>
              <Link href="/login?redirect=/support/tickets" className={ui.buttonDark}>
                Sign in
              </Link>
            </div>
          )}
          <Link href="/support/new" className={ui.textLink + " mt-8"}>
            Start a new request
          </Link>
        </div>
        <form
          onSubmit={track}
          className="grid gap-5 self-start rounded-[28px] border border-line/80 bg-white p-6 shadow-[0_16px_50px_-36px_#3a2e2a35] sm:p-8"
        >
          <h2 className="font-sans text-2xl font-medium tracking-tight">
            Have a reference?
          </h2>
          <Field
            label="Ticket reference"
            name="number"
            placeholder="Your reference number"
            required
            maxLength={100}
          />
          <Field
            label="Email used for this request"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
          />
          <Button type="submit" color="dark">
            Find conversation
          </Button>
        </form>
      </section>
    </>
  );
}
