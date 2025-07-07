import { USER_ROLES, UserRole } from "@/features/db/user/user.constant";
import { User } from "@/features/db/user/user.model";
import { AppRoutes } from "@/features/shared/app-routes.util";
import { APP_ROUTES } from "@/features/shared/routes.constant";

const pathnamesProtections: { [key: string]: UserRole[] } = {
  [APP_ROUTES.HOME]: [USER_ROLES.EMPLOYEE, USER_ROLES.BOSS],
  [APP_ROUTES.LOGIN]: [USER_ROLES.ANON],
  [APP_ROUTES.CHANGE_PASSWORD]: [USER_ROLES.EMPLOYEE, USER_ROLES.BOSS],
  [APP_ROUTES.REGISTER_EMPLOYEE]: [USER_ROLES.BOSS],
  [APP_ROUTES.TASK_LIST]: [USER_ROLES.EMPLOYEE, USER_ROLES.BOSS],
  [APP_ROUTES.TASK]: [USER_ROLES.EMPLOYEE, USER_ROLES.BOSS],
  [APP_ROUTES.SET_TASK]: [USER_ROLES.BOSS],
  [APP_ROUTES.SEND_MESSAGE]: [USER_ROLES.BOSS, USER_ROLES.EMPLOYEE],
  [APP_ROUTES.PROJECT_LIST]: [USER_ROLES.EMPLOYEE, USER_ROLES.BOSS],
  [APP_ROUTES.PROJECT]: [USER_ROLES.EMPLOYEE, USER_ROLES.BOSS],
  [APP_ROUTES.CREATE_PROJECT]: [USER_ROLES.BOSS],
  [APP_ROUTES.EDIT_PROJECT]: [USER_ROLES.BOSS],
  [APP_ROUTES.API_REGISTER_EMPLOYEE]: [USER_ROLES.BOSS],
  [APP_ROUTES.API_SET_TASK]: [USER_ROLES.BOSS],
  [APP_ROUTES.API_CHANGE_PASSWORD]: [USER_ROLES.EMPLOYEE, USER_ROLES.BOSS],
  [APP_ROUTES.API_GET_RELATED_TASKS]: [USER_ROLES.EMPLOYEE, USER_ROLES.BOSS],
  [APP_ROUTES.API_GET_RELATED_PROJECTS]: [USER_ROLES.EMPLOYEE, USER_ROLES.BOSS],
  [APP_ROUTES.API_SEND_MESSAGE]: [USER_ROLES.EMPLOYEE, USER_ROLES.BOSS],
  [APP_ROUTES.API_CREATE_PROJECT]: [USER_ROLES.BOSS],
  [APP_ROUTES.API_EDIT_PROJECT]: [USER_ROLES.BOSS],
};

const redirectionURLs = {
  boss: {
    default: AppRoutes.getRoute("HOME"),
  },
  employee: {
    default: AppRoutes.getRoute("HOME"),
  },
  anon: {
    default: AppRoutes.getRoute("LOGIN"),
  },
};

export async function getProtectionInfo(
  userId: string | null,
  pathname: string,
) {
  const role = await User.getRole(userId);

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
