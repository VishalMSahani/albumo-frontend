"use client";
import { Button } from "@/components/base/buttons/button";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Field, FormNotice, TextareaField } from "@/components/forms/FormUI";
import { useAuth } from "@/features/auth/AuthProvider";
import { errorMessage } from "@/lib/api-client";
import { ui } from "@/lib/ui";
import { supportApi, rememberedEmail, rememberTicket } from "./support.service";
import { formatDate, statusLabels } from "./constants";
import type { SupportTicket } from "./types";

export default function TicketDetail({ number }: { number: string }) {
  const auth = useAuth();
  if (auth.loading)
    return (
      <section className={ui.container + " py-10 sm:py-16"}>
        <p role="status">Opening your conversation...</p>
      </section>
    );
  return (
    <TicketConversation
      key={`${number}:${auth.user?.id || "guest"}`}
      number={number}
      signedIn={!!auth.user}
    />
  );
}

function TicketConversation({ number, signedIn }: { number: string; signedIn: boolean }) {
  const [savedEmail] = useState(() => rememberedEmail(number));
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [email, setEmail] = useState(savedEmail);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(signedIn || !!savedEmail);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const requestVersion = useRef(0);
  useEffect(() => {
    if (!signedIn && !savedEmail) return;
    const version = ++requestVersion.current;
    void supportApi
      .trackTicket(number, savedEmail || undefined)
      .then(
        (result) => {
          if (requestVersion.current === version) setTicket(result);
        },
        (failure) => {
          if (requestVersion.current === version) setError(errorMessage(failure));
        },
      )
      .finally(() => {
        if (requestVersion.current === version) setLoading(false);
      });
    return () => {
      requestVersion.current += 1;
    };
  }, [number, signedIn, savedEmail]);

  async function unlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    const version = requestVersion.current;
    try {
      const result = await supportApi.trackTicket(number, email.trim());
      if (version === requestVersion.current) {
        rememberTicket(number, email.trim());
        setTicket(result);
      }
    } catch (failure) {
      if (version === requestVersion.current) setError(errorMessage(failure));
    } finally {
      setBusy(false);
    }
  }
  async function reply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    const version = requestVersion.current;
    try {
      await supportApi.reply(number, message.trim(), email.trim() || undefined);
      if (version !== requestVersion.current) return;
      setMessage("");
      setNotice("Your reply was sent.");
      const result = await supportApi.trackTicket(number, email.trim() || undefined);
      if (version === requestVersion.current) setTicket(result);
    } catch (failure) {
      if (version === requestVersion.current) setError(errorMessage(failure));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className={ui.container + " py-10 sm:py-16"}>
      <Link href="/support/tickets" className="text-sm underline">
        Your conversations
      </Link>
      <div className="mx-auto mt-9 max-w-3xl">
        <span className={ui.eyebrow}>{number}</span>
        <h1 className={ui.heading}>{ticket?.subject || "Your conversation."}</h1>
        <div className="mt-6 space-y-5">
          <FormNotice error>{error}</FormNotice>
          <FormNotice>{notice}</FormNotice>
        </div>
        {loading ? (
          <p role="status" className="mt-8">
            Opening your conversation...
          </p>
        ) : !ticket ? (
          <form
            onSubmit={unlock}
            className="mt-8 grid max-w-md gap-5 border border-line bg-paper p-6"
          >
            <p className="text-sm text-muted">
              Enter the email you used for this request to view and reply.
            </p>
            <Field
              label="Email address"
              type="email"
              value={email}
              onChange={setEmail}
              required
              maxLength={254}
              autoComplete="email"
            />
            <Button type="submit" color="dark" isLoading={busy}>
              {busy ? "Checking..." : "View conversation"}
            </Button>
          </form>
        ) : (
          <>
            <div className="my-8 flex flex-wrap items-center justify-between gap-3 border-y border-line py-4 text-sm">
              <span className="rounded-full bg-rose/60 px-3 py-1">
                {statusLabels[ticket.status]}
              </span>
              <span className="text-muted">Started {formatDate(ticket.createdAt)}</span>
            </div>
            <ol className="grid gap-5">
              {!ticket.messages?.some(
                (item) => item.sender === "CUSTOMER" && item.body === ticket.description,
              ) && (
                <li className="rounded-[28px] border border-line/80 bg-white p-6 shadow-[0_16px_50px_-36px_#3a2e2a35]">
                  <p className="text-sm font-semibold">{ticket.requesterName}</p>
                  <p className="mt-3 text-sm break-words whitespace-pre-wrap">
                    {ticket.description}
                  </p>
                </li>
              )}
              {ticket.messages?.map((item) => (
                <li
                  key={item.id}
                  className={
                    item.sender === "SUPPORT"
                      ? "rounded-[28px] border border-line bg-rose/25 p-6"
                      : "rounded-[28px] border border-line/80 bg-white p-6 shadow-[0_16px_50px_-36px_#3a2e2a35]"
                  }
                >
                  <div className="flex flex-wrap justify-between gap-3 text-sm">
                    <span className="font-semibold">
                      {item.sender === "SUPPORT"
                        ? "Albumo support"
                        : item.sender === "SYSTEM"
                          ? "Update"
                          : item.authorName || "You"}
                    </span>
                    <time className="text-muted">{formatDate(item.createdAt)}</time>
                  </div>
                  <p className="mt-3 text-sm break-words whitespace-pre-wrap">
                    {item.body}
                  </p>
                </li>
              ))}
            </ol>
            {ticket.status === "CLOSED" ? (
              <p className="mt-8 text-sm">
                This conversation is closed.{" "}
                <Link href="/support/new" className="underline">
                  Start a new request
                </Link>{" "}
                if you need another hand.
              </p>
            ) : (
              <form onSubmit={reply} className="mt-8 grid gap-4">
                <TextareaField
                  label="Add a reply"
                  value={message}
                  onChange={setMessage}
                  minLength={2}
                  maxLength={5000}
                  required
                  rows={4}
                  disabled={busy}
                />
                <Button type="submit" color="dark" isLoading={busy} className="w-fit">
                  {busy ? "Sending..." : "Send reply"}
                </Button>
              </form>
            )}
          </>
        )}
      </div>
    </section>
  );
}
