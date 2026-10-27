import type { KnowledgeCategory, TicketCategory, TicketStatus } from "./types";
export const ticketCategories: { value: TicketCategory; label: string }[] = [
  { value: "ORDER", label: "My order" },
  { value: "SHIPPING", label: "Delivery & tracking" },
  { value: "RETURNS_REFUNDS", label: "Returns & refunds" },
  { value: "PRODUCT", label: "Albums & prints" },
  { value: "TECHNICAL", label: "Website & account" },
  { value: "OTHER", label: "Something else" },
];
export const knowledgeCategories: { value: KnowledgeCategory; label: string }[] = [
  { value: "GENERAL", label: "Getting started" },
  { value: "PRODUCT", label: "Albums & prints" },
  { value: "SHIPPING", label: "Delivery" },
  { value: "RETURNS", label: "Returns" },
  { value: "TROUBLESHOOTING", label: "Account & website" },
];
export const statusLabels: Record<TicketStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  WAITING_FOR_CUSTOMER: "Waiting for you",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};
export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
