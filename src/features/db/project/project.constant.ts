export const PROJECT_STATUS_MESSAGES = {
  OK: "ok",
  NOT_AUTHORIZED: "user not authorized",
  UNKNOWN: "unknown",
  INVALID_REQUEST: "invalid request",
} as const;

export type ProjectStatusMessage =
  (typeof PROJECT_STATUS_MESSAGES)[keyof typeof PROJECT_STATUS_MESSAGES];
