declare module 'vitest' {
  interface Assertion {
    toBeOneOf(items: unknown[]): void
    toBeInTheDocument(): void
    toHaveClass(...classNames: string[]): void
    toContainText(text: string): void
  }
}
