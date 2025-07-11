import { useForm } from "@mantine/form";
import { getValidators } from "./validators.util";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { notifications } from "@mantine/notifications";
import { APIResponse as TaskAPIResponse } from "@/app/api/v1/tasks/route";
import { ERROR_CODES as SET_TASK_API_ERROR_CODES } from "./error_codes.constant";
import { useRouter } from "@bprogress/next/app";
import { AppRoutes } from "@/features/shared/app-routes.util";

export function useSetTaskForm() {
  const t = useTranslations("setTask");

  const [step, setStep] = useState<0 | 1 | 2>(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [media, setMedia] = useState<
    {
      type: "image" | "video";
      url: string;
    }[]
  >([]);

  const router = useRouter();

  const form = useForm<{
    projectId: string | null;
    title: string;
    description: string;
    dateRange: [string | null, string | null];
    employees: string[];
  }>({
    mode: "uncontrolled",
    initialValues: {
      projectId: null,
      title: "",
      description: "",
      dateRange: [null, null],
      employees: [],
    },
    validate: getValidators(t, step),
  });

  const nextStep = () =>
    setStep((current) => {
      if (form.validate().hasErrors) {
        return current;
      }
      return (current < 2 ? current + 1 : current) as 0 | 1 | 2;
    });

  const prevStep = () =>
    setStep((current) => (current > 0 ? current - 1 : current) as 0 | 1 | 2);

  async function handleSubmit(values: {
    projectId: string | null;
    title: string;
    description: string;
    dateRange: [string | null, string | null];
    employees: string[];
  }) {
    setError(null);
    setLoading(true);

    const startDate = new Date(
      values.dateRange[0] + "T00:00:00.000",
    ).toISOString();
    const endDate = new Date(
      values.dateRange[1] + "T23:59:59.999",
    ).toISOString();

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...values,
        media,
        startDate,
        endDate,
        employees: values.employees,
        projectId: Number(values.projectId!),
      }),
    };

    fetch(AppRoutes.getRoute("API_SET_TASK"), options)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        return response.json();
      })
      .then((res: TaskAPIResponse) => handleApiResponse(res))
      .catch((error) => {
        console.error("Error:", error);
        handleUnknownError();
      })
      .finally(() => {
        setLoading(false);
      });

    function handleApiResponse(res: TaskAPIResponse) {
      if (res.success) {
        return handleSuccessResponse();
      }

      if (res.errorCode === SET_TASK_API_ERROR_CODES.INVALID_REQUEST) {
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
      router.push(AppRoutes.getRoute("TASK_LIST"));
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
    step: {
      value: step,
      nextStep,
      prevStep,
    },
    addMedia,
    removeMedia,
    error,
    loading,
  };
}
