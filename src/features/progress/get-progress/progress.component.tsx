import { Container, Image, Title, Avatar, Group, Text } from "@mantine/core";
import { ProgressData } from "./get-related-progress.action";
import { LocalizedDate } from "./localized-date.component";

export type ProgressProps = {
  data: ProgressData;
};

export function Progress({
  data: {
    title,
    description,
    image_url: imageURL,
    sent_date: sentDate,
    project,
    employee,
  },
}: ProgressProps) {
  return (
    <Container w="100%">
      <Group>
        <Avatar
          src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-1.png"
          alt="Avatar"
          radius="xl"
        />
        <div>
          <Text size="sm">{employee.full_name}</Text>
          <Text size="xs" c="dimmed">
            <LocalizedDate date={new Date(sentDate)} />
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
        <Text mt="2xs" size="sm">
          {description}
        </Text>
        {imageURL && (
          <Image
            src={imageURL}
            radius="md"
            my="sm"
            miw={160}
            mih={160}
            mah={300}
            maw="100%"
            w="auto"
            h="auto"
          />
        )}
      </Container>
    </Container>
  );
}
