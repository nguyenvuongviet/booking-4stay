export class Validator {
  private static emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  static isValidEmail(email: string): boolean {
    return this.emailRegex.test(email);
  }
}
