import { Stack } from "@mantine/core";
import { ProgressData } from "./get-related-progress.action";
import { ProgressPreview } from "./progress-preview.component";

type ProgressListProps = {
  progress: ProgressData[];
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
