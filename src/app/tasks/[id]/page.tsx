import { Button, Stack } from "@mantine/core";
import { ERROR_CODES } from "@/features/tasks/get-tasks/error_codes.constant";
import { getTaskMessages } from "@/features/tasks/get-tasks/get-task-messages.action";
import { notFound } from "next/navigation";
import { z } from "zod";
import { Task } from "@/features/tasks/get-tasks/task.component";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AppRoutes } from "@/features/shared/routes/app-routes.util";
import { MessageList } from "@/features/messages/message-list/message-list.component";
import styles from "./page.module.css";
import { User } from "@/features/db/user/user.model";
import { USER_ROLES } from "@/features/db/user/user.constant";

const propsSchema = z.object({
  params: z.promise(
    z.object({
      id: z.string().regex(/^\d+$/),
    }),
  ),
});

export type TaskPageProps = z.infer<typeof propsSchema>;

export default async function TaskPage(props: TaskPageProps) {
  const result = propsSchema.safeParse(props);

  if (!result.success) {
    notFound();
  }

  const userRole = await User.getRole();

  if (userRole === USER_ROLES.ANON) {
    notFound();
  }

  const { id } = await result.data.params;

  const { errorCode, task, messages } = await getTaskMessages(Number(id));

  if (errorCode !== ERROR_CODES.SUCCESS) {
    notFound();
  }

  if (task === null) {
    notFound();
  }

  const t = await getTranslations("task");

  return (
    <div className={styles.taskPage}>
      <Stack gap="lg" style={{ overflowY: "auto", height: "100%" }}>
        <Task data={task} isBoss={userRole === USER_ROLES.BOSS} />
        <MessageList messages={messages} />
      </Stack>
      <Button
        variant="outline"
        component={task.completed ? undefined : Link}
        href={AppRoutes.getRoute("SEND_MESSAGE") + `?taskId=${task.id}`}
        mt="xl"
        w="100%"
        disabled={task.completed}
      >
        {t("message")}
      </Button>
    </div>
  );
}
