export const TASK_STATUS_MESSAGES = {
  OK: "ok",
  NOT_AUTHORIZED: "user not authorized",
  UNKNOWN: "unknown",
  INVALID_REQUEST: "invalid request",
} as const;

export type TaskStatusMessage =
  (typeof TASK_STATUS_MESSAGES)[keyof typeof TASK_STATUS_MESSAGES];
