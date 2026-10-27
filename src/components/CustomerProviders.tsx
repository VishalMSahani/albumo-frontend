"use client";
import type { ReactNode } from "react";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { ContactProvider } from "@/features/contact/ContactProvider";
export default function CustomerProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ContactProvider>{children}</ContactProvider>
    </AuthProvider>
  );
}
