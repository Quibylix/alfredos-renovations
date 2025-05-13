import { useForm } from "@mantine/form";
import { getValidators } from "./validators.util";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { notifications } from "@mantine/notifications";
import { APIResponse as RegisterEmployeeAPIResponse } from "@/app/api/v1/auth/register-employee/route";
import { ERROR_CODES as REGISTER_EMPLOYEE_API_ERROR_CODES } from "./error_codes.constant";
import { AppRoutes } from "@/features/shared/app-routes.util";

export function useRegisterEmployeeForm() {
  const t = useTranslations("registerEmployee");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      username: "",
      fullName: "",
      password: "",
      confirmPassword: "",
    },
    validate: getValidators(t),
  });

  async function handleSubmit(values: {
    username: string;
    fullName: string;
    password: string;
  }) {
    setError(null);
    setLoading(true);

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    };

    fetch(AppRoutes.getRoute("API_REGISTER_EMPLOYEE"), options)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        return response.json();
      })
      .then((res: RegisterEmployeeAPIResponse) => handleApiResponse(res))
      .catch((error) => {
        console.error("Error:", error);
        handleUnknownError();
      })
      .finally(() => {
        setLoading(false);
      });

    function handleApiResponse(res: RegisterEmployeeAPIResponse) {
      if (res.success) {
        return handleSuccessResponse();
      }

      if (
        res.errorCode === REGISTER_EMPLOYEE_API_ERROR_CODES.INVALID_CREDENTIALS
      ) {
        return handleInvalidCredentials();
      }

      if (res.errorCode === REGISTER_EMPLOYEE_API_ERROR_CODES.USERNAME_TAKEN) {
        return handleUsernameTaken();
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

    function handleUsernameTaken() {
      setError(t("api.message.usernameTaken"));
      notifications.show({
        title: t("error"),
        message: t("api.message.usernameTaken"),
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
