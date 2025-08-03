import { projects } from "./projects.constant";
import { users } from "./users.constant";

type TaskValue = {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  completed: boolean;
  createdAt: string;
  project: keyof typeof projects;
  boss: keyof typeof users;
};

function defineTasks<const T extends Record<string, TaskValue>>(tasks: T): T {
  return tasks;
}

export const tasks = defineTasks({
  task1: {
    title: "Task 1",
    description: "Description for Task 1",
    startDate: "2023-10-01",
    endDate: "2023-10-15",
    completed: false,
    createdAt: "2023-10-01T10:00:00Z",
    project: "project1",
    boss: "boss",
  },
  task2: {
    title: "Task 2",
    description: "Description for Task 2",
    startDate: "2023-10-05",
    endDate: "2023-10-20",
    completed: true,
    createdAt: "2023-10-02T11:00:00Z",
    project: "project2",
    boss: "boss",
  },
  task3: {
    title: "Task 3",
    description: "Description for Task 3",
    startDate: "2023-10-10",
    endDate: "2023-10-25",
    completed: false,
    createdAt: "2023-10-03T12:00:00Z",
    project: "project2",
    boss: "boss",
  },
});

export const taskAssignments: {
  employee: keyof typeof users;
  task: keyof typeof tasks;
}[] = [
  { employee: "employee1", task: "task1" },
  { employee: "employee2", task: "task2" },
  { employee: "employee1", task: "task3" },
];
