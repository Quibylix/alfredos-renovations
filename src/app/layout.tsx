import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dropzone/styles.css";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";

import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { Notifications } from "@mantine/notifications";
import { mantineTheme } from "@/features/ui/theme";
import { BaseAppShell } from "@/features/ui/base-app-shell.component";
import { ProgressProvider } from "@/features/ui/progress-provider.component";
import { User } from "@/features/db/user/user.model";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("layout");

  return {
    title: t("title"),
    description: t("description"),
    manifest: "/manifest.json",
    icons: [
      {
        rel: "icon",
        type: "image/ico",
        sizes: "any",
        url: "/favicon-light.ico",
        media: "(prefers-color-scheme: light)",
      },
      {
        rel: "icon",
        type: "image/ico",
        sizes: "any",
        url: "/favicon-dark.ico",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  const role = await User.getRole();

  return (
    <html lang={locale} {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <NextIntlClientProvider locale="es">
          <ProgressProvider>
            <MantineProvider theme={mantineTheme} defaultColorScheme="auto">
              <Notifications />
              <BaseAppShell role={role}>{children}</BaseAppShell>
            </MantineProvider>
          </ProgressProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
