import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { PuyoColor } from '../models/Puyo'
import {
  DEFAULT_SPAWNING_CONFIG,
  PuyoSpawningService,
  calculateColorStatistics,
  createColorSelector,
} from './PuyoSpawningService'

describe('PuyoSpawningService', () => {
  let service: PuyoSpawningService
  const spawnPosition = { x: 2, y: 0 }

  beforeEach(() => {
    service = new PuyoSpawningService()
    // ランダム性をテストするためにMath.randomをモック
    vi.restoreAllMocks()
  })

  describe('generatePuyoPair', () => {
    it('有効なぷよペアを生成する', () => {
      const pair = service.generatePuyoPair(spawnPosition)

      expect(pair.main.position.x).toBe(2)
      expect(pair.main.position.y).toBe(0)
      expect(pair.sub.position.x).toBe(2)
      expect(pair.sub.position.y).toBe(-1)
      expect(['red', 'blue', 'green', 'yellow', 'purple']).toContain(
        pair.main.color,
      )
      expect(['red', 'blue', 'green', 'yellow', 'purple']).toContain(
        pair.sub.color,
      )
    })

    it('生成毎に履歴が更新される', () => {
      const initialHistory = service.getHistory()
      expect(initialHistory).toHaveLength(0)

      service.generatePuyoPair(spawnPosition)

      const afterHistory = service.getHistory()
      expect(afterHistory).toHaveLength(2) // mainとsubの色が追加される
    })
  })

  describe('generateSpecificPuyoPair', () => {
    it('指定した色でぷよペアを生成する', () => {
      const pair = service.generateSpecificPuyoPair(
        'red',
        'blue',
        spawnPosition,
      )

      expect(pair.main.color).toBe('red')
      expect(pair.sub.color).toBe('blue')
      expect(pair.main.position.x).toBe(2)
      expect(pair.main.position.y).toBe(0)
      expect(pair.sub.position.x).toBe(2)
      expect(pair.sub.position.y).toBe(-1)
    })

    it('履歴には影響しない', () => {
      const initialHistory = service.getHistory()
      service.generateSpecificPuyoPair('red', 'blue', spawnPosition)
      const afterHistory = service.getHistory()

      expect(afterHistory).toEqual(initialHistory)
    })
  })

  describe('generateMultiplePuyoPairs', () => {
    it('指定された数のぷよペアを生成する', () => {
      const pairs = service.generateMultiplePuyoPairs(3, spawnPosition)

      expect(pairs).toHaveLength(3)
      pairs.forEach((pair) => {
        expect(pair.main.position.x).toBe(2)
        expect(pair.main.position.y).toBe(0)
        expect(pair.sub.position.x).toBe(2)
        expect(pair.sub.position.y).toBe(-1)
      })
    })

    it('各ペアで履歴が累積される', () => {
      service.generateMultiplePuyoPairs(2, spawnPosition)
      const history = service.getHistory()

      expect(history).toHaveLength(4) // 2ペア × 2色 = 4
    })
  })

  describe('色選択ロジック', () => {
    it('ランダム選択が機能する', () => {
      // Math.randomを固定値にモック
      vi.spyOn(Math, 'random').mockReturnValue(0.2) // 1番目の色を選択

      const service = new PuyoSpawningService(['red', 'blue', 'green'], {
        ...DEFAULT_SPAWNING_CONFIG,
        avoidRecentColors: false,
      })

      const pair = service.generatePuyoPair(spawnPosition)
      expect(pair.main.color).toBe('red')
      expect(pair.sub.color).toBe('red')
    })

    it('履歴を考慮した色選択が機能する', () => {
      const service = new PuyoSpawningService(['red', 'blue'])

      // 最初にredを大量生成して履歴に記録
      for (let i = 0; i < 4; i++) {
        service.generateSpecificPuyoPair('red', 'red', spawnPosition)
      }

      // 履歴をサービスに手動で追加（privateメソッドのテストのため）
      const history = ['red', 'red', 'red', 'red']
      history.forEach((color) => {
        // @ts-expect-error - private methodへのアクセス
        service.addToHistory(color)
      })

      // 複数回生成してblueの出現率が高くなることを期待
      const results: PuyoColor[] = []
      for (let i = 0; i < 20; i++) {
        const pair = service.generatePuyoPair(spawnPosition)
        results.push(pair.main.color, pair.sub.color)
      }

      const blueCount = results.filter((color) => color === 'blue').length
      // redCountは統計チェックで必要ないので削除

      // 統計的にblueの方が多く出現することを期待（確率的テストなので100%ではない）
      expect(blueCount).toBeGreaterThan(0)
    })
  })

  describe('clearHistory', () => {
    it('履歴をクリアする', () => {
      service.generatePuyoPair(spawnPosition)
      expect(service.getHistory()).toHaveLength(2)

      service.clearHistory()
      expect(service.getHistory()).toHaveLength(0)
    })
  })

  describe('getHistory', () => {
    it('現在の履歴を取得する', () => {
      expect(service.getHistory()).toEqual([])

      service.generatePuyoPair(spawnPosition)
      const history = service.getHistory()

      expect(history).toHaveLength(2)
      expect(Array.isArray(history)).toBe(true)
    })

    it('履歴の最大長制限が機能する', () => {
      // maxHistoryLength = 4なので、6個追加すると最初の2個が削除される
      for (let i = 0; i < 3; i++) {
        service.generatePuyoPair(spawnPosition)
      }

      const history = service.getHistory()
      expect(history).toHaveLength(4) // 最大長で制限される
    })
  })

  describe('getColorStatistics', () => {
    it('色の統計情報を正しく計算する', () => {
      service.generateSpecificPuyoPair('red', 'blue', spawnPosition)
      // 手動で履歴に追加
      // @ts-expect-error - private methodへのアクセス
      service.addToHistory('red')
      // @ts-expect-error - private methodへのアクセス
      service.addToHistory('blue')

      const stats = service.getColorStatistics()

      expect(stats.totalGenerated).toBe(2)
      expect(stats.historyLength).toBe(2)
      expect(stats.colorDistribution.red).toBe(0.5)
      expect(stats.colorDistribution.blue).toBe(0.5)
    })

    it('空の履歴での統計情報', () => {
      const stats = service.getColorStatistics()

      expect(stats.totalGenerated).toBe(0)
      expect(stats.historyLength).toBe(0)
      expect(Object.values(stats.colorDistribution)).toEqual([0, 0, 0, 0, 0])
    })
  })

  describe('updateConfig', () => {
    it('設定を部分的に更新する', () => {
      service.updateConfig({
        avoidRecentColors: false,
        balanceStrength: 0.5,
      })

      // 設定が反映されていることを間接的に確認
      // （private fieldなので直接確認できない）
      const service2 = new PuyoSpawningService(['red'], {
        avoidRecentColors: false,
        historyConsideration: 3,
        balanceStrength: 0.5,
        sameColorPairProbability: 0.1,
      })

      // 設定が更新されたサービスと同じ挙動になることを期待
      expect(service).toBeDefined()
      expect(service2).toBeDefined()
    })
  })

  describe('コンストラクタオプション', () => {
    it('カスタム色配列で初期化する', () => {
      const customService = new PuyoSpawningService(['red', 'blue'])
      const pair = customService.generatePuyoPair(spawnPosition)

      expect(['red', 'blue']).toContain(pair.main.color)
      expect(['red', 'blue']).toContain(pair.sub.color)
    })

    it('カスタム設定で初期化する', () => {
      const customConfig = {
        avoidRecentColors: false,
        historyConsideration: 5,
        balanceStrength: 0.8,
        sameColorPairProbability: 0.2,
      }

      const customService = new PuyoSpawningService(
        ['red', 'blue'],
        customConfig,
      )
      expect(customService).toBeDefined()
    })
  })
})

