import { AuthError } from "@supabase/supabase-js";
import { createClient } from "../supabase/create-server-client.util";
import {
  UserRole,
  USER_ROLES,
  USER_STATUS_MESSAGES,
  UserStatusMessage,
} from "./user.constant";
import { createAdminClient } from "../supabase/create-admin-client.util";
import { GetRelatedEmployees } from "./queries/get-related-employees.query";

export class User {
  private static EMAIL_HOST = "@alfredosrenovations.com";

  static async getCurrentUserId() {
    const client = await createClient();
    const { data } = await client.auth.getUser();

    if (!data.user) return null;
    return data.user.id;
  }

  static async getRole(id?: string | null): Promise<UserRole> {
    if (id === undefined) id = await this.getCurrentUserId();

    if (!id) return USER_ROLES.ANON;

    const isBoss = await this.isBoss({ id });
    if (isBoss) return USER_ROLES.BOSS;

    const isEmployee = await this.isEmployee({ id });
    if (isEmployee) return USER_ROLES.EMPLOYEE;

    return USER_ROLES.ANON;
  }

  static async login(username: string, password: string) {
    const client = await createClient();

    const { error } = await client.auth.signInWithPassword({
      email: username + this.EMAIL_HOST,
      password,
    });

    if (!error) return USER_STATUS_MESSAGES.OK;

    return this.handleLoginErrors(error);
  }

  static async logout() {
    const db = await createClient();

    const { error } = await db.auth.signOut({ scope: "local" });

    if (error) {
      return USER_STATUS_MESSAGES.UNKNOWN_ERROR;
    }

    return USER_STATUS_MESSAGES.OK;
  }

  static getRelatedEmployees() {
    return new GetRelatedEmployees();
  }

  private static async isBoss({ id }: { id: string }) {
    const client = createAdminClient();

    const { data } = await client
      .from("boss")
      .select("id")
      .eq("id", id)
      .single();

    return Boolean(data);
  }

  private static async isEmployee({ id }: { id: string }) {
    const client = createAdminClient();

    const { data } = await client
      .from("employee")
      .select("id")
      .eq("id", id)
      .single();

    return Boolean(data);
  }

  private static handleLoginErrors(error: AuthError): UserStatusMessage {
    if (error.code === "invalid_credentials") {
      return USER_STATUS_MESSAGES.INVALID_CREDENTIALS;
    }

    if (error.code === "username_taken") {
      return USER_STATUS_MESSAGES.USERNAME_TAKEN;
    }

    return USER_STATUS_MESSAGES.UNKNOWN_ERROR;
  }
}
