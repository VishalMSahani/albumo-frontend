"use client";

// Adapted from Untitled UI (MIT). See THIRD_PARTY_NOTICES.md.
import {
  Dialog as AriaDialog,
  DialogTrigger,
  Modal as AriaModal,
  ModalOverlay as AriaModalOverlay,
  type DialogProps,
  type ModalOverlayProps,
} from "react-aria-components";
import { cx } from "@/lib/cx";

export { DialogTrigger };

export function ModalOverlay(props: ModalOverlayProps) {
  return (
    <AriaModalOverlay
      {...props}
      className={(state) =>
        cx(
          "fixed inset-0 z-50 flex min-h-dvh items-center justify-center bg-ink/40 p-4",
          typeof props.className === "function"
            ? props.className(state)
            : props.className,
        )
      }
    />
  );
}

export function Modal(props: ModalOverlayProps) {
  return (
    <AriaModal
      {...props}
      className={(state) =>
        cx(
          "max-h-[calc(var(--visual-viewport-height,100dvh)-2rem)] w-full max-w-lg overflow-y-auto rounded-xl border border-line bg-white text-ink shadow-xl outline-none",
          typeof props.className === "function"
            ? props.className(state)
            : props.className,
        )
      }
    />
  );
}

export function Dialog(props: DialogProps) {
  return (
    <AriaDialog
      {...props}
      className={cx("relative w-full p-6 outline-none sm:p-8", props.className)}
    />
  );
}
