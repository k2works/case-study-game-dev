/**
 * パフォーマンス最適化ユーティリティ
 * mayah AI評価システムの計算効率向上
 */

/**
 * メモ化キャッシュインターフェース
 */
interface CacheEntry<T> {
  value: T
  timestamp: number
  accessCount: number
}

/**
 * LRUキャッシュ実装
 */
export class LRUCache<K, V> {
  private cache = new Map<K, CacheEntry<V>>()
  private readonly maxSize: number
  private readonly ttl: number // Time to live in milliseconds

  constructor(maxSize: number = 1000, ttl: number = 30000) {
    this.maxSize = maxSize
    this.ttl = ttl
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key)
    if (!entry) return undefined

    // TTL チェック
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key)
      return undefined
    }

    // アクセス数更新
    entry.accessCount++
    entry.timestamp = Date.now()

    // LRU更新のため再挿入
    this.cache.delete(key)
    this.cache.set(key, entry)

    return entry.value
  }

  set(key: K, value: V): void {
    // キャッシュサイズ制限チェック
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      // 最も古いエントリを削除
      const oldestKey = this.cache.keys().next().value
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey)
      }
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      accessCount: 1,
    })
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }

  getStats(): { size: number; hitRate: number } {
    const totalAccess = Array.from(this.cache.values()).reduce(
      (sum, entry) => sum + entry.accessCount,
      0,
    )
    const hits = this.cache.size
    return {
      size: this.cache.size,
      hitRate: totalAccess > 0 ? hits / totalAccess : 0,
    }
  }
}

/**
 * フィールドハッシュ生成（高速比較用）
 */
export const generateFieldHash = (field: {
  width: number
  height: number
  cells: (string | null)[][]
}): string => {
  // 簡易ハッシュ生成（パフォーマンス重視）
  let hash = `${field.width}x${field.height}:`
  for (let y = 0; y < field.height; y++) {
    if (!field.cells[y]) continue // 安全性チェック
    for (let x = 0; x < field.width; x++) {
      const cell = field.cells[y]?.[x]
      hash += cell ? cell[0] : '0' // 最初の文字のみ使用
    }
  }
  return hash
}

/**
 * 配列の早期終了検索
 */
export const findOptimal = <T>(
  items: T[],
  scorer: (item: T) => number,
  threshold?: number,
): T | null => {
  if (items.length === 0) return null

  let best = items[0]
  let bestScore = scorer(best)

  // 閾値が設定されていて、最初の要素が既に満たしている場合は早期リターン
  if (threshold && bestScore >= threshold) {
    return best
  }

  // サイクロマティック複雑度を下げるため、シンプルなループに変更
  for (let i = 1; i < items.length; i++) {
    const score = scorer(items[i])
    if (score > bestScore) {
      best = items[i]
      bestScore = score
    }
    // 閾値チェックを別々に実行
    if (threshold && bestScore >= threshold) {
      break
    }
  }

  return best
}

/**
 * バッチ処理による効率化
 */
export const processBatch = <T, R>(
  items: T[],
  processor: (batch: T[]) => R[],
  batchSize: number = 10,
): R[] => {
  const results: R[] = []
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchResults = processor(batch)
    results.push(...batchResults)
  }
  return results
}

/**
 * 並列処理シミュレーション（Web Workers未使用版）
 */
export const processParallel = <T, R>(
  items: T[],
  processor: (item: T) => R,
  concurrency: number = 4,
): Promise<R[]> => {
  return new Promise((resolve) => {
    const results: R[] = new Array(items.length)
    let completed = 0
    const chunks = chunkArray(items, Math.ceil(items.length / concurrency))

    chunks.forEach((chunk, chunkIndex) => {
      // setTimeout で非同期的に処理をスケジュール
      setTimeout(() => {
        chunk.forEach((item, itemIndex) => {
          const globalIndex = chunkIndex * chunk.length + itemIndex
          results[globalIndex] = processor(item)
          completed++

          if (completed === items.length) {
            resolve(results)
          }
        })
      }, 0)
    })
  })
}

/**
 * 配列をチャンクに分割
 */
const chunkArray = <T>(array: T[], chunkSize: number): T[][] => {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize))
  }
  return chunks
}

/**
 * デバウンス関数（頻繁な計算の抑制）
 */
export const debounce = <T extends unknown[]>(
  func: (...args: T) => void,
  wait: number,
): ((...args: T) => void) => {
  let timeout: NodeJS.Timeout | null = null

  return (...args: T) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * スロットリング関数（計算頻度の制限）
 */
export const throttle = <T extends unknown[]>(
  func: (...args: T) => void,
  limit: number,
): ((...args: T) => void) => {
  let inThrottle = false

  return (...args: T) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * パフォーマンス測定デコレータ
 */
export const measurePerformance = <T extends unknown[], R>(
  func: (...args: T) => R,
  label?: string,
): ((...args: T) => R) => {
  return (...args: T): R => {
    const start = performance.now()
    const result = func(...args)
    const end = performance.now()

    if (label) {
      console.log(`${label}: ${(end - start).toFixed(2)}ms`)
    }

    return result
  }
}

/**
 * 計算結果キャッシュデコレータ
 */
export const memoize = <T extends unknown[], R>(
  func: (...args: T) => R,
  keyGenerator?: (...args: T) => string,
): ((...args: T) => R) => {
  const cache = new LRUCache<string, R>()

  return (...args: T): R => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)

    const cached = cache.get(key)
    if (cached !== undefined) {
      return cached
    }

    const result = func(...args)
    cache.set(key, result)
    return result
  }
}

/**
 * 段階的計算（段階的に詳細度を上げる）
 */
export const progressiveEvaluation = <T>(
  item: T,
  evaluators: Array<{
    name: string
    evaluator: (item: T) => number
    threshold?: number
    weight: number
  }>,
): { score: number; evaluationsUsed: string[] } => {
  let totalScore = 0
  let totalWeight = 0
  const evaluationsUsed: string[] = []

  for (const { name, evaluator, threshold = 0, weight } of evaluators) {
    const score = evaluator(item)
    evaluationsUsed.push(name)

    totalScore += score * weight
    totalWeight += weight

    // 閾値未満の場合は早期終了
    if (score < threshold) {
      break
    }
  }

  return {
    score: totalWeight > 0 ? totalScore / totalWeight : 0,
    evaluationsUsed,
  }
}

/**
 * リソースプール（オブジェクト再利用）
 */
export class ObjectPool<T> {
  private available: T[] = []
  private factory: () => T
  private reset?: (obj: T) => void

  constructor(factory: () => T, reset?: (obj: T) => void, initialSize = 10) {
    this.factory = factory
    this.reset = reset

    // 初期オブジェクトを作成
    for (let i = 0; i < initialSize; i++) {
      this.available.push(factory())
    }
  }

  acquire(): T {
    if (this.available.length > 0) {
      return this.available.pop()!
    }
    return this.factory()
  }

  release(obj: T): void {
    if (this.reset) {
      this.reset(obj)
    }
    this.available.push(obj)
  }

  size(): number {
    return this.available.length
  }
}
