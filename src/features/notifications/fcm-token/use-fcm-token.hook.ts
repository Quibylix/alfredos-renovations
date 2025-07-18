import { AppRoutes } from "@/features/shared/app-routes.util";
import { messaging } from "@/lib/firebase";
import { getToken, onMessage, Unsubscribe } from "firebase/messaging";
import { useEffect } from "react";

export function useFcmToken(isLogged: boolean) {
  useEffect(() => {
    const controller = new AbortController();

    const handleToken = async () => {
      const result = await Notification.requestPermission();

      if (result !== "granted") {
        return;
      }

      const currentToken = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_PUBLIC_VAPID_KEY,
      }).catch(() => {
        return null;
      });

      if (!currentToken) {
        return;
      }

      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fcmToken: currentToken,
        }),
        signal: controller.signal,
      };

      await fetch(AppRoutes.getRoute("API_INCLUDE_FCM_TOKEN"), options).catch(
        () => {
          return;
        },
      );
    };

    let unsubscribe: Unsubscribe | undefined;

    if (isLogged) {
      handleToken().then(() => {
        unsubscribe = onMessage(messaging, (payload) => {
          const options = {
            body: payload.data?.body ?? "You have a new notification",
            icon: "/icon-512.png",
          };

          new Notification(payload.data?.title ?? "Notification", options);
        });
      });
    }

    return () => {
      controller.abort("Component unmounted or isLogged changed");
      unsubscribe?.();
    };
  }, [isLogged]);
}
