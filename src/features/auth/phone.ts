export type PhoneChallenge = {
  challengeId: string;
  maskedPhone: string;
  expiresIn: number;
  resendAfter: number;
};

export type PhoneAuthStart =
  ({ kind: "otp" } & PhoneChallenge) | { kind: "password" | "signup" };

/** Keep partial input editable; accept a pasted Indian country code too. */
export function normalizeMobileInput(value: string): string {
  const compact = value.replace(/[\s()+-]/g, "");
  return compact.length === 12 && compact.startsWith("91") ? compact.slice(2) : compact;
}

export function indianPhone(value: string): string | null {
  const number = normalizeMobileInput(value);
  return /^[6-9][0-9]{9}$/.test(number) ? "+91" + number : null;
}

export function secondsRemaining(deadline: number, now: number): number {
  return Math.max(0, Math.ceil((deadline - now) / 1000));
}
