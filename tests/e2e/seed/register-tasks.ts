import { prisma } from "./prisma-client";
import { promises } from "fs";
import path from "path";
import { taskAssignments, tasks } from "./data/tasks.constant";
import { StoredProjectData } from "./register-projects";
import { StoredUserData } from "./register-users";

const { readFile, writeFile, mkdir } = promises;

export type StoredTaskData = Record<
  keyof typeof tasks,
  {
    id: number;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    completed: boolean;
    createdAt: string;
    projectId: number;
    bossId: string;
  }
>;

export async function registerTasks() {
  const projectsData = JSON.parse(
    await readFile(path.resolve(__dirname, ".data", "projects.json"), "utf-8"),
  ) as StoredProjectData;
  const userData = JSON.parse(
    await readFile(path.resolve(__dirname, ".data", "users.json"), "utf-8"),
  ) as StoredUserData;

  const storedTaskData = {} as StoredTaskData;

  await Promise.all(
    (Object.keys(tasks) as (keyof typeof tasks)[]).map(async (task) => {
      const taskData = tasks[task];

      const { id } = await prisma.task.create({
        data: {
          title: taskData.title,
          description: taskData.description,
          start_date: new Date(taskData.startDate),
          end_date: new Date(taskData.endDate),
          completed: taskData.completed,
          created_at: new Date(taskData.createdAt),
          project_id: projectsData[taskData.project].id,
          boss_id: userData[taskData.boss].id,
        },
        select: {
          id: true,
        },
      });

      storedTaskData[task] = {
        id: Number(id),
        title: taskData.title,
        description: taskData.description,
        startDate: taskData.startDate,
        endDate: taskData.endDate,
        completed: taskData.completed,
        createdAt: taskData.createdAt,
        projectId: projectsData[taskData.project].id,
        bossId: userData[taskData.boss].id,
      };
    }),
  );

  await Promise.all(
    taskAssignments.map(async (assignment) => {
      const task = assignment.task;
      const employeeId = userData[assignment.employee].id;

      await prisma.task_assignment.create({
        data: {
          task_id: storedTaskData[task].id,
          employee_id: employeeId,
        },
      });
    }),
  );

  await mkdir(path.resolve(__dirname, ".data"), { recursive: true });
  await writeFile(
    path.resolve(__dirname, ".data", "tasks.json"),
    JSON.stringify(storedTaskData, null, 2),
  );
}
