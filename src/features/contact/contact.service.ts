import { api } from "@/lib/api-client";
export type ContactSettings = {
  email: string;
  phone: string;
  whatsapp: string;
  hours: string;
  newsletterEnabled: boolean;
};
export type EnquiryReceipt = { ticketNumber: string; email: string };
export const getContactSettings = () => api.get<ContactSettings>("/api/contact/settings");
export const sendContactRequest = (body: Record<string, string | boolean>) =>
  api.post<EnquiryReceipt>("/api/contact/enquiries", body);
export const newsletterRequest = (
  action: "subscribe" | "manage" | "confirm" | "unsubscribe",
  body: Record<string, string | boolean>,
) => api.request<never>("/api/contact/newsletter/" + action, { method: "POST", body });
