"use client";

import { Card, Group, Image, Text } from "@mantine/core";
import { TaskData } from "./get-related-progress.action";
import classes from "./progress-preview.module.css";
import Link from "next/link";
import { LocalizedDate } from "./localized-date.component";
import { useTranslations } from "next-intl";
import { useResizeObserver } from "@mantine/hooks";

export function ProgressPreview({ progress }: { progress: TaskData }) {
  const t = useTranslations("progress");

  const [ref, rect] = useResizeObserver();

  const imageURL = progress.media.find((media) => media.type === "image")?.url;

  const startDate = new Date(progress.startDate);
  const endDate = new Date(startDate.getTime() + progress.duration);

  return (
    <Card ref={ref} withBorder radius="md" p={0} className={classes.card}>
      <Link href={`/progress/${progress.id}`} className={classes.link}>
        <Group>
          <Image
            className={
              rect.width == 0
                ? classes.noImage
                : rect.width > 500
                  ? classes.imageLarge
                  : classes.imageSmall
            }
            src={imageURL ?? "/image-placeholder.jpg"}
            alt={t("alt")}
          />
          <div className={classes.body}>
            <Text tt="uppercase" c="dimmed" fw={700} size="xs" lineClamp={1}>
              {progress.project.title}
            </Text>
            <Text className={classes.title} mt="xs" lineClamp={1}>
              {progress.title}
            </Text>
            <Text size="xs" c="dimmed" mt="xs" mb="md" lineClamp={2}>
              {progress.description}
            </Text>
            <Group wrap="nowrap" gap="xs" mt="md">
              <Text size="xs" c="dimmed">
                <LocalizedDate date={startDate} />
              </Text>
              <Text size="xs" c="dimmed">
                -
              </Text>
              <Text size="xs" c="dimmed">
                <LocalizedDate date={endDate} />
              </Text>
            </Group>
          </div>
        </Group>
      </Link>
    </Card>
  );
}
