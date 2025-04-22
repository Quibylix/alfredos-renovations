import messages from "@/features/i18n/messages/es.json";

const locales = ["es"] as const;

declare module "next-intl" {
  interface AppConfig {
    Locale: locales[number];
    Messages: typeof messages;
  }
}
