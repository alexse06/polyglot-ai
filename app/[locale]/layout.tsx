import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { SFXProvider } from "@/hooks/use-sfx";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MyCanadaRP",
  description: "Maîtrisez les langues avec l'IA.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MyCanadaRP",
  },
  icons: {
    icon: "/polyglot-icon.png",
    apple: "/polyglot-icon-512.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};


export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages(); // Keep getMessages for server component

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-950 text-white transition-colors duration-300`} suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SFXProvider>
            {children}
          </SFXProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
