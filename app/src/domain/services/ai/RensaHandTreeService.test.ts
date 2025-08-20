/**
 * RensaHandTreeServiceのテスト
 */
import { describe, expect, it } from 'vitest'

import type { AIFieldState } from '../../models/ai/GameState'
import { DEFAULT_MAYAH_SETTINGS } from '../../models/ai/MayahEvaluation'
import {
  type ChainSearchSettings,
  DEFAULT_CHAIN_SEARCH_SETTINGS,
  type RensaNodeDetail,
  buildRensaHandTree,
  generateTreeVisualization,
} from './RensaHandTreeService'

describe('RensaHandTreeService', () => {
  const createTestField = (width: number, height: number): AIFieldState => ({
    width,
    height,
    cells: Array(height)
      .fill(null)
      .map(() => Array(width).fill(null)),
  })

  const setCell = (
    field: AIFieldState,
    x: number,
    y: number,
    color: string,
  ) => {
    field.cells[y][x] = color as never
  }

  describe('buildRensaHandTree', () => {
    it('空フィールドでも基本的な木構造を構築', () => {
      // Arrange
      const myField = createTestField(6, 12)
      const opponentField = createTestField(6, 12)

      // Act
      const result = buildRensaHandTree(myField, opponentField)

      // Assert
      expect(result.tree).toBeDefined()
      expect(result.tree.myTree).toBeDefined()
      expect(result.tree.opponentTree).toBeDefined()
      expect(result.optimalPath).toBeDefined()
      expect(result.searchStats).toBeDefined()
      expect(result.searchStats.nodesEvaluated).toBeGreaterThan(0)
      expect(result.searchStats.timeElapsed).toBeGreaterThanOrEqual(0)
    })

    it('連鎖可能なフィールドで適切な木を構築', () => {
      // Arrange
      const myField = createTestField(6, 12)

      // 4個連結を作成
      setCell(myField, 2, 8, 'red')
      setCell(myField, 2, 9, 'red')
      setCell(myField, 2, 10, 'red')
      setCell(myField, 2, 11, 'red')

      const opponentField = createTestField(6, 12)

      // Act
      const result = buildRensaHandTree(myField, opponentField)

      // Assert
      expect(result.tree.myTree.chainCount).toBeGreaterThan(0)
      expect(result.tree.myTree.score).toBeGreaterThan(0)
      expect(result.optimalPath.length).toBeGreaterThan(0)
    })

    it('複数連鎖が可能なフィールドで深い木を構築', () => {
      // Arrange
      const myField = createTestField(6, 12)

      // 複数の連鎖を配置
      // 第一連鎖
      setCell(myField, 0, 8, 'red')
      setCell(myField, 0, 9, 'red')
      setCell(myField, 0, 10, 'red')
      setCell(myField, 0, 11, 'red')

      // 第二連鎖
      setCell(myField, 1, 9, 'blue')
      setCell(myField, 1, 10, 'blue')
      setCell(myField, 1, 11, 'blue')
      setCell(myField, 2, 11, 'blue')

      const opponentField = createTestField(6, 12)

      // Act
      const result = buildRensaHandTree(myField, opponentField)

      // Assert
      expect(result.tree.myTree.children.length).toBeGreaterThan(0)
      expect(result.searchStats.maxDepth).toBeGreaterThan(0)
    })

    it('カスタム検索設定での動作', () => {
      // Arrange
      const myField = createTestField(6, 12)
      setCell(myField, 2, 10, 'red')
      setCell(myField, 2, 11, 'red')

      const opponentField = createTestField(6, 12)

      const customSettings: ChainSearchSettings = {
        maxDepth: 3,
        maxNodes: 100,
        minChainScore: 100,
        timeLimit: 1000,
        maxBranching: 3,
      }

      // Act
      const result = buildRensaHandTree(
        myField,
        opponentField,
        DEFAULT_MAYAH_SETTINGS,
        customSettings,
      )

      // Assert
      expect(result.searchStats.maxDepth).toBeLessThanOrEqual(3)
      expect(result.searchStats.nodesEvaluated).toBeLessThanOrEqual(100)
      expect(result.searchStats.timeElapsed).toBeLessThan(1100) // 余裕を持たせる
    })

    it('相手フィールドとの打ち合い評価', () => {
      // Arrange
      const myField = createTestField(6, 12)
      // 自分に大きな連鎖
      for (let y = 8; y < 12; y++) {
        setCell(myField, 2, y, 'red')
      }

      const opponentField = createTestField(6, 12)
      // 相手には小さな連鎖
      setCell(opponentField, 3, 10, 'blue')
      setCell(opponentField, 3, 11, 'blue')

      // Act
      const result = buildRensaHandTree(myField, opponentField)

      // Assert
      expect(result.tree.battleEvaluation).toBeDefined()
      expect(result.tree.optimalTiming).toBeGreaterThan(0)
      // 両方とも連鎖がある場合はスコアが算出される
      expect(
        (result.tree.myTree as RensaNodeDetail).accumulatedScore,
      ).toBeGreaterThanOrEqual(0)
      expect(
        (result.tree.opponentTree as RensaNodeDetail).accumulatedScore,
      ).toBeGreaterThanOrEqual(0)
    })

    it('時間制限による早期終了', () => {
      // Arrange
      const myField = createTestField(6, 12)
      // 複雑なフィールドを作成して時間をかけさせる
      for (let x = 0; x < 6; x++) {
        for (let y = 8; y < 12; y++) {
          setCell(myField, x, y, x % 2 === 0 ? 'red' : 'blue')
        }
      }

      const opponentField = createTestField(6, 12)

      const timeConstrainedSettings: ChainSearchSettings = {
        ...DEFAULT_CHAIN_SEARCH_SETTINGS,
        timeLimit: 50, // 短い時間制限
      }

      // Act
      const startTime = Date.now()
      const result = buildRensaHandTree(
        myField,
        opponentField,
        DEFAULT_MAYAH_SETTINGS,
        timeConstrainedSettings,
      )
      const endTime = Date.now()

      // Assert
      expect(endTime - startTime).toBeLessThan(200) // 時間制限が効いている
      expect(result.searchStats.timeElapsed).toBeLessThan(100)
    })
  })

  describe('連鎖木の詳細分析', () => {
    it('ルートノードの基本情報が正しく設定される', () => {
      // Arrange
      const myField = createTestField(6, 12)
      const opponentField = createTestField(6, 12)

      // Act
      const result = buildRensaHandTree(myField, opponentField)

      // Assert
      const root = result.tree.myTree as RensaNodeDetail
      expect(root.chainLength).toBe(0)
      expect(root.accumulatedScore).toBe(0)
      expect(root.feasibility).toBe(1.0)
      expect(root.requiredMoves).toBe(0)
    })

    it('子ノードが親より進歩した状態を表す', () => {
      // Arrange
      const myField = createTestField(6, 12)
      // 複数連鎖を配置
      setCell(myField, 2, 8, 'red')
      setCell(myField, 2, 9, 'red')
      setCell(myField, 2, 10, 'red')
      setCell(myField, 2, 11, 'red')

      setCell(myField, 3, 9, 'blue')
      setCell(myField, 3, 10, 'blue')
      setCell(myField, 3, 11, 'blue')
      setCell(myField, 4, 11, 'blue')

      const opponentField = createTestField(6, 12)

      // Act
      const result = buildRensaHandTree(myField, opponentField)

      // Assert
      const root = result.tree.myTree as RensaNodeDetail
      if (root.children.length > 0) {
        const child = root.children[0]
        expect(child.chainLength).toBeGreaterThan(root.chainLength)
        expect(child.accumulatedScore).toBeGreaterThanOrEqual(
          root.accumulatedScore,
        )
        expect(child.requiredMoves).toBeGreaterThanOrEqual(root.requiredMoves)
        expect(child.requiredMoves).not.toBeNaN()
      }
    })

    it('効率性による子ノードソート', () => {
      // Arrange
      const myField = createTestField(6, 12)
      // 複数の異なるサイズの連鎖を配置
      for (let x = 0; x < 4; x++) {
        for (let y = 10; y < 12; y++) {
          setCell(myField, x, y, x % 2 === 0 ? 'red' : 'blue')
        }
      }

      const opponentField = createTestField(6, 12)

      // Act
      const result = buildRensaHandTree(myField, opponentField)

      // Assert
      const root = result.tree.myTree as RensaNodeDetail
      if (root.children.length > 1) {
        for (let i = 0; i < root.children.length - 1; i++) {
          expect(root.children[i].efficiency).toBeGreaterThanOrEqual(
            root.children[i + 1].efficiency,
          )
        }
      }
    })

    it('最適パスが効率性を基準に選択される', () => {
      // Arrange
      const myField = createTestField(6, 12)
      setCell(myField, 2, 9, 'red')
      setCell(myField, 2, 10, 'red')
      setCell(myField, 2, 11, 'red')
      setCell(myField, 3, 11, 'red')

      const opponentField = createTestField(6, 12)

      // Act
      const result = buildRensaHandTree(myField, opponentField)

      // Assert
      expect(result.optimalPath.length).toBeGreaterThan(0)

      // パス上のノードが効率性の順になっている
      for (let i = 0; i < result.optimalPath.length - 1; i++) {
        const current = result.optimalPath[i]
        const next = result.optimalPath[i + 1]

        expect(next.chainLength).toBeGreaterThan(current.chainLength)
        expect(next.accumulatedScore).toBeGreaterThanOrEqual(
          current.accumulatedScore,
        )
      }
    })
  })

  describe('打ち合い評価とタイミング', () => {
    it('有利な場合に早期発火タイミングを推奨', () => {
      // Arrange
      const myField = createTestField(6, 12)
      // 自分に大連鎖
      for (let y = 6; y < 12; y++) {
        setCell(myField, 2, y, 'red')
      }

      const opponentField = createTestField(6, 12)
      // 相手には小連鎖
      setCell(opponentField, 3, 11, 'blue')

      // Act
      const result = buildRensaHandTree(myField, opponentField)

      // Assert
      expect(result.tree.optimalTiming).toBeGreaterThan(0)
      expect(result.tree.battleEvaluation).toBeGreaterThanOrEqual(0) // 有利またはニュートラル
    })

    it('不利な場合に妨害を重視', () => {
      // Arrange
      const myField = createTestField(6, 12)
      // 自分には小連鎖
      setCell(myField, 2, 11, 'red')

      const opponentField = createTestField(6, 12)
      // 相手に大連鎖
      for (let y = 8; y < 12; y++) {
        setCell(opponentField, 3, y, 'blue')
      }

      // Act
      const result = buildRensaHandTree(myField, opponentField)

      // Assert
      expect(result.tree.battleEvaluation).toBeLessThanOrEqual(0) // 不利またはニュートラル
      expect(result.tree.optimalTiming).toBeGreaterThan(0)
    })

    it('拮抗状態では標準的なタイミング', () => {
      // Arrange
      const myField = createTestField(6, 12)
      // 同程度の連鎖
      setCell(myField, 2, 9, 'red')
      setCell(myField, 2, 10, 'red')
      setCell(myField, 2, 11, 'red')
      setCell(myField, 3, 11, 'red')

      const opponentField = createTestField(6, 12)
      // 相手も同程度
      setCell(opponentField, 1, 9, 'blue')
      setCell(opponentField, 1, 10, 'blue')
      setCell(opponentField, 1, 11, 'blue')
      setCell(opponentField, 2, 11, 'blue')

      // Act
      const result = buildRensaHandTree(myField, opponentField)

      // Assert
      expect(Math.abs(result.tree.battleEvaluation)).toBeLessThan(500) // 拮抗
      expect(result.tree.optimalTiming).toBeGreaterThan(1)
    })
  })

  describe('generateTreeVisualization', () => {
    it('基本的な可視化出力を生成', () => {
      // Arrange
      const myField = createTestField(6, 12)
      setCell(myField, 2, 10, 'red')
      setCell(myField, 2, 11, 'red')

      const opponentField = createTestField(6, 12)

      const result = buildRensaHandTree(myField, opponentField)

      // Act
      const visualization = generateTreeVisualization(result.tree)

      // Assert
      expect(visualization).toContain('RensaHandTree 可視化')
      expect(visualization).toContain('最適発火タイミング')
      expect(visualization).toContain('打ち合い評価')
      expect(visualization).toContain('自分の連鎖木')
      expect(visualization).toContain('相手の連鎖木')
    })

    it('階層構造が正しく表示される', () => {
      // Arrange
      const myField = createTestField(6, 12)
      // 複数レベルの連鎖
      setCell(myField, 2, 8, 'red')
      setCell(myField, 2, 9, 'red')
      setCell(myField, 2, 10, 'red')
      setCell(myField, 2, 11, 'red')

      setCell(myField, 3, 9, 'blue')
      setCell(myField, 3, 10, 'blue')
      setCell(myField, 3, 11, 'blue')
      setCell(myField, 4, 11, 'blue')

      const opponentField = createTestField(6, 12)

      const result = buildRensaHandTree(myField, opponentField)

      // Act
      const visualization = generateTreeVisualization(result.tree)

      // Assert
      expect(visualization).toContain('├─')
      expect(visualization).toContain('連鎖')
      expect(visualization).toContain('効率')

      // インデントが含まれている（階層構造）
      const lines = visualization.split('\n')
      const indentedLines = lines.filter((line) => line.startsWith('  '))
      expect(indentedLines.length).toBeGreaterThan(0)
    })
  })

  describe('パフォーマンステスト', () => {
    it('大きなフィールドでも合理的な時間で完了', () => {
      // Arrange
      const myField = createTestField(6, 12)
      // 中程度の複雑さのフィールド
      for (let x = 0; x < 3; x++) {
        for (let y = 8; y < 12; y++) {
          setCell(myField, x, y, y % 2 === 0 ? 'red' : 'blue')
        }
      }

      const opponentField = createTestField(6, 12)

      // Act
      const startTime = Date.now()
      const result = buildRensaHandTree(myField, opponentField)
      const endTime = Date.now()

      // Assert
      expect(endTime - startTime).toBeLessThan(6000) // 6秒以内
      expect(result.searchStats.nodesEvaluated).toBeGreaterThan(0)
    })

    it('ノード数制限が正しく機能', () => {
      // Arrange
      const myField = createTestField(6, 12)
      for (let x = 0; x < 6; x++) {
        for (let y = 9; y < 12; y++) {
          setCell(myField, x, y, (x + y) % 3 === 0 ? 'red' : 'blue')
        }
      }

      const opponentField = createTestField(6, 12)

      const limitedSettings: ChainSearchSettings = {
        ...DEFAULT_CHAIN_SEARCH_SETTINGS,
        maxNodes: 50,
      }

      // Act
      const result = buildRensaHandTree(
        myField,
        opponentField,
        DEFAULT_MAYAH_SETTINGS,
        limitedSettings,
      )

      // Assert
      expect(result.searchStats.nodesEvaluated).toBeLessThanOrEqual(50)
    })
  })

  describe('エラーハンドリング', () => {
    it('無効なフィールドサイズでも動作', () => {
      // Arrange
      const myField = createTestField(3, 6) // 小さなフィールド
      const opponentField = createTestField(3, 6)

      // Act & Assert
      expect(() => {
        buildRensaHandTree(myField, opponentField)
      }).not.toThrow()
    })

    it('完全に埋まったフィールドでも動作', () => {
      // Arrange
      const myField = createTestField(6, 12)
      for (let x = 0; x < 6; x++) {
        for (let y = 0; y < 12; y++) {
          setCell(myField, x, y, 'red')
        }
      }

      const opponentField = createTestField(6, 12)

      // Act & Assert
      expect(() => {
        buildRensaHandTree(myField, opponentField)
      }).not.toThrow()
    })
  })
})
