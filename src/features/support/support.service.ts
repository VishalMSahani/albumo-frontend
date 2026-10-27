import { api } from "@/lib/api-client";
import type {
  CreateTicketPayload,
  KnowledgeArticle,
  KnowledgeArticleSummary,
  SupportTicket,
} from "./types";
export const supportApi = {
  getArticles: (search = "", category = "") =>
    api.get<KnowledgeArticleSummary[]>(
      "/api/support/knowledge-base?" + new URLSearchParams({ search, category }),
    ),
  getArticle: (slug: string) =>
    api.get<KnowledgeArticle>("/api/support/knowledge-base/" + encodeURIComponent(slug)),
  createTicket: (body: CreateTicketPayload) =>
    api.post<SupportTicket>("/api/support/tickets", body),
  getMyTickets: () => api.get<SupportTicket[]>("/api/support/tickets/my"),
  trackTicket: (number: string, email?: string) =>
    api.post<SupportTicket>(
      "/api/support/tickets/" + encodeURIComponent(number) + "/track",
      email ? { email } : {},
    ),
  reply: (number: string, message: string, email?: string) =>
    api.post<SupportTicket>(
      "/api/support/tickets/" + encodeURIComponent(number) + "/messages",
      { message, ...(email ? { email } : {}) },
    ),
};
export function rememberTicket(number: string, email: string) {
  try {
    sessionStorage.setItem("albumo-ticket-" + number.toUpperCase(), email);
  } catch {
    /* Manual email entry remains available. */
  }
}
export function rememberedEmail(number: string) {
  try {
    return sessionStorage.getItem("albumo-ticket-" + number.toUpperCase()) || "";
  } catch {
    return "";
  }
}
