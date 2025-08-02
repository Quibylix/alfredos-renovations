export class UnauthorizedError extends Error {
  constructor(message: string = "Unauthorized access") {
    super(message);
    this.name = "UnauthorizedError";
  }
}
