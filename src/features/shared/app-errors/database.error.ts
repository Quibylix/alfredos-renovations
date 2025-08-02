export class DatabaseError extends Error {
  constructor(message: string = "Database operation failed") {
    super(message);
    this.name = "DatabaseError";
  }
}
