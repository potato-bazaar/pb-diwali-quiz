import type { Metadata, Viewport } from "next";
import { Baloo_2, Lato, Nunito, Playfair_Display, Yatra_One } from "next/font/google";
import { LanguageProvider } from "@/components/language-provider";
import { MobileScreen } from "@/components/mobile-screen";
import { SessionCapture } from "@/components/session-capture";
import "./globals.css";

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin", "devanagari"],
  weight: ["500", "600", "700", "800"],
});

const yatra = Yatra_One({
  variable: "--font-yatra",
  subsets: ["latin", "devanagari"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Potato Bazaar Diwali Quiz",
  description: "Simple questions. Big rewards.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Diwali Quiz",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#FFF6EA",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${lato.variable} ${nunito.variable} ${playfair.variable} ${baloo.variable} ${yatra.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        <SessionCapture />
        <LanguageProvider>
          <MobileScreen>{children}</MobileScreen>
        </LanguageProvider>
      </body>
    </html>
  );
}
