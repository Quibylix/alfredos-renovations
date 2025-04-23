import { useTranslations } from "next-intl";

export function getValidators(
  t: ReturnType<typeof useTranslations<"sendProgress">>,
) {
  return {
    title: (value: string) => {
      if (!value.trim()) return t("form.title.isRequired");
    },
    description: (value: string) => {
      if (!value.trim()) return t("form.description.isRequired");
    },
  };
}
