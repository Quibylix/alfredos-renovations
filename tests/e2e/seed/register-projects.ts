import { prisma } from "./prisma-client";
import { projects } from "./data/projects.constant";
import { promises } from "fs";
import path from "path";

const { writeFile, mkdir } = promises;

export type StoredProjectData = Record<
  keyof typeof projects,
  {
    id: number;
    title: string;
  }
>;

export async function registerProjects() {
  const storedProjectData = {} as StoredProjectData;

  await Promise.all(
    (Object.keys(projects) as (keyof typeof projects)[]).map(
      async (project) => {
        const projectData = projects[project];

        const { id } = await prisma.project.create({
          data: {
            title: projectData.title,
          },
          select: {
            id: true,
          },
        });

        storedProjectData[project] = {
          id: Number(id),
          title: projectData.title,
        };
      },
    ),
  );

  await mkdir(path.resolve(__dirname, ".data"), { recursive: true });
  await writeFile(
    path.resolve(__dirname, ".data", "projects.json"),
    JSON.stringify(storedProjectData, null, 2),
  );
}
