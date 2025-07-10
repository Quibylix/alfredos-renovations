import { Grid, GridCol } from "@mantine/core";
import { TaskData } from "@/features/db/task/task.types";
import { TaskPreview } from "./task-preview.component";

type TaskListProps = {
  tasks: TaskData[];
};

export function TaskList({ tasks }: TaskListProps) {
  return (
    <Grid
      type="container"
      breakpoints={{
        xs: "100px",
        sm: "200px",
        md: "700px",
        lg: "900px",
        xl: "1200px",
      }}
    >
      {tasks.map((task) => (
        <GridCol key={task.id} span={{ base: 12, md: 6 }}>
          <TaskPreview task={task} />
        </GridCol>
      ))}
    </Grid>
  );
}
