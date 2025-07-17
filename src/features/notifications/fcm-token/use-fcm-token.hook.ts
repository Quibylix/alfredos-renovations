import { AppRoutes } from "@/features/shared/app-routes.util";
import { messaging } from "@/lib/firebase";
import { getToken } from "firebase/messaging";
import { useEffect } from "react";

export function useFcmToken(isLogged: boolean) {
  useEffect(() => {
    const controller = new AbortController();

    const handleToken = async () => {
      const currentToken = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_PUBLIC_VAPID_KEY,
      }).catch((err) => {
        console.error("An error occurred while retrieving token. ", err);
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
        (error) => {
          if (controller.signal.aborted) {
            return;
          }

          console.error("Error sending FCM token:", error);
        },
      );
    };

    if (isLogged) {
      handleToken();
    }

    return () => {
      controller.abort("Component unmounted or isLogged changed");
    };
  }, []);
}
