import { Container, Title } from "@mantine/core";
import { getTranslations } from "next-intl/server";
import { ExtendProgressForm } from "@/features/progress/extend-progress/extend-progress-form.component";
import { z } from "zod";
import { projectProgressEmployeeValidator } from "@/features/progress/extend-progress/project-progress-employee-validator.action";
import { notFound } from "next/navigation";

const propsSchema = z.object({
  searchParams: z.promise(
    z.object({
      taskId: z.string().regex(/^\d+$/),
    }),
  ),
});

export type ExtendProgressPageProps = z.infer<typeof propsSchema>;

export default async function ExtendProgressPage(
  props: ExtendProgressPageProps,
) {
  const result = propsSchema.safeParse(props);

  if (!result.success) {
    return null;
  }

  const t = await getTranslations("extendProgress");

  const params = await result.data.searchParams;

  const valid = await projectProgressEmployeeValidator(Number(params.taskId));

  if (!valid) {
    return notFound();
  }

  return (
    <Container size="md" my={40}>
      <Title mb={30} ta="center" fw={900}>
        {t("title")}
      </Title>
      <ExtendProgressForm taskId={Number(params.taskId)} />
    </Container>
  );
}
