import { API_ROUTES } from "@/features/shared/api.constant";
import { useForm } from "@mantine/form";
import { validators } from "./validators.util";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { notifications } from "@mantine/notifications";
import { ERROR_CODES as LOGIN_API_ERROR_CODES } from "@/features/auth/login/error_codes.constant";

export function useLoginForm() {
  const t = useTranslations("login");

  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      username: "",
      password: "",
    },
    validate: validators,
  });

  async function handleSubmit(values: { username: string; password: string }) {
    setError(null);

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    };

    fetch(API_ROUTES.LOGIN, options)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        return response.json();
      })
      .then((res: LoginAPIResponse) => handleApiResponse(res))
      .catch((error) => {
        console.error("Error:", error);
        handleUnknownError();
      });

    function handleApiResponse(res: LoginAPIResponse) {
      if (res.success) {
        return handleSuccessResponse();
      }

      if (res.errorCode === LOGIN_API_ERROR_CODES.INVALID_CREDENTIALS) {
        return handleInvalidCredentials();
      }

      handleUnknownError();
    }

    function handleSuccessResponse() {
      notifications.show({
        title: t("success"),
        message: t("api.message.success"),
      });
      form.reset();
    }

    function handleInvalidCredentials() {
      setError(t("api.message.invalidCredentials"));
      notifications.show({
        title: t("error"),
        message: t("api.message.invalidCredentials"),
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

  return { form, submitHandler: form.onSubmit(handleSubmit), error };
}
