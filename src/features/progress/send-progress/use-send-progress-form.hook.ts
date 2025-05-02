import { API_ROUTES } from "@/features/shared/api.constant";
import { useForm } from "@mantine/form";
import { getValidators } from "./validators.util";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { notifications } from "@mantine/notifications";
import { APIResponse as ProgressAPIResponse } from "@/app/api/v1/progress/route";
import { ERROR_CODES as SEND_PROGRESS_API_ERROR_CODES } from "./error_codes.constant";
import { useRouter } from "@bprogress/next/app";

export function useSendProgressForm() {
  const t = useTranslations("sendProgress");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [imageURL, setImageURL] = useState<string | null>(null);

  const router = useRouter();

  const form = useForm<{
    projectId: string;
    title: string;
    description: string;
  }>({
    mode: "uncontrolled",
    initialValues: {
      projectId: "",
      title: "",
      description: "",
    },
    validate: getValidators(t),
  });

  async function handleSubmit(values: {
    projectId: string;
    title: string;
    description: string;
  }) {
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
        projectId: Number(values.projectId),
      }),
    };

    fetch(API_ROUTES.SEND_PROGRESS, options)
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

      if (res.errorCode === SEND_PROGRESS_API_ERROR_CODES.INVALID_REQUEST) {
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
      router.push("/");
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
