import { users } from "./data/users.constant";
import { registerUsers } from "./register-users";
import { projects } from "./data/projects.constant";
import { registerProjects } from "./register-projects";

export async function seedData() {
  const usersId = {} as Record<keyof typeof users, string>;
  const projectsId = {} as Record<keyof typeof projects, bigint>;

  await registerUsers(usersId);
  await registerProjects(projectsId);
}
