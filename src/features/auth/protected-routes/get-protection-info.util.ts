import { createClient } from "@/features/db/supabase/create-server-client.util";
import { getUserRole } from "./get-user-role.util";
import { API_ROUTES } from "@/features/shared/api.constant";

const pathnamesProtections = {
  "/auth/login": ["anon"],
  "/auth/logout": ["employee", "boss"],
  "/auth/register-employee": ["boss"],
  "/": ["employee", "boss"],
  "/progress": ["employee", "boss"],
  "/progress/send": ["employee"],
  "/progress/extend": ["employee"],
  "/progress/:id": ["employee", "boss"],
  "/projects": ["employee", "boss"],
  "/projects/create": ["boss"],
  "/projects/edit/:id": ["boss"],
  "/projects/:id": ["employee", "boss"],
  [API_ROUTES.UPLOAD_IMAGE]: ["employee"],
  [API_ROUTES.REGISTER_EMPLOYEE]: ["boss"],
  [API_ROUTES.SEND_PROGRESS]: ["employee"],
  [API_ROUTES.GET_RELATED_PROGRESS]: ["employee", "boss"],
  [API_ROUTES.GET_RELATED_PROJECTS]: ["employee", "boss"],
  [API_ROUTES.EXTEND_PROGRESS]: ["employee"],
  [API_ROUTES.CREATE_PROJECT]: ["boss"],
  [API_ROUTES.EDIT_PROJECT]: ["boss"],
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

function getRedirectionURL(
  role: "boss" | "employee" | "anon",
  pathname: string,
) {
  if (pathname in redirectionURLs[role]) {
    return redirectionURLs[role][
      pathname as keyof (typeof redirectionURLs)[typeof role]
    ];
  }

  return redirectionURLs[role].default;
}
