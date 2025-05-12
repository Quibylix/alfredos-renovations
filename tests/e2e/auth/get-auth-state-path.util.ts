import path from "path";

export const getAuthStatePath = (username: string) => {
  return path.resolve(__dirname, `../.auth/${username}.json`);
};
