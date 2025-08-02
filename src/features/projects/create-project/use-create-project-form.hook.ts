import { useForm } from "@mantine/form";
import { getValidators } from "./validators.util";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { notifications } from "@mantine/notifications";
import { createProjectApiResponseSchema } from "@/app/api/v1/projects/schemas";
import { useRouter } from "@bprogress/next/app";
import { AppRoutes } from "@/features/shared/routes/app-routes.util";
import { ApiResponseRetriever } from "@/features/shared/routes/api-routes.util";
import z from "zod";
import { STATUS_MESSAGES } from "@/features/shared/app-errors/status-messages.constant";

export function useCreateProjectForm() {
  const t = useTranslations("createProject");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      title: "",
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
      body: JSON.stringify(values),
    };

    try {
      const response = await new ApiResponseRetriever(
        AppRoutes.getRoute("API_CREATE_PROJECT"),
        options,
      ).retrieve(createProjectApiResponseSchema);
      handleApiResponse(response);
    } catch (error) {
      console.error("Error:", error);
      return handleUnknownError();
    } finally {
      setLoading(false);
    }

    function handleApiResponse(
      res: z.infer<typeof createProjectApiResponseSchema>,
    ) {
      if (res.success) {
        return handleSuccessResponse();
      }

      if (res.status === STATUS_MESSAGES.INVALID_REQUEST) {
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
      router.push(AppRoutes.getRoute("PROJECT_LIST"));
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
