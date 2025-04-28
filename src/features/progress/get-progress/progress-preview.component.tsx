import { Card, Group, Image, Text } from "@mantine/core";
import { ProgressData } from "./get-related-progress.action";
import classes from "./progress-preview.module.css";
import Link from "next/link";
import { LocalizedDate } from "./localized-date.component";
import { useTranslations } from "next-intl";

export function ProgressPreview({ progress }: { progress: ProgressData }) {
  const t = useTranslations("progress");

  return (
    <Card withBorder radius="md" p={0} className={classes.card}>
      <Link href={`/progress/${progress.id}`} className={classes.link}>
        <Group wrap="nowrap" gap={0}>
          <Image
            src={
              progress.image_url ??
              "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fpng.pngtree.com%2Fpng-vector%2F20210604%2Fourmid%2Fpngtree-gray-network-placeholder-png-image_3416659.jpg&f=1&nofb=1&ipt=e7bf35bf35bb382a33fb6efa0cf7991a314865d918e390a395a9dcea08ce0b0e"
            }
            alt={t("alt")}
            miw={160}
            maw={160}
            h={160}
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
