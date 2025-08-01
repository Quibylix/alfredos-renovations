import { registerUsers } from "./register-users";
import { registerProjects } from "./register-projects";
import { registerTasks } from "./register-tasks";

export async function seedData() {
  await registerUsers();
  await registerProjects();
  await registerTasks();
}
