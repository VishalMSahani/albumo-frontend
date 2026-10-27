"use client";

// Adapted from Untitled UI (MIT). See THIRD_PARTY_NOTICES.md.
import type { ReactNode, Ref } from "react";
import {
  FieldError,
  Label,
  Text,
  TextArea as AriaTextArea,
  TextField,
  type TextFieldProps,
} from "react-aria-components";
import { cx } from "@/lib/cx";
import { fieldClass } from "../input/styles";

export interface TextAreaProps extends Omit<TextFieldProps, "children" | "className"> {
  label: string;
  hint?: ReactNode;
  placeholder?: string;
  rows?: number;
  className?: string;
  inputClassName?: string;
  ref?: Ref<HTMLTextAreaElement>;
}

export function TextArea({
  label,
  hint,
  placeholder,
  rows = 5,
  className,
  inputClassName,
  ref,
  ...props
}: TextAreaProps) {
  return (
    <TextField
      {...props}
      validationBehavior="native"
      className={cx("group grid w-full gap-2", className)}
    >
      <Label className="text-sm font-medium text-ink">{label}</Label>
      <AriaTextArea
        ref={ref}
        placeholder={placeholder}
        rows={rows}
        className={cx(fieldClass, "min-h-36 resize-y", inputClassName)}
      />
      {hint && (
        <Text slot="description" className="text-sm leading-6 text-muted">
          {hint}
        </Text>
      )}
      <FieldError className="text-sm leading-6 text-berry" />
    </TextField>
  );
}
