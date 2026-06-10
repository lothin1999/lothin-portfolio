import type { Metadata } from "next";
import { DM_Sans, DM_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CVProvider } from "@/hooks/useCVData";
import { ThemeProvider } from "@/hooks/useTheme";
import { AdminButton } from "@/components/admin/AdminButton";
import { getCVData } from "@/lib/cvStore";
import { buildMetadata, personJsonLd } from "@/lib/seo";
import { CVContentWrapper } from "@/components/layout/CVContentWrapper";

export const dynamic = "force-dynamic";
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});
export async function generateMetadata(): Promise<Metadata> {
  const cv = await getCVData();
  return buildMetadata(cv);
}
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cv = await getCVData();
  const jsonLd = personJsonLd(cv);

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${dmSans.variable} ${dmMono.variable} ${instrumentSerif.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>

      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-[999] focus:bg-accent focus:text-white focus:px-4 focus:py-2 focus:text-sm"
        >
          Skip to content
        </a>
        <ThemeProvider>
          <CVProvider>
            <CVContentWrapper>
              <Navbar />
              <main id="main">{children}</main>
              <Footer />
              <AdminButton />
            </CVContentWrapper>
          </CVProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}