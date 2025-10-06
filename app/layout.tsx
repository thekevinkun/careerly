import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import Providers from "./providers";
import "@/styles/globals.css";

import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-poppins",
});

export const viewport = {
  theme_color: "#008080",
};

export const metadata: Metadata = {
  title: "Careerly",
  description: "Track and organize your job applications with ease. Careerly helps you stay focused, monitor progress, and land your next role faster.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    other: [
      {
        rel: "icon",
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        rel: "icon",
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
  manifest: "/site.webmanifest",

  openGraph: {
    title: "Careerly",
    description: "Track and organize your job applications with ease. Careerly helps you stay focused, monitor progress, and land your next role faster.",
    url: "https://yourdomain.com", // <-- replace with real domain later
    siteName: "Careerly",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Careerly – Track your job applications",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Careerly",
    description: "Track and organize your job applications with ease. Careerly helps you stay focused, monitor progress, and land your next role faster.",
    images: ["/og-image.png"],
  },
};
 
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
