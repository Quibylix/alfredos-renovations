export class InvalidRequestError extends Error {
  constructor(message: string = "Invalid request") {
    super(message);
    this.name = "InvalidRequestError";
  }
}
