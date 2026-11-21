import type { Metadata } from "next";
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
import { getCVData, sanitizeCVForVisitor } from "@/lib/cvStore";
import { buildMetadata, personJsonLd, websiteJsonLd, faqJsonLd } from "@/lib/seo";
import { CVContentWrapper } from "@/components/layout/CVContentWrapper";
import type { ThemeColors } from "@/types/cv";

/**
 * Builds an inline CSS block that overrides design-token custom properties
 * for light and dark themes based on admin-saved colors from Cloudflare R2.
 * Injected server-side so there is zero flash on first paint.
 */
function buildThemeColorsCss(colors: ThemeColors): string {
  const { light: l, dark: d } = colors;
  return [
    `[data-theme="light"] {`,
    l.accent      ? `  --accent: ${l.accent};` : "",
    l.accentOrange ? `  --accent-orange: ${l.accentOrange};` : "",
    l.bg          ? `  --bg: ${l.bg};` : "",
    l.surface     ? `  --surface: ${l.surface};` : "",
    l.ink         ? `  --ink: ${l.ink};` : "",
    l.ink2        ? `  --ink2: ${l.ink2};` : "",
    l.muted       ? `  --muted: ${l.muted};` : "",
    `}`,
    `[data-theme="dark"] {`,
    d.accent      ? `  --accent: ${d.accent};` : "",
    d.accentOrange ? `  --accent-orange: ${d.accentOrange};` : "",
    d.bg          ? `  --bg: ${d.bg};` : "",
    d.surface     ? `  --surface: ${d.surface};` : "",
    d.ink         ? `  --ink: ${d.ink};` : "",
    d.ink2        ? `  --ink2: ${d.ink2};` : "",
    d.muted       ? `  --muted: ${d.muted};` : "",
    `}`,
    // Also override :root for system-default (before next-themes sets data-theme)
    `:root {`,
    l.accent      ? `  --accent: ${l.accent};` : "",
    l.accentOrange ? `  --accent-orange: ${l.accentOrange};` : "",
    `}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export const dynamic = "force-dynamic";
export const runtime = "edge";

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
  const initialCvData = sanitizeCVForVisitor(cv);

  const jsonLdList = [personJsonLd(initialCvData), websiteJsonLd(), faqJsonLd()];
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  // Build server-side color CSS if admin has saved custom colors
  const themeColors = cv.adminSettings?.themeColors;
  const colorCss = themeColors ? buildThemeColorsCss(themeColors) : null;

  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdList) }}
        />
        {/* Inject admin-controlled color overrides before any other CSS */}
        {colorCss && (
          <style
            id="admin-theme-colors"
            dangerouslySetInnerHTML={{ __html: colorCss }}
          />
        )}
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
          <CVProvider initialData={initialCvData}>
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