import { ValidationError } from "@/features/shared/app-errors/validation.error";

export class ProjectId {
  static readonly ID_NOT_POSITIVE_MESSAGE =
    "Project ID must be a positive integer";

  constructor(private readonly value: number) {
    ProjectId.validate(value);
  }

  toNumber() {
    return this.value;
  }

  static validate(value: number) {
    if (!Number.isInteger(value) || value <= 0) {
      throw new ValidationError(ProjectId.ID_NOT_POSITIVE_MESSAGE);
    }
  }
}
