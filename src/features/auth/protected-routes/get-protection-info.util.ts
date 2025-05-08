import { createClient } from "@/features/db/supabase/create-server-client.util";
import { getUserRole } from "./get-user-role.util";
import { API_ROUTES } from "@/features/shared/api.constant";
import { USER_ROLES, UserRole } from "@/features/db/user/user.constant";

const pathnamesProtections: { [key: string]: UserRole[] } = {
  "/auth/login": [USER_ROLES.ANON],
  "/auth/logout": [USER_ROLES.EMPLOYEE, USER_ROLES.BOSS],
  "/auth/register-employee": [USER_ROLES.BOSS],
  "/auth/change-password": [USER_ROLES.EMPLOYEE, USER_ROLES.BOSS],
  "/": [USER_ROLES.EMPLOYEE, USER_ROLES.BOSS],
  "/progress": [USER_ROLES.EMPLOYEE, USER_ROLES.BOSS],
  "/progress/send": [USER_ROLES.EMPLOYEE],
  "/progress/extend": [USER_ROLES.EMPLOYEE],
  "/progress/:id": [USER_ROLES.EMPLOYEE, USER_ROLES.BOSS],
  "/projects": [USER_ROLES.EMPLOYEE, USER_ROLES.BOSS],
  "/projects/create": [USER_ROLES.BOSS],
  "/projects/edit/:id": [USER_ROLES.BOSS],
  "/projects/:id": [USER_ROLES.EMPLOYEE, USER_ROLES.BOSS],
  [API_ROUTES.UPLOAD_IMAGE]: [USER_ROLES.EMPLOYEE],
  [API_ROUTES.REGISTER_EMPLOYEE]: [USER_ROLES.BOSS],
  [API_ROUTES.SEND_PROGRESS]: [USER_ROLES.EMPLOYEE],
  [API_ROUTES.CHANGE_PASSWORD]: [USER_ROLES.EMPLOYEE, USER_ROLES.BOSS],
  [API_ROUTES.GET_RELATED_PROGRESS]: [USER_ROLES.EMPLOYEE, USER_ROLES.BOSS],
  [API_ROUTES.GET_RELATED_PROJECTS]: [USER_ROLES.EMPLOYEE, USER_ROLES.BOSS],
  [API_ROUTES.EXTEND_PROGRESS]: [USER_ROLES.EMPLOYEE],
  [API_ROUTES.CREATE_PROJECT]: [USER_ROLES.BOSS],
  [API_ROUTES.EDIT_PROJECT]: [USER_ROLES.BOSS],
};

const redirectionURLs = {
  boss: {
    default: "/",
  },
  employee: {
    default: "/",
  },
  anon: {
    default: "/auth/login",
  },
};

export async function getProtectionInfo(
  userId: string | null,
  pathname: string,
) {
  const db = await createClient();

  const role = await getUserRole(userId, db);

  const pathMatch = (
    pathname in pathnamesProtections
      ? pathname
      : Object.keys(pathnamesProtections).find((path) => {
          const regex = new RegExp(`^${path.replace(/:\w+/g, "\\w+")}$`);
          return regex.test(pathname);
        })
  ) as keyof typeof pathnamesProtections | undefined;

  if (!pathMatch) {
    return { allowed: true, url: pathname };
  }

  const allowedRoles = pathnamesProtections[pathMatch];

  if (allowedRoles.includes(role)) {
    return { allowed: true, url: pathname };
  }

  return { allowed: false, url: getRedirectionURL(role, pathname) };
}

function getRedirectionURL(role: UserRole, pathname: string) {
  if (pathname in redirectionURLs[role]) {
    return redirectionURLs[role][
      pathname as keyof (typeof redirectionURLs)[typeof role]
    ];
  }

  return redirectionURLs[role].default;
}
