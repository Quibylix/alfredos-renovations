export const validators = {
  username: (value: string) => {
    if (value.trim().length < 3) {
      return "Username must be at least 3 characters long";
    }
    if (value.trim().length > 20) {
      return "Username must be at most 20 characters long";
    }
    return null;
  },
  fullName: (value: string) => {
    if (value.trim().length < 3) {
      return "Full name must be at least 3 characters long";
    }
    if (value.trim().length > 50) {
      return "Full name must be at most 50 characters long";
    }
    return null;
  },
  password: (value: string) => {
    if (value.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (value.length > 50) {
      return "Password must be at most 50 characters long";
    }
    return null;
  },
  confirmPassword: (value: string, values: { password: string }) => {
    if (value !== values.password) {
      return "Passwords do not match";
    }
    return null;
  },
};
