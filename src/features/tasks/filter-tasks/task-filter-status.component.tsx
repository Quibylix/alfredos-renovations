"use client";

import { Chip, ChipGroup, Group, Text } from "@mantine/core";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function TaskFilterStatus() {
  const router = useRouter();
  const t = useTranslations("taskList.filter.status");

  const searchParams = useSearchParams();

  const completedParam = searchParams.get("completed");

  const currentStatus =
    completedParam === "true" || completedParam === "false"
      ? completedParam
      : "undefined";

  const [status, setStatus] = useState<"true" | "false" | "undefined">(
    currentStatus,
  );

  function handleStatusChange(value: string | string[]) {
    if (
      Array.isArray(value) ||
      (value !== "true" && value !== "false" && value !== "undefined")
    ) {
      return;
    }

    setStatus(value);

    const params = new URLSearchParams(searchParams.toString());

    if (value === "undefined") {
      params.delete("completed");
    } else {
      params.set("completed", value);
    }

    router.replace(`?${params.toString()}`, {
      scroll: false,
    });
  }

  return (
    <Group p={0}>
      <Text component="label" size="sm">
        {t("label")}
      </Text>
      <ChipGroup value={status} onChange={handleStatusChange}>
        <Group justify="center">
          <Chip value="true">{t("completed")}</Chip>
          <Chip value="false">{t("pending")}</Chip>
          <Chip value="undefined">{t("all")}</Chip>
        </Group>
      </ChipGroup>
    </Group>
  );
}
