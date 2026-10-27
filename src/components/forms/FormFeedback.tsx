import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

export function FormNotice({
  error,
  children,
  className,
}: {
  error?: boolean;
  children: ReactNode;
  className?: string;
}) {
  if (!children) return null;
  return (
    <p
      role={error ? "alert" : "status"}
      className={cx(
        error
          ? "border-l-2 border-berry bg-rose/30 p-4 text-sm text-ink"
          : "border-l-2 border-ink bg-sage p-4 text-sm text-ink",
        className,
      )}
    >
      {children}
    </p>
  );
}
export function Honeypot() {
  return (
    <div className="hidden" aria-hidden="true">
      <label>
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}
