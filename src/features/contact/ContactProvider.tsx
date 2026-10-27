"use client";
import { createContext, useContext, type ReactNode } from "react";
import { useResource } from "@/lib/use-resource";
import { getContactSettings, type ContactSettings } from "./contact.service";
type ContactState = {
  data?: ContactSettings;
  loading: boolean;
  error: string;
  reload: () => void;
};
const ContactContext = createContext<ContactState | null>(null);
export function ContactProvider({ children }: { children: ReactNode }) {
  const resource = useResource("contact-settings", getContactSettings);
  return <ContactContext.Provider value={resource}>{children}</ContactContext.Provider>;
}
export function useContact() {
  const context = useContext(ContactContext);
  if (!context) throw new Error("useContact requires ContactProvider");
  return context;
}
