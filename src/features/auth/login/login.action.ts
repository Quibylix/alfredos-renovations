"use server";

import { User } from "@/features/db/user/user.model";
import { UserStatusMessage } from "@/features/db/user/user.constant";

export async function login({
  username,
  password,
}: {
  username: string;
  password: string;
}): Promise<UserStatusMessage> {
  return await User.login(username, password);
}
