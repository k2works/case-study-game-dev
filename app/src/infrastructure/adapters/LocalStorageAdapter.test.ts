import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { LocalStorageAdapter } from './LocalStorageAdapter'

// LocalStorageのモック
const mockLocalStorage = {
  store: new Map<string, string>(),
  getItem: vi.fn((key: string) => mockLocalStorage.store.get(key) || null),
  setItem: vi.fn((key: string, value: string) => {
    mockLocalStorage.store.set(key, value)
  }),
  removeItem: vi.fn((key: string) => {
    mockLocalStorage.store.delete(key)
  }),
  clear: vi.fn(() => {
    mockLocalStorage.store.clear()
  }),
  get length() {
    return mockLocalStorage.store.size
  },
  key: vi.fn((index: number) => {
    const keys = Array.from(mockLocalStorage.store.keys())
    return keys[index] || null
  }),
}

describe('LocalStorageAdapter', () => {
  let adapter: LocalStorageAdapter

  beforeEach(() => {
    // globalのlocalStorageをモックで置き換え
    Object.defineProperty(globalThis, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    })
    adapter = new LocalStorageAdapter()
    mockLocalStorage.store.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    mockLocalStorage.store.clear()
  })

  describe('save', () => {
    it('データを正常に保存できる', async () => {
      const testData = { name: 'test', score: 100 }
      const result = await adapter.save('game-save', testData)

      expect(result).toBe(true)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'puyo-game:game-save',
        expect.stringContaining('"name":"test"'),
      )
    })

    it('複雑なデータ構造も保存できる', async () => {
      const complexData = {
        id: 'game-123',
        player: {
          name: 'Player1',
          level: 5,
          items: ['sword', 'shield', 'potion'],
        },
        settings: {
          volume: 0.8,
          fullscreen: false,
        },
      }

      const result = await adapter.save('complex-data', complexData)
      expect(result).toBe(true)
    })

    it('LocalStorageエラー時にfalseを返す', async () => {
      mockLocalStorage.setItem.mockImplementationOnce(() => {
        throw new Error('Storage full')
      })
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const result = await adapter.save('error-test', { data: 'test' })

      expect(result).toBe(false)
      expect(consoleWarn).toHaveBeenCalled()
      consoleWarn.mockRestore()
    })
  })

  describe('load', () => {
    it('保存されたデータを正常に読み込める', async () => {
      const testData = { name: 'test', score: 100 }
      await adapter.save('game-save', testData)

      const loadedData = await adapter.load<typeof testData>('game-save')

      expect(loadedData).toEqual(testData)
    })

    it('存在しないキーの場合nullを返す', async () => {
      const result = await adapter.load('nonexistent-key')
      expect(result).toBeNull()
    })

    it('不正なJSONの場合nullを返す', async () => {
      mockLocalStorage.store.set('puyo-game:invalid-json', 'invalid json')
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const result = await adapter.load('invalid-json')

      expect(result).toBeNull()
      expect(consoleWarn).toHaveBeenCalled()
      consoleWarn.mockRestore()
    })

    it('互換性のないバージョンの場合nullを返す', async () => {
      const incompatibleData = JSON.stringify({
        data: { test: 'value' },
        timestamp: Date.now(),
        version: '2.0.0',
      })
      mockLocalStorage.store.set('puyo-game:version-test', incompatibleData)
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const result = await adapter.load('version-test')

      expect(result).toBeNull()
      expect(consoleWarn).toHaveBeenCalled()
      consoleWarn.mockRestore()
    })

    it('LocalStorageエラー時にnullを返す', async () => {
      mockLocalStorage.getItem.mockImplementationOnce(() => {
        throw new Error('Storage error')
      })
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const result = await adapter.load('error-test')

      expect(result).toBeNull()
      expect(consoleWarn).toHaveBeenCalled()
      consoleWarn.mockRestore()
    })
  })

  describe('remove', () => {
    it('データを正常に削除できる', async () => {
      await adapter.save('test-key', { data: 'test' })

      const result = await adapter.remove('test-key')

      expect(result).toBe(true)
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        'puyo-game:test-key',
      )
    })

    it('存在しないキーでも成功を返す', async () => {
      const result = await adapter.remove('nonexistent-key')
      expect(result).toBe(true)
    })

    it('LocalStorageエラー時にfalseを返す', async () => {
      mockLocalStorage.removeItem.mockImplementationOnce(() => {
        throw new Error('Storage error')
      })
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const result = await adapter.remove('error-test')

      expect(result).toBe(false)
      expect(consoleWarn).toHaveBeenCalled()
      consoleWarn.mockRestore()
    })
  })

  describe('exists', () => {
    it('存在するキーに対してtrueを返す', async () => {
      await adapter.save('existing-key', { data: 'test' })

      const result = await adapter.exists('existing-key')
      expect(result).toBe(true)
    })

    it('存在しないキーに対してfalseを返す', async () => {
      const result = await adapter.exists('nonexistent-key')
      expect(result).toBe(false)
    })

    it('LocalStorageエラー時にfalseを返す', async () => {
      mockLocalStorage.getItem.mockImplementationOnce(() => {
        throw new Error('Storage error')
      })
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const result = await adapter.exists('error-test')

      expect(result).toBe(false)
      expect(consoleWarn).toHaveBeenCalled()
      consoleWarn.mockRestore()
    })
  })

  describe('clear', () => {
    it('アプリケーションのデータのみを削除する', async () => {
      // アプリケーションのデータを保存
      await adapter.save('game-1', { data: 'test1' })
      await adapter.save('game-2', { data: 'test2' })

      // 他のアプリケーションのデータも保存
      mockLocalStorage.store.set('other-app:data', 'other data')

      const result = await adapter.clear()

      expect(result).toBe(true)
      expect(await adapter.exists('game-1')).toBe(false)
      expect(await adapter.exists('game-2')).toBe(false)
      expect(mockLocalStorage.store.get('other-app:data')).toBe('other data')
    })

    it('LocalStorageエラー時にfalseを返す', async () => {
      // lengthプロパティでエラーを発生させる
      Object.defineProperty(mockLocalStorage, 'length', {
        get: () => {
          throw new Error('Storage error')
        },
      })
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const result = await adapter.clear()

      expect(result).toBe(false)
      expect(consoleWarn).toHaveBeenCalled()
      consoleWarn.mockRestore()

      // プロパティを元に戻す
      Object.defineProperty(mockLocalStorage, 'length', {
        get: () => mockLocalStorage.store.size,
      })
    })
  })

  describe('getUsage', () => {
    it('ストレージ使用量を正しく計算する', async () => {
      await adapter.save('test-1', { data: 'small' })
      await adapter.save('test-2', { data: 'larger data content' })

      const usage = await adapter.getUsage()

      expect(typeof usage).toBe('number')
      expect(usage).toBeGreaterThan(0)
    })

    it('アプリケーションのデータのみを計算対象とする', async () => {
      await adapter.save('app-data', { data: 'test' })
      mockLocalStorage.store.set('other-app:data', 'other data')

      const usage = await adapter.getUsage()

      // 他のアプリケーションのデータは含まれない
      expect(usage).toBeGreaterThan(0)
    })

    it('LocalStorageエラー時にnullを返す', async () => {
      // lengthプロパティでエラーを発生させる
      Object.defineProperty(mockLocalStorage, 'length', {
        get: () => {
          throw new Error('Storage error')
        },
      })
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const result = await adapter.getUsage()

      expect(result).toBeNull()
      expect(consoleWarn).toHaveBeenCalled()
      consoleWarn.mockRestore()

      // プロパティを元に戻す
      Object.defineProperty(mockLocalStorage, 'length', {
        get: () => mockLocalStorage.store.size,
      })
    })
  })

  describe('isAvailable', () => {
    it('LocalStorageが利用可能な場合trueを返す', () => {
      const result = LocalStorageAdapter.isAvailable()
      expect(result).toBe(true)
    })

    it('LocalStorageが利用不可能な場合falseを返す', () => {
      const originalSetItem = localStorage.setItem
      localStorage.setItem = vi.fn(() => {
        throw new Error('localStorage not available')
      })

      const result = LocalStorageAdapter.isAvailable()

      expect(result).toBe(false)

      // 元に戻す
      localStorage.setItem = originalSetItem
    })
  })

  describe('データ形式', () => {
    it('保存されるデータにタイムスタンプとバージョンが含まれる', async () => {
      const testData = { test: 'value' }
      await adapter.save('format-test', testData)

      const rawData = mockLocalStorage.store.get('puyo-game:format-test')
      const parsed = JSON.parse(rawData!)

      expect(parsed).toHaveProperty('data', testData)
      expect(parsed).toHaveProperty('timestamp')
      expect(parsed).toHaveProperty('version', '1.0.0')
      expect(typeof parsed.timestamp).toBe('number')
    })
  })
})
