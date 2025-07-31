import { describe, it, expect } from 'vitest'

describe('Sample Test', () => {
  it('should pass a basic test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should test string concatenation', () => {
    const greeting = 'Hello'
    const name = 'World'
    expect(`${greeting} ${name}`).toBe('Hello World')
  })
})
