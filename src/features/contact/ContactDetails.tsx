"use client";
import Link from "next/link";
import { useContact } from "./ContactProvider";
export default function ContactDetails({
  compact = false,
  showWhatsApp = true,
}: {
  compact?: boolean;
  showWhatsApp?: boolean;
}) {
  const { data, loading, error, reload } = useContact();
  const whatsapp =
    showWhatsApp && data?.whatsapp && /^[1-9]\d{7,14}$/.test(data.whatsapp);
  return (
    <div className="grid gap-3 text-sm">
      {loading && (
        <p role="status" className="text-sm opacity-70">
          Loading contact details...
        </p>
      )}
      {error && (
        <p className="text-sm opacity-80">
          Contact details are unavailable.{" "}
          <button onClick={reload} className="underline">
            Try again
          </button>
          .
        </p>
      )}
      {data?.email && (
        <a
          href={"mailto:" + data.email}
          className="w-fit py-1 break-all underline-offset-4 hover:underline"
        >
          {data.email}
        </a>
      )}
      {!compact && data?.phone && (
        <a
          href={"tel:" + data.phone.replace(/[^+\d]/g, "")}
          className="w-fit py-1 hover:underline"
        >
          {data.phone}
        </a>
      )}
      {whatsapp && (
        <a
          href={"https://wa.me/" + data.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="w-fit py-1 underline"
        >
          Chat on WhatsApp<span className="sr-only"> (opens in a new tab)</span>
        </a>
      )}
      {!compact && data?.hours && <p className="text-sm opacity-75">{data.hours}</p>}
      {!loading && !data?.email && (compact || !data?.phone) && !whatsapp && (
        <Link href="/contact" className="w-fit py-1 underline">
          Send us a message
        </Link>
      )}
    </div>
  );
}
