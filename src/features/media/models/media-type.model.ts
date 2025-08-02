import { ValidationError } from "@/features/shared/app-errors/validation.error";

export class MediaType {
  static readonly INVALID_MEDIA_TYPE = "Invalid media type";

  static readonly IMAGE = "image";
  static readonly VIDEO = "video";

  constructor(private readonly value: string) {
    MediaType.validate(value);
  }

  toString() {
    return this.value;
  }

  static validate(value: string) {
    if (value !== MediaType.IMAGE && value !== MediaType.VIDEO) {
      throw new ValidationError(MediaType.INVALID_MEDIA_TYPE);
    }
  }
}
