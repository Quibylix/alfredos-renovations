import { Container, Title, Avatar, Group, Text } from "@mantine/core";
import { TaskData } from "./get-related-tasks.action";
import { LocalizedDate } from "./localized-date.component";
import { useTranslations } from "next-intl";
import { MediaPreview } from "@/features/media/preview/media-preview.component";

export type ProgressProps = {
  data: TaskData;
};

export function Progress({
  data: { title, description, media, startDate, project, boss },
}: ProgressProps) {
  const t = useTranslations("progress");

  return (
    <Container w="100%">
      <Group>
        <Avatar
          src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-1.png"
          alt={t("avatar")}
          radius="xl"
        />
        <div>
          <Text size="sm">{boss.fullName}</Text>
          <Text size="xs" c="dimmed">
            <LocalizedDate date={new Date(startDate)} />
          </Text>
          <Text size="xs" mt="3xs">
            {project.title}
          </Text>
        </div>
      </Group>
      <Container pl={54} mt="sm">
        <Title order={2} size="lg">
          {title}
        </Title>
        <Text mt="2xs" size="sm" mb="md">
          {description}
        </Text>
        <MediaPreview media={media} />
      </Container>
    </Container>
  );
}
