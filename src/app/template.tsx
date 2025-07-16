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

  useEffect(() => {
    const refresh = searchParams.get("refresh");

    if (refresh) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("refresh");
      router.replace(`?${newSearchParams.toString()}`);

      router.refresh();
    }
  }, [router, searchParams]);

  return <>{children}</>;
}
