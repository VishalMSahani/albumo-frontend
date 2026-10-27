export type User = {
  id: string;
  name: string | null;
  email: string;
  role: "STUDENT" | "MENTOR" | "ADMIN" | "SUPER_ADMIN";
  phone?: string | null;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  avatarUrl?: string | null;
  hasPassword?: boolean;
  createdAt?: string;
};
export type AuthResponse = { user: User; expiresIn: number; sessionExpiresAt?: string };
export type AuthConfig = { whatsappOtp: boolean; google: boolean; github: boolean };
export function safeRedirect(value: string | null): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\x00-\x20]/.test(value)
  )
    return "/account";
  try {
    const url = new URL(value, "https://albumo.invalid");
    if (
      url.origin !== "https://albumo.invalid" ||
      /^\/(login|register|callback)(\/|$)/.test(url.pathname)
    )
      return "/account";
    return url.pathname + url.search + url.hash;
  } catch {
    return "/account";
  }
}
