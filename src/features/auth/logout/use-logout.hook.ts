"use client";

import { APIResponse as LogoutAPIResponse } from "@/app/api/v1/auth/logout/route";
import { AppRoutes } from "@/features/shared/routes/app-routes.util";
import { notifications } from "@mantine/notifications";
import { useTranslations } from "next-intl";
import { useRouter } from "@bprogress/next/app";

export function useLogout() {
  const router = useRouter();
  const t = useTranslations("logout");

  function logout() {
    fetch(AppRoutes.getRoute("API_LOGOUT"))
      .then((res) => res.json())
      .then(handleRes)
      .catch((err) => {
        console.error("Error:", err);
        handleUnkownError();
      });

    function handleRes(res: LogoutAPIResponse) {
      if (res.success) {
        return handleSuccess();
      }

      handleUnkownError();
    }

    function handleSuccess() {
      notifications.show({
        title: t("success"),
        message: t("api.message.success"),
        color: "green",
      });
      router.push(AppRoutes.getRoute("LOGIN"));
      router.refresh();
    }

    function handleUnkownError() {
      notifications.show({
        title: t("error"),
        message: t("api.message.unknown"),
        color: "red",
      });
      router.push(AppRoutes.getRoute("LOGIN"));
      router.refresh();
    }
  }

  return { logout };
}
