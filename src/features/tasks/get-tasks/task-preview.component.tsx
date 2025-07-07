"use client";

import { Card, Group, Image, Text } from "@mantine/core";
import { TaskData } from "./get-related-tasks.action";
import classes from "./task-preview.module.css";
import Link from "next/link";
import { LocalizedDate } from "./localized-date.component";
import { useTranslations } from "next-intl";
import { useResizeObserver } from "@mantine/hooks";
import { AppRoutes } from "@/features/shared/app-routes.util";

export function TaskPreview({ task }: { task: TaskData }) {
  const t = useTranslations("progress");

  const [ref, rect] = useResizeObserver();

  const imageURL = task.media.find((media) => media.type === "image")?.url;

  const startDate = new Date(task.startDate);
  const endDate = new Date(startDate.getTime() + task.duration);

  return (
    <Card ref={ref} withBorder radius="md" p={0} className={classes.card}>
      <Link
        href={AppRoutes.getRoute("PROGRESS", { id: task.id.toString() })}
        className={classes.link}
      >
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
              {task.project.title}
            </Text>
            <Text className={classes.title} mt="xs" lineClamp={1}>
              {task.title}
            </Text>
            <Text size="xs" c="dimmed" mt="xs" mb="md" lineClamp={2}>
              {task.description}
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
