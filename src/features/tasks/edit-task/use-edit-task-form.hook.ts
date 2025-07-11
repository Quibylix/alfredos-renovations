import { useForm } from "@mantine/form";
import { getValidators } from "./validators.util";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { notifications } from "@mantine/notifications";
import { EditTaskAPIResponse } from "@/app/api/v1/tasks/edit/route";
import { useRouter } from "@bprogress/next/app";
import { AppRoutes } from "@/features/shared/app-routes.util";
import { TaskData } from "@/features/db/task/task.types";
import { TASK_STATUS_MESSAGES } from "@/features/db/task/task.constant";

export function useEditTaskForm(taskData: TaskData) {
  const t = useTranslations("editTask");

  const [step, setStep] = useState<0 | 1 | 2>(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [media, setMedia] = useState<
    {
      type: "image" | "video";
      url: string;
    }[]
  >(taskData.media || []);

  const router = useRouter();

  const dateRange = [
    new Date(taskData.startDate).toLocaleDateString("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }),
    new Date(taskData.endDate).toLocaleDateString("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }),
  ] as [string, string];

  const form = useForm<{
    projectId: string | null;
    title: string;
    description: string;
    dateRange: [string | null, string | null];
    employees: string[];
  }>({
    mode: "uncontrolled",
    initialValues: {
      projectId: taskData.project.id.toString(),
      title: taskData.title,
      description: taskData.description,
      dateRange: dateRange,
      employees: taskData.employees.map((employee) => employee.id),
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

    const startDate = new Date(values.dateRange[0] + "T00:00:00.000");
    const endDate = new Date(values.dateRange[1] + "T23:59:59.999");

    const newEmployees = values.employees.filter(
      (employee) => !taskData.employees.some((e) => e.id === employee),
    );
    const removedEmployees = taskData.employees
      .filter((employee) => !values.employees.includes(employee.id))
      .map((employee) => employee.id);

    const newMedia = media.filter(
      (m) => !taskData.media.some((existing) => existing.url === m.url),
    );
    const removedMedia = taskData.media
      .filter((m) => !media.some((newM) => newM.url === m.url))
      .map((m) => m.id);

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...values,
        startDate,
        endDate,
        projectId: Number(values.projectId!),
        taskId: taskData.id,
        newEmployees,
        removedEmployees,
        newMedia,
        removedMedia,
      }),
    };

    fetch(AppRoutes.getRoute("API_EDIT_TASK"), options)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        return response.json();
      })
      .then((res: EditTaskAPIResponse) => handleApiResponse(res))
      .catch((error) => {
        console.error("Error:", error);
        handleUnknownError();
      })
      .finally(() => {
        setLoading(false);
      });

    function handleApiResponse(res: EditTaskAPIResponse) {
      if (res.success) {
        return handleSuccessResponse();
      }

      if (res.status === TASK_STATUS_MESSAGES.INVALID_REQUEST) {
        return handleInvalidRequest();
      }

      if (res.status === TASK_STATUS_MESSAGES.NOT_AUTHORIZED) {
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
      router.push(AppRoutes.getRoute("TASK", { id: taskData.id.toString() }));
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
      router.push(AppRoutes.getRoute("LOGIN"));
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
