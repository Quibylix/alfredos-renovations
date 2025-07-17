import { RefreshRoute } from "@/features/shared/refresh-route/refresh-route.component";

export default function RootTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <RefreshRoute />
      {children}
    </>
  );
}
