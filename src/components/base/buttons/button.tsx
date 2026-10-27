"use client";

// Adapted from Untitled UI (MIT). See THIRD_PARTY_NOTICES.md.
import type { ReactNode, Ref } from "react";
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from "react-aria-components";
import { cx } from "@/lib/cx";
import { ui } from "@/lib/ui";

const colors = {
  primary: ui.button,
  secondary: ui.buttonOutline,
  dark: ui.buttonDark,
  tertiary:
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-ink hover:bg-surface",
};

export interface ButtonProps extends Omit<
  AriaButtonProps,
  "children" | "className" | "isPending"
> {
  children: ReactNode;
  className?: string;
  color?: keyof typeof colors;
  isLoading?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

/** Actions use React Aria; navigation continues to use Next.js Link. */
export function Button({
  children,
  className,
  color = "primary",
  isLoading = false,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <AriaButton
      {...props}
      type={type}
      isPending={isLoading}
      aria-busy={isLoading || undefined}
      data-loading={isLoading || undefined}
      className={cx(
        colors[color],
        "relative cursor-pointer outline-offset-4 outline-berry transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 data-[focus-visible]:outline-2 data-[pending]:cursor-wait data-[pressed]:brightness-95 motion-reduce:transition-none",
        className,
      )}
    >
      {isLoading && (
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          className="size-4 shrink-0"
        >
          <circle
            cx="10"
            cy="10"
            r="8"
            stroke="currentColor"
            strokeWidth="2"
            className="opacity-30"
          />
          <circle
            cx="10"
            cy="10"
            r="8"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="12.5 50"
            strokeLinecap="round"
            className="origin-center animate-spin motion-reduce:animate-none"
          />
        </svg>
      )}
      <span data-text>{children}</span>
    </AriaButton>
  );
}
