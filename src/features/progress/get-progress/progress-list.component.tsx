import { Stack } from "@mantine/core";
import { TaskData } from "./get-related-progress.action";
import { ProgressPreview } from "./progress-preview.component";

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
