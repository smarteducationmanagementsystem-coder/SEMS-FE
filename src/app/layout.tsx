import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, JetBrains_Mono } from "next/font/google";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteShell } from "@/components/layout/site-shell";
import { JsonLd } from "@/components/seo/json-ld";
import { seoConfig } from "@/config/seo";
import { siteConfig } from "@/config/site";
import { buildOrganizationSchema, buildWebsiteSchema } from "@/lib/structured-data";
import { siteThemeBootScript } from "@/components/layout/site-theme-vars";
import { SiteThemeProvider } from "@/components/layout/site-theme";
import { AdminProvider } from "@/components/institution/campus-state";
import { SmoothScrollProvider } from "@/providers/smooth-scroll-provider";
import "./globals.css";

// Typography follows the Parish reference: Bricolage Grotesque for display type,
// Geist for reading text and JetBrains Mono for small technical labels.
const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: seoConfig.defaultTitle, template: seoConfig.titleTemplate },
  description: seoConfig.defaultDescription,
  applicationName: siteConfig.name,
  keywords: [...seoConfig.keywords],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    url: "/",
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
    images: [seoConfig.defaultOgImage],
  },
  twitter: {
    card: "summary_large_image",
    site: seoConfig.twitterHandle,
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
    images: [seoConfig.defaultOgImage.url],
  },
};

export const viewport: Viewport = {
  themeColor: "#f6f2e9",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang={siteConfig.language} suppressHydrationWarning className={`${bricolageGrotesque.variable} ${geist.variable} ${jetbrainsMono.variable} antialiased`}>
      <body className="flex min-h-dvh w-full min-w-0 flex-col overflow-x-clip">
        <script id="sems-site-theme">{siteThemeBootScript()}</script>
        <SiteThemeProvider>
        <AdminProvider>
        <a
          href="#main-content"
          className="sr-only z-[60] rounded-full bg-ink px-4 py-2 text-ivory focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <SmoothScrollProvider />
        <SiteShell announcement={<AnnouncementBar />} header={<SiteHeader />} footer={<SiteFooter />}>
          {children}
        </SiteShell>
        <JsonLd data={[buildOrganizationSchema(), buildWebsiteSchema()]} />
        </AdminProvider>
        </SiteThemeProvider>
      </body>
    </html>
  );
}
