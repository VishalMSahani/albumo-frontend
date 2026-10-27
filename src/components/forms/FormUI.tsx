"use client";

import { Input, type InputProps } from "@/components/base/input/input";
import { TextArea, type TextAreaProps } from "@/components/base/textarea/textarea";

export { fieldClass as inputClass } from "@/components/base/input/styles";

// Keep existing form call sites readable while sharing the Untitled UI foundation.
type LegacyFieldState = { required?: boolean; disabled?: boolean; readOnly?: boolean };
export function Field({
  required,
  disabled,
  readOnly,
  ...props
}: InputProps & LegacyFieldState) {
  return (
    <Input
      {...props}
      isRequired={required ?? props.isRequired}
      isDisabled={disabled ?? props.isDisabled}
      isReadOnly={readOnly ?? props.isReadOnly}
    />
  );
}
export function TextareaField({
  required,
  disabled,
  readOnly,
  ...props
}: TextAreaProps & LegacyFieldState) {
  return (
    <TextArea
      {...props}
      isRequired={required ?? props.isRequired}
      isDisabled={disabled ?? props.isDisabled}
      isReadOnly={readOnly ?? props.isReadOnly}
    />
  );
}

export { FormNotice, Honeypot } from "./FormFeedback";
