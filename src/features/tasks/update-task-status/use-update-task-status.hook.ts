import { UpdateTaskStatusAPIResponse } from "@/app/api/v1/tasks/status/route";
import { TASK_STATUS_MESSAGES } from "@/features/db/task/task.constant";
import { AppRoutes } from "@/features/shared/routes/app-routes.util";
import { notifications } from "@mantine/notifications";
import { useRouter } from "@bprogress/next/app";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function useUpdateTaskStatus(taskId: number) {
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const t = useTranslations("updateTaskStatus");

  function handleStatusChange(value: string) {
    setLoading(true);

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        taskId,
        completed: value === "completed",
      }),
    };

    fetch(AppRoutes.getRoute("API_UPDATE_TASK_STATUS"), options)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        return response.json();
      })
      .then((res: UpdateTaskStatusAPIResponse) => handleApiResponse(res))
      .catch((error) => {
        console.error("Error:", error);
        handleUnknownError();
      })
      .finally(() => {
        setLoading(false);
      });

    function handleApiResponse(res: UpdateTaskStatusAPIResponse) {
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
      router.refresh();
    }

    function handleInvalidRequest() {
      notifications.show({
        title: t("error"),
        message: t("api.message.invalidRequest"),
        color: "red",
      });
    }

    function handleNotAuthorized() {
      notifications.show({
        title: t("error"),
        message: t("api.message.notAuthorized"),
        color: "red",
      });
    }

    function handleUnknownError() {
      notifications.show({
        title: t("error"),
        message: t("api.message.unknown"),
        color: "red",
      });
    }
  }

  return { loading, handleStatusChange };
}
