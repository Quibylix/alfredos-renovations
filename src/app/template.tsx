"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function RootTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  console.clear();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const refresh = searchParams.get("refresh");

    if (refresh) {
      router.refresh();
    }
  }, [router, searchParams]);

  return <>{children}</>;
}
