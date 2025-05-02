"use client";

import { APIResponse as LogoutAPIResponse } from "@/app/api/v1/auth/logout/route";
import { API_ROUTES } from "@/features/shared/api.constant";
import { notifications } from "@mantine/notifications";
import { useTranslations } from "next-intl";
import { useRouter } from "@bprogress/next/app";

export function useLogout() {
  const router = useRouter();
  const t = useTranslations("logout");

  function logout() {
    fetch(API_ROUTES.LOGOUT)
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
      router.push("/");
      router.refresh();
    }

    function handleUnkownError() {
      notifications.show({
        title: t("error"),
        message: t("api.message.unknown"),
        color: "red",
      });
      router.push("/");
      router.refresh();
    }
  }

  return { logout };
}
