export class SpecError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "SpecError";
  }
}