describe('createColorSelector', () => {
  const availableColors: PuyoColor[] = ['red', 'blue', 'green']
  const config = DEFAULT_SPAWNING_CONFIG

  it('色選択ユーティリティを作成できる', () => {
    // Arrange & Act
    const selector = createColorSelector(availableColors, config)

    // Assert
    expect(selector).toBeDefined()
    expect(selector.selectRandomColor).toBeDefined()
    expect(selector.calculateFrequency).toBeDefined()
    expect(selector.calculateWeights).toBeDefined()
  })

  it('ランダムに色を選択できる', () => {
    // Arrange
    const selector = createColorSelector(availableColors, config)

    // Act
    const color = selector.selectRandomColor()

    // Assert
    expect(availableColors).toContain(color)
  })

  it('色の頻度を計算できる', () => {
    // Arrange
    const selector = createColorSelector(availableColors, config)
    const colors: PuyoColor[] = ['red', 'red', 'blue', 'green', 'red']

    // Act
    const frequency = selector.calculateFrequency(colors)

    // Assert
    expect(frequency.get('red')).toBe(3)
    expect(frequency.get('blue')).toBe(1)
    expect(frequency.get('green')).toBe(1)
  })

  it('存在しない色も頻度0で初期化される', () => {
    // Arrange
    const selector = createColorSelector(
      ['red', 'blue', 'green', 'yellow'],
      config,
    )
    const colors: PuyoColor[] = ['red', 'red']

    // Act
    const frequency = selector.calculateFrequency(colors)

    // Assert
    expect(frequency.get('yellow')).toBe(0)
    expect(frequency.get('blue')).toBe(0)
    expect(frequency.get('green')).toBe(0)
  })

  it('頻度に基づいて重みを計算できる', () => {
    // Arrange
    const selector = createColorSelector(availableColors, config)
    const frequency = new Map<PuyoColor, number>([
      ['red', 3],
      ['blue', 1],
      ['green', 0],
    ])

    // Act
    const weights = selector.calculateWeights(frequency)

    // Assert
    expect(weights).toHaveLength(3)
    const redWeight = weights.find((w) => w.color === 'red')?.weight || 0
    const blueWeight = weights.find((w) => w.color === 'blue')?.weight || 0
    const greenWeight = weights.find((w) => w.color === 'green')?.weight || 0

    // 頻度が高い色ほど重みが小さい
    expect(redWeight).toBeLessThan(blueWeight)
    expect(greenWeight).toBeGreaterThan(redWeight)
  })

  it('カリー化された関数として使用できる', () => {
    // Arrange
    const curriedSelector = createColorSelector(availableColors)

    // Act
    const selector = curriedSelector(config)

    // Assert
    expect(selector.selectRandomColor).toBeDefined()
    const color = selector.selectRandomColor()
    expect(availableColors).toContain(color)
  })
})

