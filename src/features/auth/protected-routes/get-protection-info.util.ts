import { createClient } from "@/features/db/supabase/create-server-client.util";
import { getUserRole } from "./get-user-role.util";
import { API_ROUTES } from "@/features/shared/api.constant";

const pathnamesProtections = {
  "/auth/register-employee": ["boss"],
  "/dashboard": ["employee", "boss"],
  "/progress/send": ["employee"],
  [API_ROUTES.UPLOAD_IMAGE]: ["employee"],
  [API_ROUTES.REGISTER_EMPLOYEE]: ["boss"],
  [API_ROUTES.SEND_PROGRESS]: ["employee"],
};

const redirectionURLs = {
  boss: {
    default: "/dashboard",
  },
  employee: {
    default: "/dashboard",
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

  if (!(pathname in pathnamesProtections)) {
    return { allowed: true, url: pathname };
  }

  const allowedRoles =
    pathnamesProtections[pathname as keyof typeof pathnamesProtections];

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
