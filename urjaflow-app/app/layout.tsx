import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "UrjaFlow - Energy as a Service Platform",
  description: "Monitor and manage your renewable energy systems with real-time analytics and insights",
  keywords: ["energy", "solar", "renewable", "monitoring", "IoT"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "UrjaFlow",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "UrjaFlow",
    title: "UrjaFlow - Energy Management Platform",
    description: "Monitor and manage your renewable energy systems with real-time analytics",
  },
  twitter: {
    card: "summary_large_image",
    title: "UrjaFlow - Energy Management Platform",
    description: "Monitor and manage your renewable energy systems with real-time analytics",
  },
};

export const viewport: Viewport = {
  themeColor: "#10b981",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
