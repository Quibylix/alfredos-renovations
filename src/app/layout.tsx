import "@mantine/core/styles.css";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MantineProvider } from "@mantine/core";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Alfredo's Renovations",
  description:
    "Alfredo's Renovations is your trusted partner for high-quality home remodeling and renovation services. From kitchens and bathrooms to complete home makeovers, we bring craftsmanship, reliability, and a personalized touch to every project. Serving residential clients with a passion for detail and design—transform your home with Alfredo’s expert renovations today!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <MantineProvider>{children}</MantineProvider>
      </body>
    </html>
  );
}
