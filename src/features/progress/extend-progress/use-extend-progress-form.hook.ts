import { useForm } from "@mantine/form";
import { getValidators } from "./validators.util";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { notifications } from "@mantine/notifications";
import { APIResponse as ProgressAPIResponse } from "@/app/api/v1/progress/extend/route";
import { ERROR_CODES as EXTEND_PROGRESS_API_ERROR_CODES } from "./error_codes.constant";
import { useRouter } from "@bprogress/next/app";
import { AppRoutes } from "@/features/shared/app-routes.util";

export function useExtendProgressForm(projectId: number, parentId: number) {
  const t = useTranslations("extendProgress");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [imageURL, setImageURL] = useState<string | null>(null);

  const router = useRouter();

  const form = useForm<{
    title: string;
    description: string;
  }>({
    mode: "uncontrolled",
    initialValues: {
      title: "",
      description: "",
    },
    validate: getValidators(t),
  });

  async function handleSubmit(values: { title: string; description: string }) {
    setError(null);
    setLoading(true);

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...values,
        imageUrl: imageURL,
        projectId,
        parentId,
      }),
    };

    fetch(AppRoutes.getRoute("API_EXTEND_PROGRESS"), options)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        return response.json();
      })
      .then((res: ProgressAPIResponse) => handleApiResponse(res))
      .catch((error) => {
        console.error("Error:", error);
        handleUnknownError();
      })
      .finally(() => {
        setLoading(false);
      });

    function handleApiResponse(res: ProgressAPIResponse) {
      if (res.success) {
        return handleSuccessResponse();
      }

      if (res.errorCode === EXTEND_PROGRESS_API_ERROR_CODES.INVALID_REQUEST) {
        return handleInvalidRequest();
      }

      if (res.errorCode === EXTEND_PROGRESS_API_ERROR_CODES.NOT_AUTHORIZED) {
        return handleNotAuthorized();
      }

      handleUnknownError();
    }

    function handleSuccessResponse() {
      notifications.show({
        title: t("success"),
        message: t("api.message.success"),
      });
      form.reset();
      router.push(AppRoutes.getRoute("PROGRESS", { id: parentId.toString() }));
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

    function handleNotAuthorized() {
      setError(t("api.message.notAuthorized"));
      notifications.show({
        title: t("error"),
        message: t("api.message.notAuthorized"),
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

  function changeImageURL(url: string | null) {
    setImageURL(url);
  }

  return {
    form,
    submitHandler: form.onSubmit(handleSubmit),
    imageURL,
    changeImageURL,
    error,
    loading,
  };
}
