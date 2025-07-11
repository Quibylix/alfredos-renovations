import {
  Title,
  Avatar,
  Group,
  Text,
  Badge,
  Paper,
  Stack,
  Divider,
  Button,
} from "@mantine/core";
import { TaskData } from "@/features/db/task/task.types";
import { LocalizedDate } from "./localized-date.component";
import { useTranslations } from "next-intl";
import { MediaPreview } from "@/features/media/preview/media-preview.component";
import { UpdateTaskStatus } from "../update-task-status/update-task-status.component";
import { IconEdit } from "@tabler/icons-react";
import Link from "next/link";
import { AppRoutes } from "@/features/shared/app-routes.util";

export type TaskProps = {
  data: TaskData;
  isBoss?: boolean;
};

export function Task({
  data: {
    id,
    title,
    description,
    media,
    startDate,
    project,
    boss,
    endDate,
    completed,
    employees,
    createdAt,
  },
  isBoss,
}: TaskProps) {
  const t = useTranslations("task");

  return (
    <Paper withBorder p="md" radius="md" shadow="sm">
      <Group justify="space-between" mb="xs">
        <Badge color={completed ? "green" : "gray"} variant="filled">
          {completed ? t("completed") : t("pending")}
        </Badge>
        <Text size="xs" c="dimmed">
          <LocalizedDate date={new Date(startDate)} /> →{" "}
          <LocalizedDate date={new Date(endDate)} />
        </Text>
      </Group>
      <Group justify="space-between" mb="xs">
        <Stack gap={4} mb="xs">
          <Text size="xs" c="dimmed">
            📌 {project.title}
          </Text>
          <Group gap="xs">
            <Avatar
              size="sm"
              src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-1.png"
              radius="xl"
            />
            <Text size="sm">{boss.fullName}</Text>
          </Group>
        </Stack>

        {isBoss && (
          <>
            <Button
              variant="outline"
              component={Link}
              href={AppRoutes.getRoute("EDIT_TASK", { id: id.toString() })}
              color="dimmed"
            >
              {t("edit")}
              <IconEdit size={20} />
            </Button>
            <UpdateTaskStatus taskId={id} completed={completed} />
          </>
        )}
      </Group>

      <Divider my="sm" />

      <Title order={3} mb="xs">
        📝 {title}
      </Title>
      <Text size="sm" mb="md">
        {description}
      </Text>

      <Stack gap="xs" mb="md">
        <Text size="sm" fw={500}>
          👥 {t("assignedEmployees")}
        </Text>
        <Group gap="xs">
          {employees.map((emp) => (
            <Badge key={emp.id} variant="light">
              {emp.fullName}
            </Badge>
          ))}
        </Group>
      </Stack>

      {media.length > 0 && <MediaPreview media={media} />}

      <Divider my="sm" />
      <Text size="xs" c="dimmed">
        📅 {t("createdAt")}: <LocalizedDate date={new Date(createdAt)} />
      </Text>
    </Paper>
  );
}
