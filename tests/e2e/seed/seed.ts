import { registerUsers } from "./register-users";
import { registerProjects } from "./register-projects";

export async function seedData() {
  await registerUsers();
  await registerProjects();
}
