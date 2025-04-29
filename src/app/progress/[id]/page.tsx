import { Button, Container, Stack, Title } from "@mantine/core";
import { ERROR_CODES } from "@/features/progress/get-progress/error_codes.constant";
import { getProgressTree } from "@/features/progress/get-progress/get-progress-tree.action";
import { notFound } from "next/navigation";
import { z } from "zod";
import { Progress } from "@/features/progress/get-progress/progress.component";
import { createClient } from "@/features/db/supabase/create-server-client.util";
import { getUserRole } from "@/features/auth/protected-routes/get-user-role.util";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

const propsSchema = z.object({
  params: z.promise(
    z.object({
      id: z.string().regex(/^\d+$/),
    }),
  ),
});

export type ProgressPageProps = z.infer<typeof propsSchema>;

export default async function ProgressPage(props: ProgressPageProps) {
  const result = propsSchema.safeParse(props);

  if (!result.success) {
    notFound();
  }

  const { id } = await result.data.params;

  const { errorCode, progress, progressChildren } = await getProgressTree(
    Number(id),
  );

  if (errorCode !== ERROR_CODES.SUCCESS) {
    notFound();
  }

  if (progress === null) {
    notFound();
  }

  if (progress.parent_id !== null) {
    notFound();
  }

  const db = await createClient();
  const user = await db.auth.getUser();
  const userRole = await getUserRole(user.data.user?.id ?? null, db);

  const t = await getTranslations("progress");

  return (
    <Container size="md" my={20}>
      <Title order={1} mb="xl" ta="center">
        {progress.title}
      </Title>
      <Stack gap="lg">
        <Progress data={progress} />
        {progressChildren.map((p) => (
          <Progress key={p.id} data={p} />
        ))}
        {userRole === "employee" && (
          <Button
            variant="outline"
            component={Link}
            href={`/progress/extend?projectId=${progress.project.id}&parentId=${progress.id}`}
          >
            {t("extend")}
          </Button>
        )}
      </Stack>
    </Container>
  );
}
