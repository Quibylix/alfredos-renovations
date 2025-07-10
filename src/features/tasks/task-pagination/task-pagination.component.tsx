"use client";

import { Pagination } from "@mantine/core";
import { useRouter, useSearchParams } from "next/navigation";

export function TaskPagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handlePageChange(page: number) {
    const params = new URLSearchParams(searchParams.toString());

    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", page.toString());
    }

    router.replace(`?${params.toString()}`, {
      scroll: false,
    });
  }

  return (
    <Pagination
      total={totalPages}
      value={currentPage}
      onChange={handlePageChange}
    />
  );
}
