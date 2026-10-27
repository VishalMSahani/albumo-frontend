import Link from "next/link";

export default function LegalAcceptance({
  accepted,
  onChange,
}: {
  accepted: boolean;
  onChange: (accepted: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 text-sm leading-6 text-muted">
      <input
        name="legalConsent"
        type="checkbox"
        checked={accepted}
        onChange={(event) => onChange(event.target.checked)}
        required
        className="mt-1 size-4 shrink-0 accent-berry"
      />
      <span>
        I agree to the{" "}
        <Link
          className="text-ink underline underline-offset-2"
          href="/terms-and-conditions"
          target="_blank"
          rel="noreferrer"
        >
          Terms
        </Link>{" "}
        and acknowledge the{" "}
        <Link
          className="text-ink underline underline-offset-2"
          href="/privacy-policy"
          target="_blank"
          rel="noreferrer"
        >
          Privacy Policy
        </Link>
        .
      </span>
    </label>
  );
}
