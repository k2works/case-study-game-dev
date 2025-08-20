/**
 * パフォーマンス最適化ユーティリティのテスト
 */
import { describe, expect, it, vi } from 'vitest'

import {
  LRUCache,
  ObjectPool,
  debounce,
  findOptimal,
  generateFieldHash,
  memoize,
  processBatch,
  progressiveEvaluation,
  throttle,
} from './PerformanceOptimizer'

describe('PerformanceOptimizer', () => {
  describe('LRUCache', () => {
    it('基本的なget/set操作', () => {
      // Arrange
      const cache = new LRUCache<string, number>(3, 1000)

      // Act & Assert
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3)

      expect(cache.get('a')).toBe(1)
      expect(cache.get('b')).toBe(2)
      expect(cache.get('c')).toBe(3)
      expect(cache.size()).toBe(3)
    })

    it('容量制限によるLRU削除', () => {
      // Arrange
      const cache = new LRUCache<string, number>(2, 1000)

      // Act
      cache.set('a', 1)
      cache.set('b', 2)
      cache.set('c', 3) // 'a'が削除されるはず

      // Assert
      expect(cache.get('a')).toBeUndefined()
      expect(cache.get('b')).toBe(2)
      expect(cache.get('c')).toBe(3)
      expect(cache.size()).toBe(2)
    })

    it('TTL期限切れによる削除', async () => {
      // Arrange
      const cache = new LRUCache<string, number>(3, 10) // 10ms TTL

      // Act
      cache.set('test', 42)
      expect(cache.get('test')).toBe(42)

      // 20ms待機
      await new Promise((resolve) => setTimeout(resolve, 20))

      // Assert
      expect(cache.get('test')).toBeUndefined()
    })

    it('アクセス統計の更新', () => {
      // Arrange
      const cache = new LRUCache<string, number>(3, 1000)

      // Act
      cache.set('a', 1)
      cache.get('a') // ヒット
      cache.get('a') // ヒット
      cache.get('b') // ミス

      // Assert
      const stats = cache.getStats()
      expect(stats.size).toBe(1)
      expect(stats.hitRate).toBeGreaterThan(0)
    })
  })

  describe('generateFieldHash', () => {
    it('同じフィールドで同じハッシュを生成', () => {
      // Arrange
      const field1 = {
        width: 6,
        height: 2,
        cells: [
          ['red', 'blue', null, null, null, null],
          [null, null, null, null, null, null],
        ] as (string | null)[][],
      }
      const field2 = {
        width: 6,
        height: 2,
        cells: [
          ['red', 'blue', null, null, null, null],
          [null, null, null, null, null, null],
        ] as (string | null)[][],
      }

      // Act
      const hash1 = generateFieldHash(field1)
      const hash2 = generateFieldHash(field2)

      // Assert
      expect(hash1).toBe(hash2)
    })

    it('異なるフィールドで異なるハッシュを生成', () => {
      // Arrange
      const field1 = {
        width: 6,
        height: 1,
        cells: [['red', null, null, null, null, null]] as (string | null)[][],
      }
      const field2 = {
        width: 6,
        height: 1,
        cells: [['blue', null, null, null, null, null]] as (string | null)[][],
      }

      // Act
      const hash1 = generateFieldHash(field1)
      const hash2 = generateFieldHash(field2)

      // Assert
      expect(hash1).not.toBe(hash2)
    })
  })

  describe('findOptimal', () => {
    it('最高スコアの要素を返す', () => {
      // Arrange
      const items = [{ value: 10 }, { value: 30 }, { value: 20 }]
      const scorer = (item: { value: number }) => item.value

      // Act
      const optimal = findOptimal(items, scorer)

      // Assert
      expect(optimal?.value).toBe(30)
    })

    it('閾値を満たした場合に早期終了', () => {
      // Arrange
      const items = [{ value: 50 }, { value: 30 }, { value: 100 }]
      const scorer = vi.fn((item: { value: number }) => item.value)

      // Act
      const optimal = findOptimal(items, scorer, 40)

      // Assert
      expect(optimal?.value).toBe(50)
      expect(scorer).toHaveBeenCalledTimes(1) // 早期終了
    })

    it('空配列でnullを返す', () => {
      // Arrange
      const items: number[] = []

      // Act
      const optimal = findOptimal(items, (x) => x)

      // Assert
      expect(optimal).toBeNull()
    })
  })

  describe('processBatch', () => {
    it('要素をバッチ処理', () => {
      // Arrange
      const items = [1, 2, 3, 4, 5, 6, 7]
      const processor = (batch: number[]) => batch.map((x) => x * 2)

      // Act
      const results = processBatch(items, processor, 3)

      // Assert
      expect(results).toEqual([2, 4, 6, 8, 10, 12, 14])
    })

    it('バッチサイズより少ない要素の処理', () => {
      // Arrange
      const items = [1, 2]
      const processor = (batch: number[]) => batch.map((x) => x * 2)

      // Act
      const results = processBatch(items, processor, 5)

      // Assert
      expect(results).toEqual([2, 4])
    })
  })

  describe('debounce', () => {
    it('指定時間内の連続呼び出しを抑制', async () => {
      // Arrange
      const mockFn = vi.fn()
      const debouncedFn = debounce(mockFn, 50)

      // Act
      debouncedFn('first')
      debouncedFn('second')
      debouncedFn('third')

      // 60ms待機
      await new Promise((resolve) => setTimeout(resolve, 60))

      // Assert
      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('third') // 最後の呼び出しのみ
    })
  })

  describe('throttle', () => {
    it('指定時間内の呼び出し頻度を制限', async () => {
      // Arrange
      const mockFn = vi.fn()
      const throttledFn = throttle(mockFn, 50)

      // Act
      throttledFn('first')
      throttledFn('second') // 抑制される
      throttledFn('third') // 抑制される

      // 60ms待機
      await new Promise((resolve) => setTimeout(resolve, 60))

      throttledFn('fourth') // この時点で実行される

      // Assert
      expect(mockFn).toHaveBeenCalledTimes(2)
      expect(mockFn).toHaveBeenNthCalledWith(1, 'first')
      expect(mockFn).toHaveBeenNthCalledWith(2, 'fourth')
    })
  })

  describe('memoize', () => {
    it('計算結果をキャッシュ', () => {
      // Arrange
      const expensiveFunction = vi.fn((x: number) => x * x)
      const memoizedFn = memoize(expensiveFunction)

      // Act
      const result1 = memoizedFn(5)
      const result2 = memoizedFn(5) // キャッシュから取得

      // Assert
      expect(result1).toBe(25)
      expect(result2).toBe(25)
      expect(expensiveFunction).toHaveBeenCalledTimes(1)
    })

    it('カスタムキージェネレータを使用', () => {
      // Arrange
      const mockFn = vi.fn((obj: { x: number; y: number }) => obj.x + obj.y)
      const memoizedFn = memoize(mockFn, (obj) => `${obj.x},${obj.y}`)

      // Act
      const result1 = memoizedFn({ x: 1, y: 2 })
      const result2 = memoizedFn({ x: 1, y: 2 }) // 異なるオブジェクトだがキーは同じ

      // Assert
      expect(result1).toBe(3)
      expect(result2).toBe(3)
      expect(mockFn).toHaveBeenCalledTimes(1)
    })
  })

  describe('progressiveEvaluation', () => {
    it('段階的評価を実行', () => {
      // Arrange
      const item = { value: 50 }
      const evaluators = [
        {
          name: 'basic',
          evaluator: (item: { value: number }) => item.value,
          threshold: 30,
          weight: 1.0,
        },
        {
          name: 'advanced',
          evaluator: (item: { value: number }) => item.value * 2,
          threshold: 80,
          weight: 2.0,
        },
        {
          name: 'complex',
          evaluator: (item: { value: number }) => item.value * 3,
          weight: 3.0,
        },
      ]

      // Act
      const result = progressiveEvaluation(item, evaluators)

      // Assert
      expect(result.evaluationsUsed).toEqual(['basic', 'advanced', 'complex'])
      expect(result.score).toBeGreaterThan(0)
    })

    it('閾値未満で早期終了', () => {
      // Arrange
      const item = { value: 10 }
      const evaluators = [
        {
          name: 'basic',
          evaluator: (item: { value: number }) => item.value,
          threshold: 50, // 閾値未満
          weight: 1.0,
        },
        {
          name: 'advanced',
          evaluator: vi.fn(() => 100), // 呼ばれないはず
          weight: 2.0,
        },
      ]

      // Act
      const result = progressiveEvaluation(item, evaluators)

      // Assert
      expect(result.evaluationsUsed).toEqual(['basic'])
      expect(evaluators[1].evaluator).not.toHaveBeenCalled()
    })
  })

  describe('ObjectPool', () => {
    it('オブジェクトの取得と返却', () => {
      // Arrange
      const factory = () => ({ value: 0 })
      const reset = (obj: { value: number }) => {
        obj.value = 0
      }
      const pool = new ObjectPool(factory, reset, 2)

      // Act
      const obj1 = pool.acquire()
      pool.acquire() // 使用されないがプールサイズテストのために取得
      obj1.value = 42

      pool.release(obj1)
      const obj3 = pool.acquire() // obj1が再利用されるはず

      // Assert
      expect(obj3.value).toBe(0) // resetされている
      expect(pool.size()).toBe(0) // obj3を取得したので0個利用可能
    })

    it('プールが空の場合に新しいオブジェクトを作成', () => {
      // Arrange
      const factory = vi.fn(() => ({ id: Math.random() }))
      const pool = new ObjectPool(factory, undefined, 0) // 初期サイズ0

      // Act
      const obj = pool.acquire()

      // Assert
      expect(obj).toBeDefined()
      expect(factory).toHaveBeenCalledTimes(1) // 初期作成分 + 新規作成分
    })
  })
})
