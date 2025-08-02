import { ValidationError } from "@/features/shared/app-errors/validation.error";

export class TaskDateRange {
  static readonly INVALID_DATE_FORMAT_MESSAGE = "Invalid date format";
  static readonly START_AFTER_END_MESSAGE =
    "Start date cannot be after end date";

  constructor(
    private readonly startDate: string | Date,
    private readonly endDate: string | Date,
  ) {
    TaskDateRange.validate(startDate, endDate);
  }

  getStartDate() {
    return new Date(this.startDate);
  }

  getEndDate() {
    return new Date(this.endDate);
  }

  static validate(startDate: string | Date, endDate: string | Date) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new ValidationError(TaskDateRange.INVALID_DATE_FORMAT_MESSAGE);
    }

    if (start > end) {
      throw new ValidationError(TaskDateRange.START_AFTER_END_MESSAGE);
    }
  }
}

export class TaskDateRangeWithFutureEnd extends TaskDateRange {
  static readonly END_BEFORE_CURRENT_MESSAGE =
    "End date must be after the current date";

  constructor(startDate: string | Date, endDate: string | Date) {
    super(startDate, endDate);
  }

  static validate(startDate: string | Date, endDate: string | Date) {
    super.validate(startDate, endDate);

    const end = new Date(endDate);
    const now = new Date();

    if (end < now) {
      throw new ValidationError(
        TaskDateRangeWithFutureEnd.END_BEFORE_CURRENT_MESSAGE,
      );
    }
  }
}
