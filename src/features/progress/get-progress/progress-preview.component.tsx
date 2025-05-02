"use client";

import { Card, Group, Image, Text } from "@mantine/core";
import { ProgressData } from "./get-related-progress.action";
import classes from "./progress-preview.module.css";
import Link from "next/link";
import { LocalizedDate } from "./localized-date.component";
import { useTranslations } from "next-intl";
import { useResizeObserver } from "@mantine/hooks";

export function ProgressPreview({ progress }: { progress: ProgressData }) {
  const t = useTranslations("progress");

  const [ref, rect] = useResizeObserver();

  return (
    <Card ref={ref} withBorder radius="md" p={0} className={classes.card}>
      <Link href={`/progress/${progress.id}`} className={classes.link}>
        <Group>
          <Image
            className={
              rect.width < 500 ? classes.imageSmall : classes.imageLarge
            }
            src={progress.image_url ?? "/image-placeholder.jpg"}
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
            <Group wrap="nowrap" gap="xs">
              <Group gap="xs" wrap="nowrap">
                <Text size="xs">{progress.employee.full_name}</Text>
              </Group>
              <Text size="xs" c="dimmed">
                •
              </Text>
              <Text size="xs" c="dimmed">
                <LocalizedDate date={new Date(progress.sent_date)} />
              </Text>
            </Group>
          </div>
        </Group>
      </Link>
    </Card>
  );
}
