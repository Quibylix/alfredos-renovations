import {
  Title,
  Avatar,
  Group,
  Text,
  Badge,
  Paper,
  Stack,
  Divider,
} from "@mantine/core";
import { TaskData } from "./get-related-tasks.action";
import { LocalizedDate } from "./localized-date.component";
import { useTranslations } from "next-intl";
import { MediaPreview } from "@/features/media/preview/media-preview.component";

export type TaskProps = {
  data: TaskData;
};

export function Task({
  data: {
    title,
    description,
    media,
    startDate,
    project,
    boss,
    duration,
    completed,
    employees,
    createdAt,
  },
}: TaskProps) {
  const t = useTranslations("task");

  const endDate = new Date(new Date(startDate).getTime() + duration);

  return (
    <Paper withBorder p="md" radius="md" shadow="sm">
      <Group justify="space-between" mb="xs">
        <Badge color={completed ? "green" : "gray"} variant="filled">
          {completed ? t("completed") : t("pending")}
        </Badge>
        <Text size="xs" c="dimmed">
          <LocalizedDate date={new Date(startDate)} /> →{" "}
          <LocalizedDate date={endDate} />
        </Text>
      </Group>

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
