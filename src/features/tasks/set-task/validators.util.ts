import { useTranslations } from "next-intl";

export function getValidators(
  t: ReturnType<typeof useTranslations<"setTask">>,
  step: 0 | 1 | 2,
) {
  return {
    projectId: (value: string | null) => {
      if (step !== 0) return;
      if (!value?.trim()) return t("form.project.isRequired");
      if (isNaN(Number(value))) return t("form.project.isRequired");
      if (Number(value) <= 0) return t("form.project.isRequired");
    },
    title: (value: string) => {
      if (step !== 0) return;
      if (!value.trim()) return t("form.title.isRequired");
    },
    description: (value: string) => {
      if (step !== 0) return;
      if (!value.trim()) return t("form.description.isRequired");
    },
    dateRange: (value: [string | null, string | null]) => {
      if (step !== 1) return;
      if (!value[0] || !value[1]) return t("form.dateRange.isRequired");

      if (new Date(value[0]) > new Date(value[1])) {
        return t("form.dateRange.invalid");
      }

      const today = new Date();
      const endDate = new Date(value[1] + "T23:59:59.999");
      if (endDate < today) {
        return t("form.dateRange.pastDate");
      }
    },
    employees: (value: string[]) => {
      if (step !== 2) return;
      if (value.length === 0) return t("form.employees.isRequired");
    },
  };
}
