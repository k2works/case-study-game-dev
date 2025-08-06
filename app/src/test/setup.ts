import '@testing-library/jest-dom'
import { expect } from 'vitest'

expect.extend({
  toBeOneOf(received: unknown, items: unknown[]) {
    const pass = items.includes(received)
    return {
      pass,
      message: () =>
        pass
          ? `expected ${received} not to be one of [${items.join(', ')}]`
          : `expected ${received} to be one of [${items.join(', ')}]`,
    }
  },
})

// Mock matchMedia for tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
})

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_cb: ResizeObserverCallback) {
    // Mock implementation
  }
  observe() {
    // Mock implementation
  }
  unobserve() {
    // Mock implementation
  }
  disconnect() {
    // Mock implementation
  }
}
