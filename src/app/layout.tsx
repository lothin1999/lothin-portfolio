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
import type { ThemeColors, ThemeStyles } from "@/types/cv";

/**
 * Builds an inline CSS block that overrides design-token custom properties
 * for fonts, shadows, and light/dark theme colors.
 * Injected server-side so there is zero flash on first paint.
 */
function buildThemeStylesCss(colors?: ThemeColors, styles?: ThemeStyles): string {
  const fontDisplay = styles?.fontDisplay || `"Instrument Serif", Georgia, serif`;
  const fontBody = styles?.fontBody || `"DM Sans", system-ui, -apple-system, sans-serif`;
  const fontMono = styles?.fontMono || `"DM Mono", "JetBrains Mono", monospace`;
  const boxShadow = styles?.boxShadow || `0 10px 25px -5px rgba(0, 0, 0, 0.08)`;
  const cardRadius = styles?.borderRadius || `8px`;

  const colorParts = colors ? [
    `[data-theme="light"] {`,
    colors.light.accent      ? `  --accent: ${colors.light.accent};` : "",
    colors.light.accentOrange ? `  --accent-orange: ${colors.light.accentOrange};` : "",
    colors.light.bg          ? `  --bg: ${colors.light.bg};` : "",
    colors.light.surface     ? `  --surface: ${colors.light.surface};` : "",
    colors.light.ink         ? `  --ink: ${colors.light.ink};` : "",
    colors.light.ink2        ? `  --ink2: ${colors.light.ink2};` : "",
    colors.light.muted       ? `  --muted: ${colors.light.muted};` : "",
    `}`,
    `[data-theme="dark"] {`,
    colors.dark.accent      ? `  --accent: ${colors.dark.accent};` : "",
    colors.dark.accentOrange ? `  --accent-orange: ${colors.dark.accentOrange};` : "",
    colors.dark.bg          ? `  --bg: ${colors.dark.bg};` : "",
    colors.dark.surface     ? `  --surface: ${colors.dark.surface};` : "",
    colors.dark.ink         ? `  --ink: ${colors.dark.ink};` : "",
    colors.dark.ink2        ? `  --ink2: ${colors.dark.ink2};` : "",
    colors.dark.muted       ? `  --muted: ${colors.dark.muted};` : "",
    `}`,
  ].filter(Boolean).join("\n") : "";

  return [
    `:root {`,
    `  --font-display: ${fontDisplay};`,
    `  --font-body: ${fontBody};`,
    `  --font-mono: ${fontMono};`,
    `  --font-instrument: var(--font-display);`,
    `  --font-dm-sans: var(--font-body);`,
    `  --font-dm-mono: var(--font-mono);`,
    `  --box-shadow: ${boxShadow};`,
    `  --card-radius: ${cardRadius};`,
    colors?.light.accent ? `  --accent: ${colors.light.accent};` : "",
    colors?.light.accentOrange ? `  --accent-orange: ${colors.light.accentOrange};` : "",
    `}`,
    colorParts
  ].filter(Boolean).join("\n");
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

  // Build server-side styling CSS (fonts, shadows, colors)
  const colorCss = buildThemeStylesCss(cv.adminSettings?.themeColors, cv.adminSettings?.themeStyles);

  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Mono:wght@400;500&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Fira+Code:wght@400;500&family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500&family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap"
        />
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