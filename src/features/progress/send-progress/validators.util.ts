import { useTranslations } from "next-intl";

export function getValidators(
  t: ReturnType<typeof useTranslations<"sendProgress">>,
) {
  return {
    projectId: (value: string) => {
      if (!value.trim()) return t("form.project.isRequired");
      if (isNaN(Number(value))) return t("form.project.isRequired");
      if (Number(value) <= 0) return t("form.project.isRequired");
    },
    title: (value: string) => {
      if (!value.trim()) return t("form.title.isRequired");
    },
    description: (value: string) => {
      if (!value.trim()) return t("form.description.isRequired");
    },
  };
}
