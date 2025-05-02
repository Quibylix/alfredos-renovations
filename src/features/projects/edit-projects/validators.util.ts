import { useTranslations } from "next-intl";

export function getValidators(
  t: ReturnType<typeof useTranslations<"createProject">>,
) {
  return {
    title: (value: string) => {
      if (!value.trim()) return t("form.title.isRequired");
    },
  };
}
