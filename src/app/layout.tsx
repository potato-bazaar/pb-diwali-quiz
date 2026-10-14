import type { Metadata, Viewport } from "next";
import { Lato, Nunito } from "next/font/google";
import { MobileScreen } from "@/components/mobile-screen";
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
      className={`${lato.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        <MobileScreen>{children}</MobileScreen>
      </body>
    </html>
  );
}
