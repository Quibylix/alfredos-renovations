import { useTranslations } from "next-intl";

export function getValidators(t: ReturnType<typeof useTranslations<"login">>) {
  return {
    username: (value: string) => {
      if (!value.trim()) return t("form.username.isRequired");
    },
    password: (value: string) => {
      if (!value) return t("form.password.isRequired");
    },
  };
}
