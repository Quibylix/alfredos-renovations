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
    dateRange: (value: [string | null, string | null]) => {
      if (!value[0] || !value[1]) return t("form.dateRange.isRequired");
      if (new Date(value[0]) > new Date(value[1])) {
        return t("form.dateRange.invalid");
      }
      if (new Date(value[0]) < new Date()) {
        return t("form.dateRange.pastDate");
      }
    },
    employees: (value: string[]) => {
      if (value.length === 0) return t("form.employees.isRequired");
    },
  };
}
