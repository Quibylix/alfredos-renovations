export const NOTIFICATION_STATUS_MESSAGES = {
  OK: "ok",
  NOT_AUTHORIZED: "user not authorized",
  UNKNOWN: "unknown",
  INVALID_REQUEST: "invalid request",
} as const;

export type NotificationStatusMessage =
  (typeof NOTIFICATION_STATUS_MESSAGES)[keyof typeof NOTIFICATION_STATUS_MESSAGES];
