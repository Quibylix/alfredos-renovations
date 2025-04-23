export const API_URL_BASE = "/api/v1" as const;
export const API_ROUTES = {
  LOGIN: `${API_URL_BASE}/auth/login`,
  REGISTER_EMPLOYEE: `${API_URL_BASE}/auth/register-employee`,
  UPLOAD_IMAGE: `${API_URL_BASE}/images/upload`,
  SENT_PROGRESS: `${API_URL_BASE}/progress`,
} as const;
