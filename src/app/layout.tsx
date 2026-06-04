import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter, JetBrains_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getLocaleFromCookieValue, type Locale } from "@/lib/i18n/config";
import { getCurrentUser } from "@/lib/session";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const bebas = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono-fallback",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "3X3 Unites — Welcome to the Festival",
  description:
    "Gamification platform for the 3X3 Unites World Tour weekend. Explore the festival grounds, complete the Main Quest, earn points and win festival rewards.",
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const locale: Locale = getLocaleFromCookieValue(
    cookieStore.get("locale")?.value
  );
  const user = await getCurrentUser();

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${bebas.variable} ${mono.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col bg-brand-black text-brand-white"
        style={{
          paddingLeft: "env(safe-area-inset-left)",
          paddingRight: "env(safe-area-inset-right)",
        }}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded focus:bg-brand-green focus:px-3 focus:py-2 focus:text-brand-black"
        >
          Skip to content
        </a>
        <SiteHeader locale={locale} user={user} />
        <main id="main-content" className="flex-1 flex flex-col">
          {children}
        </main>
        <SiteFooter locale={locale} />
      </body>
    </html>
  );
}
