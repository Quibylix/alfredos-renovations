import { ValidationError } from "@/features/shared/app-errors/validation.error";

export class FcmToken {
  static readonly INVALID_TOKEN_FORMAT_MESSAGE = "Invalid token format";

  constructor(private readonly value: string) {
    FcmToken.validate(value);
  }

  toString() {
    return this.value;
  }

  static validate(value: string) {
    if (!value.trim().length) {
      throw new ValidationError(FcmToken.INVALID_TOKEN_FORMAT_MESSAGE);
    }
  }
}
