import { useForm } from "@mantine/form";
import { getValidators } from "./validators.util";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { notifications } from "@mantine/notifications";
import { APIResponse as EditProjectAPIResponse } from "@/app/api/v1/progress/route";
import { ERROR_CODES as EDIT_PROJECT_API_ERROR_CODES } from "./error_codes.constant";
import { useRouter } from "@bprogress/next/app";
import { AppRoutes } from "@/features/shared/app-routes.util";

export function useEditProjectForm({
  id,
  initialTitle,
  initialEmployees,
}: {
  id: number;
  initialTitle: string;
  initialEmployees: string[];
}) {
  const t = useTranslations("editProject");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      title: initialTitle,
      employees: initialEmployees,
    },
    validate: getValidators(t),
  });

  async function handleSubmit(values: { title: string; employees: string[] }) {
    setError(null);
    setLoading(true);

    const removedEmployees = initialEmployees.filter(
      (employee) => !values.employees.includes(employee),
    );
    const addedEmployees = values.employees.filter(
      (employee) => !initialEmployees.includes(employee),
    );

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        title: values.title,
        removedEmployees,
        addedEmployees,
      }),
    };

    fetch(AppRoutes.getRoute("API_EDIT_PROJECT"), options)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        return response.json();
      })
      .then((res: EditProjectAPIResponse) => handleApiResponse(res))
      .catch((error) => {
        console.error("Error:", error);
        handleUnknownError();
      })
      .finally(() => {
        setLoading(false);
      });

    function handleApiResponse(res: EditProjectAPIResponse) {
      if (res.success) {
        return handleSuccessResponse();
      }

      if (res.errorCode === EDIT_PROJECT_API_ERROR_CODES.INVALID_REQUEST) {
        return handleInvalidRequest();
      }

      handleUnknownError();
    }

    function handleSuccessResponse() {
      notifications.show({
        title: t("success"),
        message: t("api.message.success"),
      });
      form.reset();
      router.push(AppRoutes.getRoute("PROJECT", { id: id.toString() }));
      router.refresh();
    }

    function handleInvalidRequest() {
      setError(t("api.message.invalidRequest"));
      notifications.show({
        title: t("error"),
        message: t("api.message.invalidRequest"),
        color: "red",
      });
    }

    function handleUnknownError() {
      setError(t("api.message.unknown"));
      notifications.show({
        title: t("error"),
        message: t("api.message.unknown"),
        color: "red",
      });
    }
  }

  return {
    form,
    submitHandler: form.onSubmit(handleSubmit),
    error,
    loading,
  };
}
