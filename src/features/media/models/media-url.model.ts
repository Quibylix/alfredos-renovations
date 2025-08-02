import { ValidationError } from "@/features/shared/app-errors/validation.error";
import z from "zod";

export class MediaUrl {
  static readonly INVALID_MEDIA_URL = "Invalid media url";

  constructor(private readonly value: string) {
    MediaUrl.validate(value);
  }

  toString() {
    return this.value;
  }

  static validate(value: string) {
    try {
      z.string().url().parse(value);
    } catch {
      throw new ValidationError(MediaUrl.INVALID_MEDIA_URL);
    }
  }
}
