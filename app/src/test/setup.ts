import '@testing-library/jest-dom'

// ResizeObserverのモック（Rechartsで必要）
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
