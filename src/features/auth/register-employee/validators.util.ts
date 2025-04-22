import { useTranslations } from "next-intl";

export function getValidators(
  t: ReturnType<typeof useTranslations<"registerEmployee">>,
) {
  return {
    username: (value: string) => {
      if (value.trim().length < 3) {
        return t("form.username.minLength");
      }

      if (value.trim().length > 20) {
        return t("form.username.maxLength");
      }

      return null;
    },
    fullName: (value: string) => {
      if (value.trim().length < 3) {
        return t("form.fullName.minLength");
      }

      if (value.trim().length > 50) {
        return t("form.fullName.maxLength");
      }

      return null;
    },
    password: (value: string) => {
      if (value.length < 8) {
        return t("form.password.minLength");
      }

      if (value.length > 50) {
        return t("form.password.maxLength");
      }

      return null;
    },
    confirmPassword: (value: string, values: { password: string }) => {
      if (value !== values.password) {
        return t("form.confirmPassword.notMatch");
      }

      return null;
    },
  };
}
