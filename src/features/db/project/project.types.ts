import { TaskData } from "@/features/tasks/get-tasks/get-related-tasks.action";

export type ProjectData = {
  id: number;
  title: string;
  tasks: TaskData[];
};
