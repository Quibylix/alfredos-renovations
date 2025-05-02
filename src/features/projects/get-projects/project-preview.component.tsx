import { Button, Paper, Title } from "@mantine/core";
import classes from "./project-preview.module.css";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function ProjectPreview({
  project,
}: {
  project: { id: number; title: string };
}) {
  const t = useTranslations("project");

  return (
    <Paper shadow="md" p="xl" radius="md" className={classes.card}>
      <div>
        <Title order={2} className={classes.title}>
          {project.title}
        </Title>
      </div>
      <Button component={Link} href={"/projects/" + project.id} variant="light">
        {t("view")}
      </Button>
    </Paper>
  );
}
