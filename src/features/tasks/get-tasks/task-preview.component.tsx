"use client";

import {
  Anchor,
  Avatar,
  Badge,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { TaskData } from "@/features/db/task/task.types";
import classes from "./task-preview.module.css";
import Link from "next/link";
import { LocalizedDate } from "./localized-date.component";
import { useTranslations } from "next-intl";
import { AppRoutes } from "@/features/shared/app-routes.util";

export function TaskPreview({ task }: { task: TaskData }) {
  const t = useTranslations("task");

  const startDate = new Date(task.startDate);
  const endDate = new Date(task.endDate);

  return (
    <Anchor
      component={Link}
      href={AppRoutes.getRoute("TASK", { id: task.id.toString() })}
      className={classes.link}
    >
      <Paper className={classes.card} withBorder p="md" radius="md" shadow="sm">
        <Group justify="space-between" mb="xs">
          <Badge color={task.completed ? "green" : "gray"} variant="filled">
            {task.completed ? t("completed") : t("pending")}
          </Badge>
          <Text size="xs" c="dimmed">
            <LocalizedDate date={new Date(startDate)} /> →{" "}
            <LocalizedDate date={new Date(endDate)} />
          </Text>
        </Group>

        <Stack gap={4} mb="xs">
          <Text size="xs" c="dimmed">
            📌 {task.project.title}
          </Text>
          <Group gap="xs">
            <Avatar
              size="sm"
              src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-1.png"
              radius="xl"
            />
            <Text size="sm">{task.boss.fullName}</Text>
          </Group>
        </Stack>

        <Divider my="sm" />

        <Title order={3} mb="xs" lineClamp={1}>
          📝 {task.title}
        </Title>
        <Text size="sm" mb="md" lineClamp={2}>
          {task.description}
        </Text>
      </Paper>
    </Anchor>
  );
}
