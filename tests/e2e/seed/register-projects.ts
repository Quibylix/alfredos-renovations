import { prisma } from "./prisma-client";
import { projects } from "./data/projects.constant";

export function registerProjects(
  projectsIds: Record<keyof typeof projects, bigint>,
) {
  return Promise.all(
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

        projectsIds[project] = id;
      },
    ),
  );
}
