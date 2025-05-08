import { AuthError, SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "./supabase/create-server-client.util";
import { Database } from "./supabase/types";

export type UserStatusMessage =
  (typeof User.STATUS_MESSAGES)[keyof typeof User.STATUS_MESSAGES];
export type UserRole = (typeof User.ROLES)[keyof typeof User.ROLES];

export class User {
  private static client?: SupabaseClient<Database>;

  private static EMAIL_HOST = "@alfredosrenovations.com";

  public static STATUS_MESSAGES = {
    OK: "ok",
    USERNAME_TAKEN: "username already taken",
    INVALID_CREDENTIALS: "invalid credentials",
    UNKNOWN_ERROR: "unknown error",
  } as const;

  public static ROLES = {
    BOSS: "boss",
    EMPLOYEE: "employee",
    ANON: "anon",
  } as const;

  static async getCurrentUserId() {
    const client = await this.getClient();
    const { data } = await client.auth.getUser();

    if (!data.user) return null;
    return data.user.id;
  }

  static async getRole(id?: string | null): Promise<UserRole> {
    if (id === undefined) id = await this.getCurrentUserId();

    if (!id) return User.ROLES.ANON;

    const isBoss = await this.isBoss({ id });
    if (isBoss) return User.ROLES.BOSS;

    const isEmployee = await this.isEmployee({ id });
    if (isEmployee) return User.ROLES.EMPLOYEE;

    return User.ROLES.ANON;
  }

  static async login(username: string, password: string) {
    const client = await this.getClient();

    const { error } = await client.auth.signInWithPassword({
      email: username + this.EMAIL_HOST,
      password,
    });

    if (!error) return this.STATUS_MESSAGES.OK;

    return this.handleLoginErrors(error);
  }

  private static async getClient() {
    if (!this.client) {
      this.client = await createClient();
    }

    return this.client;
  }

  private static async isBoss({ id }: { id: string }) {
    const client = await this.getClient();

    const { data } = await client
      .from("boss")
      .select("id")
      .eq("id", id)
      .single();

    return Boolean(data);
  }

  private static async isEmployee({ id }: { id: string }) {
    const client = await this.getClient();

    const { data } = await client
      .from("employee")
      .select("id")
      .eq("id", id)
      .single();

    return Boolean(data);
  }

  private static handleLoginErrors(error: AuthError): UserStatusMessage {
    if (error.code === "invalid_credentials") {
      return this.STATUS_MESSAGES.INVALID_CREDENTIALS;
    }

    if (error.code === "username_taken") {
      return this.STATUS_MESSAGES.USERNAME_TAKEN;
    }

    return this.STATUS_MESSAGES.UNKNOWN_ERROR;
  }
}
