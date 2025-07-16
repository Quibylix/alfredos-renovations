import { Button, Paper, Title } from "@mantine/core";
import classes from "./project-preview.module.css";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { AppRoutes } from "@/features/shared/app-routes.util";

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
      <Button
        component={Link}
        href={AppRoutes.getRoute("PROJECT", { id: project.id.toString() })}
        variant="light"
        aria-label={t("viewProject", { title: project.title })}
      >
        {t("view")}
      </Button>
    </Paper>
  );
}
