import { Stack } from "@mantine/core";
import { TaskData } from "./get-related-tasks.action";
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
