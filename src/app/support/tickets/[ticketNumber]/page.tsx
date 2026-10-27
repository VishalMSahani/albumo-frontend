import type { Metadata } from "next";
import TicketDetail from "@/features/support/TicketDetail";
export const metadata: Metadata = {
  title: "Support conversation",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};
export default async function Page({
  params,
}: {
  params: Promise<{ ticketNumber: string }>;
}) {
  const { ticketNumber } = await params;
  return <TicketDetail number={ticketNumber} />;
}
