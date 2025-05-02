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
import { getUserRole } from "@/features/auth/protected-routes/get-user-role.util";
import { createClient } from "@/features/db/supabase/create-server-client.util";
import { ProgressProvider } from "@/features/ui/progress-provider.component";

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
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  const db = await createClient();
  const userId = (await db.auth.getUser()).data.user?.id ?? null;
  const role = await getUserRole(userId, db);

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
