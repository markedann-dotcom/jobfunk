import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
import { FavoritesProvider } from "@/lib/favorites";
import { ThemeProvider } from "@/lib/theme";
import { PwaProvider } from "@/lib/pwa";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ScrollTop } from "@/components/scroll-top";
import { MobileNav } from "@/components/mobile-nav";
import { PwaRegister } from "@/components/pwa-register";
import { CookieBanner } from "@/components/cookie-banner";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  variable: "--font-fraunces",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "JobFunke — Jobs in Deutschland kostenlos finden",
  description:
    "Kostenlose Jobsuche für Deutschland. Tausende Stellen, Ausbildungen und Minijobs aus der Jobbörse der Bundesagentur für Arbeit — einfach und übersichtlich.",
  keywords: [
    "Jobs Deutschland",
    "Jobsuche",
    "Bundesagentur für Arbeit",
    "Ausbildung",
    "Minijob",
    "робота в Німеччині",
  ],
  openGraph: {
    title: "JobFunke — Jobs in Deutschland kostenlos finden",
    description:
      "Kostenlose Jobsuche für Deutschland — einfach, übersichtlich, ohne Anmeldung.",
    type: "website",
  },
  manifest: "/manifest.webmanifest",
  applicationName: "JobFunke",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "JobFunke",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f97316" },
    { media: "(prefers-color-scheme: dark)", color: "#14110f" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className={`${fraunces.variable} ${manrope.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('jf_theme');if(!t){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}if(t==='dark'){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}}catch(e){}})();`,
          }}
        />
      </head>
      <body
        style={{
          fontFamily: "var(--font-manrope), ui-sans-serif, system-ui",
        }}
      >
        <div className="site-bg" aria-hidden />
        <ThemeProvider>
          <I18nProvider>
            <PwaProvider>
              <FavoritesProvider>
                <div className="mobile-nav-pad flex min-h-screen flex-col lg:[padding-bottom:0]">
                  <SiteHeader />
                  <main className="flex-1">{children}</main>
                  <SiteFooter />
                </div>
                <ScrollTop />
                <MobileNav />
                <PwaRegister />
                <CookieBanner />
              </FavoritesProvider>
            </PwaProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
