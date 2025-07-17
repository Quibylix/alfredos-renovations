import {
  NOTIFICATION_STATUS_MESSAGES,
  NotificationStatusMessage,
} from "@/features/db/notification/notification.constant";
import { Notification } from "@/features/db/notification/notification.model";
import { NextRequest } from "next/server";
import z from "zod";

export type FCMTokenAPIResponse = {
  success: boolean;
  status: NotificationStatusMessage;
};

const bodySchema = z.object({
  fcmToken: z.string().trim().nonempty(),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsedBody = bodySchema.safeParse(body);

  if (!parsedBody.success) {
    return Response.json({
      success: false,
      status: NOTIFICATION_STATUS_MESSAGES.INVALID_REQUEST,
    });
  }

  const { fcmToken } = parsedBody.data;

  const status = await Notification.includeFCMToken(fcmToken).catch((error) => {
    console.error("Error including FCM token:", error);
    return NOTIFICATION_STATUS_MESSAGES.UNKNOWN;
  });

  if (status === NOTIFICATION_STATUS_MESSAGES.OK) {
    return Response.json({
      success: true,
      status: NOTIFICATION_STATUS_MESSAGES.OK,
    });
  }

  return Response.json({
    success: false,
    status,
  });
}
