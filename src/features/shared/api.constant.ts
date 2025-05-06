export const API_URL_BASE = "/api/v1" as const;
export const API_ROUTES = {
  LOGIN: `${API_URL_BASE}/auth/login`,
  LOGOUT: `${API_URL_BASE}/auth/logout`,
  CHANGE_PASSWORD: `${API_URL_BASE}/auth/change-password`,
  REGISTER_EMPLOYEE: `${API_URL_BASE}/auth/register-employee`,
  UPLOAD_IMAGE: `${API_URL_BASE}/images/upload`,
  SEND_PROGRESS: `${API_URL_BASE}/progress`,
  GET_RELATED_PROGRESS: `${API_URL_BASE}/progress/related`,
  GET_RELATED_PROJECTS: `${API_URL_BASE}/projects/related`,
  EXTEND_PROGRESS: `${API_URL_BASE}/progress/extend`,
  CREATE_PROJECT: `${API_URL_BASE}/projects`,
  EDIT_PROJECT: `${API_URL_BASE}/projects/edit`,
} as const;
