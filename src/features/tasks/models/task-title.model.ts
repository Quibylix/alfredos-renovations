import { ValidationError } from "@/features/shared/app-errors/validation.error";

export class TaskTitle {
  static readonly MAX_LENGTH = 100;
  static readonly MIN_LENGTH = 3;

  static readonly TITLE_TOO_SHORT_MESSAGE = "The task title is too short";
  static readonly TITLE_TOO_LONG_MESSAGE = "The task title is too long";

  constructor(private readonly value: string) {
    TaskTitle.validate(value);
  }

  toString() {
    return this.value;
  }

  static validate(value: string) {
    if (value.length < TaskTitle.MIN_LENGTH) {
      throw new ValidationError(TaskTitle.TITLE_TOO_SHORT_MESSAGE);
    }

    if (value.length > TaskTitle.MAX_LENGTH) {
      throw new ValidationError(TaskTitle.TITLE_TOO_LONG_MESSAGE);
    }
  }
}
