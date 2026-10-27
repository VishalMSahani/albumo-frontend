import type { Metadata } from "next";
import TicketList from "@/features/support/TicketList";
export const metadata: Metadata = {
  title: "Your conversations",
  robots: { index: false },
};
export default TicketList;
