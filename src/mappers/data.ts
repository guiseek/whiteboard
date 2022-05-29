export class Data {
  static toString<T>(value: T): string {
    return JSON.stringify(value)
  }

  static fromString<T>(value: string): T {
    return JSON.parse(value)
  }
}
