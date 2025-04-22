export const validators = {
  username: (value: string) => {
    if (!value.trim()) return "Username is required";
  },
  password: (value: string) => {
    if (!value) return "Password is required";
  },
};
