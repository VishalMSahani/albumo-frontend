import type { Metadata, Viewport } from "next";
import AnnouncementBar from "@/components/AnnouncementBar";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import CustomerProviders from "@/components/CustomerProviders";
import MarketingExperience from "@/components/MarketingExperience";
import CookieConsent from "@/features/legal/CookieConsent";
import { CDN_ORIGIN, cdnImageUrl } from "@/lib/cdn";
import "./globals.css";
import { getCatalogueCategories } from "@/lib/catalogue";

export const metadata: Metadata = {
  icons: { icon: cdnImageUrl("/Albumo Text Logo.png") },
  title: { default: "Albumo — Good times. Yours to keep.", template: "%s | Albumo" },
  description:
    "Photo books, prints and personal keepsakes for a life well lived. Turn your travels, celebrations and everyday moments into something you can hold.",
  openGraph: {
    title: "Albumo — Good times. Yours to keep.",
    description: "Photo books and keepsakes for the stories you want to keep.",
    type: "website",
    locale: "en_IN",
  },
};
export const dynamic = "force-dynamic";

export const viewport: Viewport = { themeColor: "#ffffff" };

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const categories = await getCatalogueCategories();
  const navigation = categories.map(({ id, name }) => ({ id, name }));
  return (
    <html
      data-scroll-behavior="smooth"
      lang="en"
      className="scroll-pt-[110px] scroll-smooth motion-reduce:scroll-auto"
    >
      <head>
        <link rel="preconnect" href={CDN_ORIGIN} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-white font-sans text-base leading-[1.65] text-ink antialiased selection:bg-rose selection:text-ink [&_:focus-visible]:outline-2 [&_:focus-visible]:outline-offset-4 [&_:focus-visible]:outline-berry">
        <a
          href="#main-content"
          className="fixed top-3 left-3 z-50 -translate-y-[150%] bg-ink px-5 py-3 text-paper focus:translate-y-0"
        >
          Skip to content
        </a>
        <CustomerProviders>
          <AnnouncementBar />
          <Navbar categories={navigation} />
          <main id="main-content">
            <MarketingExperience>{children}</MarketingExperience>
          </main>
          <Footer categories={navigation} />
          <CookieConsent />
        </CustomerProviders>
      </body>
    </html>
  );
}
