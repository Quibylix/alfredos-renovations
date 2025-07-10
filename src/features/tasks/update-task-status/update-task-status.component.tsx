"use client";

import { Group, Loader, SegmentedControl } from "@mantine/core";
import { useTranslations } from "next-intl";
import { useUpdateTaskStatus } from "./use-update-task-status.hook";
import styles from "./update-task-status.module.css";

export function UpdateTaskStatus({
  taskId,
  completed,
}: {
  taskId: number;
  completed: boolean;
}) {
  const t = useTranslations("updateTaskStatus");

  const { loading, handleStatusChange } = useUpdateTaskStatus(taskId);

  return loading ? (
    <Group className={styles.loaderWrapper} justify="center" w={180}>
      <Loader c="dimmed" size="sm" />
    </Group>
  ) : (
    <SegmentedControl
      value={completed ? "completed" : "pending"}
      onChange={handleStatusChange}
      data={[
        { value: "completed", label: t("completed") },
        { value: "pending", label: t("pending") },
      ]}
    />
  );
}
