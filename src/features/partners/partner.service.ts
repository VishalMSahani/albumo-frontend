import { api } from "@/lib/api-client";
import type { PartnerType } from "./partner-content";

export type PartnerInquiryBody = {
  partnerType: PartnerType;
  name: string;
  email: string;
  phone: string;
  companyName: string;
  website?: string;
  city: string;
  message: string;
  expectedVolume?: string;
  contactConsent: boolean;
  directoryConsent: boolean;
  companyFax: string;
};

export type PublicPartner = {
  id: string;
  partnerType: PartnerType;
  publicName: string;
  publicDescription: string;
  publicCity: string;
  publicWebsite: string;
};
export type PartnerDirectoryResult = {
  partners: PublicPartner[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export const submitPartnerInquiry = (body: PartnerInquiryBody) =>
  api.post<{ id: string; email: string }>("/api/partners/inquiries", body);

export function getPartnerDirectory(
  filters: { partnerType?: PartnerType; search?: string; page: number },
  signal: AbortSignal,
) {
  const params = new URLSearchParams({ page: String(filters.page) });
  if (filters.partnerType) params.set("partnerType", filters.partnerType);
  if (filters.search) params.set("search", filters.search);
  return api.get<PartnerDirectoryResult>("/api/partners/directory?" + params, { signal });
}
