import { useForm } from "@mantine/form";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { notifications } from "@mantine/notifications";
import { APIResponse as MessageAPIResponse } from "@/app/api/v1/messages/send/route";
import { ERROR_CODES as SEND_MESSAGE_API_ERROR_CODES } from "./error_codes.constant";
import { useRouter } from "@bprogress/next/app";
import { AppRoutes } from "@/features/shared/routes/app-routes.util";

export function useSendMessageForm(taskId: number) {
  const t = useTranslations("sendMessage");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [media, setMedia] = useState<
    { type: "image" | "video"; url: string }[]
  >([]);

  const router = useRouter();

  const form = useForm<{
    content: string;
  }>({
    mode: "uncontrolled",
    initialValues: {
      content: "",
    },
  });

  async function handleSubmit(values: { content: string }) {
    setError(null);
    setLoading(true);

    if (!values.content.trim() && media.length === 0) {
      setError(t("api.message.noData"));
      notifications.show({
        title: t("error"),
        message: t("api.message.noData"),
        color: "red",
      });
      setLoading(false);
      return;
    }

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...values,
        media,
        taskId,
      }),
    };

    fetch(AppRoutes.getRoute("API_SEND_MESSAGE"), options)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        return response.json();
      })
      .then((res: MessageAPIResponse) => handleApiResponse(res))
      .catch((error) => {
        console.error("Error:", error);
        handleUnknownError();
      })
      .finally(() => {
        setLoading(false);
      });

    function handleApiResponse(res: MessageAPIResponse) {
      if (res.success) {
        return handleSuccessResponse();
      }

      if (res.errorCode === SEND_MESSAGE_API_ERROR_CODES.INVALID_REQUEST) {
        return handleInvalidRequest();
      }

      if (res.errorCode === SEND_MESSAGE_API_ERROR_CODES.NOT_AUTHORIZED) {
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
      router.push(AppRoutes.getRoute("TASK", { id: taskId.toString() }));
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

  function addMedia(type: "image" | "video", url: string) {
    setMedia((prev) => [...prev, { type, url }]);
  }

  function removeMedia(index: number) {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  }

  return {
    form,
    submitHandler: form.onSubmit(handleSubmit),
    media,
    addMedia,
    removeMedia,
    error,
    loading,
  };
}
