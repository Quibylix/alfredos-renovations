import { useForm } from "@mantine/form";
import { getValidators } from "./validators.util";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { notifications } from "@mantine/notifications";
import { APIResponse as EditProjectAPIResponse } from "@/app/api/v1/projects/edit/route";
import { useRouter } from "@bprogress/next/app";
import { AppRoutes } from "@/features/shared/app-routes.util";
import { PROJECT_STATUS_MESSAGES } from "@/features/db/project/project.constant";

export function useEditProjectForm({
  id,
  initialTitle,
}: {
  id: number;
  initialTitle: string;
}) {
  const t = useTranslations("editProject");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      title: initialTitle,
    },
    validate: getValidators(t),
  });

  async function handleSubmit(values: { title: string }) {
    setError(null);
    setLoading(true);

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        title: values.title,
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

      if (res.status === PROJECT_STATUS_MESSAGES.INVALID_REQUEST) {
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
