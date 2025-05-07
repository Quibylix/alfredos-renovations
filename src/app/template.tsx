"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function RootTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const refresh = searchParams.get("refresh");

  useEffect(() => {
    if (refresh) {
      router.refresh();
    }
  }, []);

  return <>{children}</>;
}
