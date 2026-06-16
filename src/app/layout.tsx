import type { Metadata } from "next";
import { DM_Sans, DM_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CVProvider } from "@/hooks/useCVData";
import { ThemeProvider } from "@/hooks/useTheme";
import { SettingsProvider } from "@/components/layout/SettingsContext";
import { SmoothScrollProvider } from "@/components/layout/SmoothScrollProvider";
import { CustomCursor } from "@/components/layout/CustomCursor";
import { StatusBar } from "@/components/layout/StatusBar";
import { ShortcutsModal } from "@/components/layout/ShortcutsModal";
import { SettingsModal } from "@/components/layout/SettingsModal";
import { AIChatDrawer } from "@/components/layout/AIChatDrawer";
import { AdminButton } from "@/components/admin/AdminButton";
import { getCVData } from "@/lib/cvStore";
import { buildMetadata, personJsonLd } from "@/lib/seo";
import { CVContentWrapper } from "@/components/layout/CVContentWrapper";
import Script from "next/script";

export const dynamic = "force-dynamic";
export const runtime = "edge";
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
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

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
        {gaId && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}');
                `,
              }}
            />
          </>
        )}
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
            <SettingsProvider>
              <SmoothScrollProvider>
                <CVContentWrapper>
                  <CustomCursor />
                  <Navbar />
                  <main id="main">{children}</main>
                  <Footer />
                  <StatusBar />
                  <ShortcutsModal />
                  <SettingsModal />
                  <AIChatDrawer />
                  <AdminButton />
                </CVContentWrapper>
              </SmoothScrollProvider>
            </SettingsProvider>
          </CVProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}