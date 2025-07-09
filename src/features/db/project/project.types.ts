import { TaskData } from "@/features/db/task/task.types";

export type ProjectData = {
  id: number;
  title: string;
  tasks: TaskData[];
};
