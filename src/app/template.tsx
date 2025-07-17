import { USER_ROLES } from "@/features/db/user/user.constant";
import { User } from "@/features/db/user/user.model";
import { RegisterFCMToken } from "@/features/notifications/fcm-token/register-fcm-token.component";
import { RefreshRoute } from "@/features/shared/refresh-route/refresh-route.component";

export default async function RootTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const role = await User.getRole();

  return (
    <>
      <RefreshRoute />
      <RegisterFCMToken isLogged={role !== USER_ROLES.ANON} />
      {children}
    </>
  );
}
