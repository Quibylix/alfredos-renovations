import { ValidationError } from "@/features/shared/app-errors/validation.error";

export class TaskDescription {
  static readonly MAX_LENGTH = 100;
  static readonly MIN_LENGTH = 3;

  static readonly DESCRIPTION_TOO_SHORT_MESSAGE =
    "The task description is too short";
  static readonly DESCRIPTION_TOO_LONG_MESSAGE =
    "The task description is too long";

  constructor(private readonly value: string) {
    TaskDescription.validate(value);
  }

  toString() {
    return this.value;
  }

  static validate(value: string) {
    if (value.length < TaskDescription.MIN_LENGTH) {
      throw new ValidationError(TaskDescription.DESCRIPTION_TOO_SHORT_MESSAGE);
    }

    if (value.length > TaskDescription.MAX_LENGTH) {
      throw new ValidationError(TaskDescription.DESCRIPTION_TOO_LONG_MESSAGE);
    }
  }
}
