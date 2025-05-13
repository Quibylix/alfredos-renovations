import { AppRoutes } from "@/features/shared/app-routes.util";
import { useForm } from "@mantine/form";
import { getValidators } from "./validators.util";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { notifications } from "@mantine/notifications";
import { APIResponse as ChangePasswordAPIResponse } from "@/app/api/v1/auth/change-password/route";
import { ERROR_CODES as CHANGE_PASSWORD_ERROR_CODES } from "./error_codes.constant";
import { useRouter } from "@bprogress/next/app";

export function useChangePasswordForm() {
  const t = useTranslations("changePassword");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validate: getValidators(t),
  });

  async function handleSubmit(values: {
    password: string;
    confirmPassword: string;
  }) {
    setError(null);
    setLoading(true);

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password: values.password }),
    };

    fetch(AppRoutes.getRoute("API_CHANGE_PASSWORD"), options)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        return response.json();
      })
      .then((res: ChangePasswordAPIResponse) => handleApiResponse(res))
      .catch((error) => {
        console.error("Error:", error);
        handleUnknownError();
      })
      .finally(() => {
        setLoading(false);
      });

    function handleApiResponse(res: ChangePasswordAPIResponse) {
      if (res.success) {
        return handleSuccessResponse();
      }

      if (res.errorCode === CHANGE_PASSWORD_ERROR_CODES.INVALID_REQUEST) {
        return handleInvalidRequest();
      }

      if (res.errorCode === CHANGE_PASSWORD_ERROR_CODES.NOT_AUTHORIZED) {
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

  return { form, submitHandler: form.onSubmit(handleSubmit), error, loading };
}