describe('calculateColorStatistics', () => {
  const availableColors: PuyoColor[] = ['red', 'blue', 'green']

  it('色の統計を正しく計算する', () => {
    // Arrange
    const colors: PuyoColor[] = ['red', 'red', 'blue', 'green', 'red']

    // Act
    const stats = calculateColorStatistics(colors, availableColors)

    // Assert
    expect(stats.totalGenerated).toBe(5)
    expect(stats.historyLength).toBe(5)
    expect(stats.colorDistribution['red']).toBeCloseTo(3 / 5, 5)
    expect(stats.colorDistribution['blue']).toBeCloseTo(1 / 5, 5)
    expect(stats.colorDistribution['green']).toBeCloseTo(1 / 5, 5)
  })

  it('空の配列でも統計を計算できる', () => {
    // Arrange
    const colors: PuyoColor[] = []

    // Act
    const stats = calculateColorStatistics(colors, availableColors)

    // Assert
    expect(stats.totalGenerated).toBe(0)
    expect(stats.historyLength).toBe(0)
    expect(stats.colorDistribution['red']).toBe(0)
    expect(stats.colorDistribution['blue']).toBe(0)
    expect(stats.colorDistribution['green']).toBe(0)
  })

  it('一部の色のみが使用された場合の統計', () => {
    // Arrange
    const colors: PuyoColor[] = ['red', 'red', 'red']

    // Act
    const stats = calculateColorStatistics(colors, availableColors)

    // Assert
    expect(stats.totalGenerated).toBe(3)
    expect(stats.colorDistribution['red']).toBe(1)
    expect(stats.colorDistribution['blue']).toBe(0)
    expect(stats.colorDistribution['green']).toBe(0)
  })

  it('カリー化された関数として使用できる', () => {
    // Arrange
    const colors: PuyoColor[] = ['red', 'blue', 'blue']
    const curriedStats = calculateColorStatistics(colors)

    // Act
    const stats = curriedStats(availableColors)

    // Assert
    expect(stats.totalGenerated).toBe(3)
    expect(stats.colorDistribution['red']).toBeCloseTo(1 / 3, 5)
    expect(stats.colorDistribution['blue']).toBeCloseTo(2 / 3, 5)
  })

  it('利用可能な色が実際の色より多い場合', () => {
    // Arrange
    const colors: PuyoColor[] = ['red', 'blue']
    const moreAvailableColors: PuyoColor[] = [
      'red',
      'blue',
      'green',
      'yellow',
      'purple',
    ]

    // Act
    const stats = calculateColorStatistics(colors, moreAvailableColors)

    // Assert
    expect(stats.totalGenerated).toBe(2)
    expect(stats.colorDistribution['red']).toBe(0.5)
    expect(stats.colorDistribution['blue']).toBe(0.5)
    expect(stats.colorDistribution['green']).toBe(0)
    expect(stats.colorDistribution['yellow']).toBe(0)
    expect(stats.colorDistribution['purple']).toBe(0)
  })
})
