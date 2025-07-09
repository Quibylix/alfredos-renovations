import { Stack } from "@mantine/core";
import { TaskData } from "@/features/db/task/task.types";
import { TaskPreview } from "./task-preview.component";

type TaskListProps = {
  tasks: TaskData[];
};

export function TaskList({ tasks }: TaskListProps) {
  return (
    <Stack>
      {tasks.map((task) => (
        <TaskPreview key={task.id} task={task} />
      ))}
    </Stack>
  );
}
