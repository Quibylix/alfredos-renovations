import { useTranslations } from "next-intl";

export function getValidators(
  t: ReturnType<typeof useTranslations<"changePassword">>,
) {
  return {
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
