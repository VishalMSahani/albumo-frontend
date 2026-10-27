"use client";

// Adapted from Untitled UI (MIT). See THIRD_PARTY_NOTICES.md.
import { useState, type ReactNode, type Ref } from "react";
import {
  Button as AriaButton,
  FieldError,
  Group,
  Input as AriaInput,
  Label,
  Text,
  TextField,
  type TextFieldProps,
} from "react-aria-components";
import { cx } from "@/lib/cx";
import { fieldClass } from "./styles";

export interface InputProps extends Omit<TextFieldProps, "children" | "className"> {
  label: string;
  min?: number;
  max?: number;
  step?: number;
  hint?: ReactNode;
  placeholder?: string;
  prefix?: string;
  className?: string;
  inputClassName?: string;
  ref?: Ref<HTMLInputElement>;
}

/** Labels, descriptions and validation messages are connected by React Aria. */
export function Input({
  label,
  hint,
  placeholder,
  prefix,
  className,
  inputClassName,
  min,
  max,
  step,
  ref,
  type = "text",
  ...props
}: InputProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  return (
    <TextField
      {...props}
      type={type === "password" && passwordVisible ? "text" : type}
      validationBehavior="native"
      className={cx("group grid w-full gap-2", className)}
    >
      <Label className="text-sm font-medium text-ink">{label}</Label>
      <Group className="relative flex w-full items-center">
        {prefix && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-4 border-r border-line pr-3 text-sm text-muted"
          >
            {prefix}
          </span>
        )}
        <AriaInput
          ref={ref}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          className={cx(
            fieldClass,
            prefix && "pl-19",
            type === "password" && "pr-18",
            inputClassName,
          )}
        />
        {type === "password" && (
          <AriaButton
            type="button"
            isDisabled={props.isDisabled}
            aria-label={passwordVisible ? "Hide password" : "Show password"}
            aria-pressed={passwordVisible}
            onPress={() => setPasswordVisible((value) => !value)}
            className="absolute right-2 inline-flex min-h-11 min-w-11 items-center justify-center rounded px-2 text-sm font-medium text-muted hover:text-ink disabled:opacity-50"
          >
            {passwordVisible ? "Hide" : "Show"}
          </AriaButton>
        )}
      </Group>
      {hint && (
        <Text slot="description" className="text-sm leading-6 text-muted">
          {hint}
        </Text>
      )}
      <FieldError className="text-sm leading-6 text-berry" />
    </TextField>
  );
}
