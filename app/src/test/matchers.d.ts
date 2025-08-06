declare module 'vitest' {
  interface Assertion {
    toBeOneOf(items: unknown[]): void
  }
}
