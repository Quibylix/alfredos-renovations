import { AppRoutes } from "@/features/shared/app-routes.util";
import { useForm } from "@mantine/form";
import { getValidators } from "./validators.util";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { notifications } from "@mantine/notifications";
import { APIResponse as LoginAPIResponse } from "@/app/api/v1/auth/login/route";
import { useRouter } from "@bprogress/next/app";
import { USER_STATUS_MESSAGES } from "@/features/db/user/user.constant";

export function useLoginForm() {
  const t = useTranslations("login");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      username: "",
      password: "",
    },
    validate: getValidators(t),
  });

  async function handleSubmit(values: { username: string; password: string }) {
    setError(null);
    setLoading(true);

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    };

    fetch(AppRoutes.getRoute("API_LOGIN"), options)
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
      })
      .finally(() => {
        setLoading(false);
      });

    function handleApiResponse(res: LoginAPIResponse) {
      if (res.success) {
        return handleSuccessResponse();
      }

      if (res.errorCode === USER_STATUS_MESSAGES.INVALID_CREDENTIALS) {
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
      router.push("/");
      router.refresh();
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

  return { form, submitHandler: form.onSubmit(handleSubmit), error, loading };
}
