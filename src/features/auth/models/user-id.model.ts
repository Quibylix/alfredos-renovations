import { ValidationError } from "@/features/shared/app-errors/validation.error";
import z from "zod";

export class UserId {
  static readonly INVALID_ID_FORMAT_MESSAGE = "Invalid user ID format";

  constructor(private readonly value: string) {
    UserId.validate(value);
  }

  toString() {
    return this.value;
  }

  static validate(value: string) {
    try {
      z.string().uuid().parse(value);
    } catch {
      throw new ValidationError(UserId.INVALID_ID_FORMAT_MESSAGE);
    }
  }
}
