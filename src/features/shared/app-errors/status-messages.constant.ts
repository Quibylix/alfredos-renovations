export const STATUS_MESSAGES = {
  OK: "success",
  NOT_AUTHORIZED: "not authorized",
  INVALID_REQUEST: "invalid request",
  UNKNOWN_ERROR: "unknown error",
};

export type StatusMessage =
  (typeof STATUS_MESSAGES)[keyof typeof STATUS_MESSAGES];
