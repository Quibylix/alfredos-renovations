"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DatePickerInput } from "@mantine/dates";

const dateOptions = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
} as const;

export function TaskFilterDate({ type }: { type: "start" | "end" }) {
  const router = useRouter();
  const t = useTranslations(`taskList.filter.${type}Date`);

  const searchParams = useSearchParams();

  const currentLte = searchParams.get(`${type}_date_lte`)
    ? new Date(searchParams.get(`${type}_date_lte`)!)
    : null;
  const currentGte = searchParams.get(`${type}_date_gte`)
    ? new Date(searchParams.get(`${type}_date_gte`)!)
    : null;

  const [dateRange, setDateRange] = useState<[string | null, string | null]>([
    currentGte?.toLocaleDateString("en-CA", dateOptions) ?? null,
    currentLte?.toLocaleDateString("en-CA", dateOptions) ?? null,
  ]);

  const handleDateChange = (newRange: [string | null, string | null]) => {
    const gteDate = newRange[0]
      ? new Date(newRange[0] + "T00:00:00.000")
      : null;
    const lteDate = newRange[1]
      ? new Date(newRange[1] + "T23:59:59.999")
      : null;

    setDateRange(newRange);

    if (gteDate && !lteDate) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());

    if (lteDate) {
      params.set(`${type}_date_lte`, lteDate.toISOString());
    } else {
      params.delete(`${type}_date_lte`);
    }

    if (gteDate) {
      params.set(`${type}_date_gte`, gteDate.toISOString());
    } else {
      params.delete(`${type}_date_gte`);
    }

    router.replace(`?${params.toString()}`, {
      scroll: false,
    });
  };

  return (
    <DatePickerInput
      miw={200}
      maw="100%"
      flex={1}
      type="range"
      allowSingleDateInRange
      label={t("label")}
      value={dateRange}
      placeholder={t("placeholder")}
      onChange={handleDateChange}
      styles={{
        input: {
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
        },
      }}
    />
  );
}
