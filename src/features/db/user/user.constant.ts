export const USER_STATUS_MESSAGES = {
  OK: "ok",
  USERNAME_TAKEN: "username already taken",
  INVALID_CREDENTIALS: "invalid credentials",
  NOT_AUTHORIZED: "not authorized",
  UNKNOWN_ERROR: "unknown error",
} as const;

export const USER_ROLES = {
  BOSS: "boss",
  EMPLOYEE: "employee",
  ANON: "anon",
} as const;

export type UserStatusMessage =
  (typeof USER_STATUS_MESSAGES)[keyof typeof USER_STATUS_MESSAGES];

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
