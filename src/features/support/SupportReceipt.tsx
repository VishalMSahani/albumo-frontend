import Link from "next/link";
import { ui } from "@/lib/ui";
export default function SupportReceipt({
  number,
  email,
}: {
  number: string;
  email: string;
}) {
  return (
    <div role="status" className="py-5">
      <span className={ui.eyebrow}>Safely received</span>
      <h2 className="font-display text-3xl">Your conversation has started.</h2>
      <p className="mt-4 text-sm text-muted">
        Keep this reference and your email to read replies or add a little more detail.
      </p>
      <dl className="my-6 grid gap-4 border-y border-line py-5 text-sm">
        <div>
          <dt className="text-sm text-muted">Reference</dt>
          <dd className="mt-1 font-semibold break-all">{number}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Email</dt>
          <dd className="mt-1 break-all">{email}</dd>
        </div>
      </dl>
      <Link
        href={"/support/tickets/" + encodeURIComponent(number)}
        className={ui.buttonDark}
      >
        View conversation
      </Link>
    </div>
  );
}
