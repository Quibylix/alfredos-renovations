import { Container, Title } from "@mantine/core";
import { getTranslations } from "next-intl/server";
import { SendMessageForm } from "@/features/messages/send-message/send-message-form.component";
import { z } from "zod";
import { taskEmployeeValidator } from "@/features/messages/send-message/task-employee-validator.action";
import { notFound } from "next/navigation";

const propsSchema = z.object({
  searchParams: z.promise(
    z.object({
      taskId: z.string().regex(/^\d+$/),
    }),
  ),
});

export type SendMessagePageProps = z.infer<typeof propsSchema>;

export default async function SendMessagePage(props: SendMessagePageProps) {
  const result = propsSchema.safeParse(props);

  if (!result.success) {
    return null;
  }

  const t = await getTranslations("extendProgress");

  const params = await result.data.searchParams;

  const valid = await taskEmployeeValidator(Number(params.taskId));

  if (!valid) {
    return notFound();
  }

  return (
    <Container size="md" my={40}>
      <Title mb={30} ta="center" fw={900}>
        {t("title")}
      </Title>
      <SendMessageForm taskId={Number(params.taskId)} />
    </Container>
  );
}
