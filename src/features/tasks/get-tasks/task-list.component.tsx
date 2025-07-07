import { Stack } from "@mantine/core";
import { TaskData } from "./get-related-tasks.action";
import { ProgressPreview } from "./task-preview.component";

type ProgressListProps = {
  progress: TaskData[];
};

export function ProgressList({ progress }: ProgressListProps) {
  return (
    <Stack>
      {progress.map((progressItem) => (
        <ProgressPreview key={progressItem.id} progress={progressItem} />
      ))}
    </Stack>
  );
}
