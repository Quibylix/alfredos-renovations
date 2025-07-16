import path from "path";
import { users } from "../seed/data/users.constant";

export const getAuthStatePath = (username: keyof typeof users) => {
  return path.resolve(__dirname, `../.auth/${username}.json`);
};
