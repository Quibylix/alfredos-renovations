"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function useRefreshRoute() {
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
}
