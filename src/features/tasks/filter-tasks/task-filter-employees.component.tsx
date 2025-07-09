"use client";

import { MultiSelect } from "@mantine/core";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function TaskFilterEmployees({
  employees,
}: {
  employees: { id: string; fullName: string }[];
}) {
  const router = useRouter();
  const t = useTranslations("taskList.filter.employees");

  const searchParams = useSearchParams();

  const initialEmployees = searchParams.get("employees")?.split(",") ?? [];

  const [employeeIds, setEmployeeIds] = useState<string[]>(initialEmployees);

  function handleChange(value: string[]) {
    setEmployeeIds(value);

    const params = new URLSearchParams(searchParams.toString());

    if (value.length > 0) {
      params.set("employees", value.join(","));
    } else {
      params.delete("employees");
    }

    router.replace(`?${params.toString()}`, {
      scroll: false,
    });
  }

  return (
    <MultiSelect
      label={t("label")}
      placeholder={t("placeholder")}
      value={employeeIds}
      onChange={handleChange}
      data={employees.map((employee) => ({
        value: employee.id,
        label: employee.fullName,
      }))}
      limit={10}
      hidePickedOptions
      searchable
    />
  );
}
