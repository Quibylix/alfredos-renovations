import { ValidationError } from "@/features/shared/app-errors/validation.error";

export class TaskId {
  static readonly ID_NOT_POSITIVE_MESSAGE =
    "Task ID must be a positive integer";

  constructor(private readonly value: number) {
    TaskId.validate(value);
  }

  toNumber() {
    return this.value;
  }

  static validate(value: number) {
    if (!Number.isInteger(value) || value <= 0) {
      throw new ValidationError(TaskId.ID_NOT_POSITIVE_MESSAGE);
    }
  }
}
