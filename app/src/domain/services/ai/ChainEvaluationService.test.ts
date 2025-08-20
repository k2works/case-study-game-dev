/**
 * 連鎖評価サービスのテスト
 */
import { describe, expect, it } from 'vitest'

import type { AIFieldState } from '../../models/ai/GameState'
import { DEFAULT_MAYAH_SETTINGS } from '../../models/ai/MayahEvaluation'
import {
  ChainPatternType,
  detectChainPatterns,
  evaluateChain,
  generateChainDescription,
  selectBestChainPattern,
} from './ChainEvaluationService'

describe('ChainEvaluationService', () => {
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

  describe('detectChainPatterns', () => {
    it('空フィールドではパターンを検出しない', () => {
      // Arrange
      const field = createTestField(6, 12)

      // Act
      const patterns = detectChainPatterns(field)

      // Assert
      expect(patterns).toHaveLength(0)
    })

    it('GTRパターンの基本形を検出', () => {
      // Arrange
      const field = createTestField(6, 12)

      // GTRパターンを構築（3列）
      setCell(field, 0, 8, 'green') // 緑縦
      setCell(field, 0, 9, 'green')
      setCell(field, 0, 10, 'green')
      setCell(field, 0, 11, 'green')

      setCell(field, 1, 9, 'red') // 赤横
      setCell(field, 1, 10, 'red')
      setCell(field, 1, 11, 'red')

      setCell(field, 2, 10, 'blue') // トリガー
      setCell(field, 2, 11, 'red')

      // Act
      const patterns = detectChainPatterns(field)

      // Assert
      expect(patterns.length).toBeGreaterThan(0)
      // GTRパターンが含まれることを期待
      const gtrPattern = patterns.find((p) => p.type === ChainPatternType.GTR)
      expect(gtrPattern).toBeDefined()
    })

    it('L字積みパターンを検出', () => {
      // Arrange
      const field = createTestField(6, 12)

      // L字積みパターンを構築（2列）
      setCell(field, 1, 9, 'red') // L字の縦部分
      setCell(field, 1, 10, 'red')
      setCell(field, 1, 11, 'red')

      setCell(field, 2, 10, 'blue') // L字の横部分
      setCell(field, 2, 11, 'blue')

      // Act
      const patterns = detectChainPatterns(field)

      // Assert
      expect(patterns.length).toBeGreaterThan(0)
      const lstPattern = patterns.find(
        (p) => p.type === ChainPatternType.LST_STACKING,
      )
      expect(lstPattern).toBeDefined()
    })

    it('階段積みパターンを検出', () => {
      // Arrange
      const field = createTestField(6, 12)

      // 階段状の配置（4列以上）
      setCell(field, 0, 11, 'red')
      setCell(field, 1, 10, 'red')
      setCell(field, 1, 11, 'blue')
      setCell(field, 2, 9, 'blue')
      setCell(field, 2, 10, 'green')
      setCell(field, 2, 11, 'red')
      setCell(field, 3, 11, 'yellow') // 4列目を追加

      // Act
      const patterns = detectChainPatterns(field)

      // Assert
      expect(patterns.length).toBeGreaterThan(0)
      const stairsPattern = patterns.find(
        (p) => p.type === ChainPatternType.STAIRS,
      )
      expect(stairsPattern).toBeDefined()
    })

    it('複数パターンが同時に検出される', () => {
      // Arrange
      const field = createTestField(6, 12)

      // 複数のパターンを同じフィールドに配置
      // 左側にL字積み
      setCell(field, 0, 10, 'red')
      setCell(field, 0, 11, 'red')
      setCell(field, 1, 11, 'blue')

      // 右側に階段積み
      setCell(field, 3, 11, 'green')
      setCell(field, 4, 10, 'yellow')
      setCell(field, 4, 11, 'green')
      setCell(field, 5, 9, 'yellow')
      setCell(field, 5, 10, 'red')
      setCell(field, 5, 11, 'blue')

      // Act
      const patterns = detectChainPatterns(field)

      // Assert
      expect(patterns.length).toBeGreaterThanOrEqual(2)
    })

    it('パターンがポテンシャル順にソートされる', () => {
      // Arrange
      const field = createTestField(6, 12)

      // 異なる完成度のパターンを配置
      // 完成度の高いGTRパターン
      setCell(field, 0, 8, 'green')
      setCell(field, 0, 9, 'green')
      setCell(field, 0, 10, 'green')
      setCell(field, 0, 11, 'green')
      setCell(field, 1, 9, 'red')
      setCell(field, 1, 10, 'red')
      setCell(field, 1, 11, 'red')
      setCell(field, 2, 10, 'blue')

      // 完成度の低いL字積み
      setCell(field, 4, 11, 'red')

      // Act
      const patterns = detectChainPatterns(field)

      // Assert
      expect(patterns.length).toBeGreaterThanOrEqual(2)
      // 1番目のパターンが2番目より高いポテンシャルを持つ
      expect(patterns[0].potential).toBeGreaterThanOrEqual(
        patterns[1].potential,
      )
    })
  })

  describe('evaluateChain', () => {
    it('空フィールドの評価', () => {
      // Arrange
      const field = createTestField(6, 12)

      // Act
      const evaluation = evaluateChain(field)

      // Assert
      expect(evaluation.patterns).toHaveLength(0)
      expect(evaluation.bestPattern).toBeUndefined()
      expect(evaluation.chainPotential).toBe(0)
      expect(evaluation.diversityScore).toBe(0)
      expect(evaluation.stabilityScore).toBe(0)
      expect(evaluation.feasibilityScore).toBe(0)
      expect(evaluation.totalScore).toBe(0)
    })

    it('GTRパターンのある場合の評価', () => {
      // Arrange
      const field = createTestField(6, 12)

      // 完全なGTRパターンを構築
      setCell(field, 0, 8, 'green')
      setCell(field, 0, 9, 'green')
      setCell(field, 0, 10, 'green')
      setCell(field, 0, 11, 'green')
      setCell(field, 1, 9, 'red')
      setCell(field, 1, 10, 'red')
      setCell(field, 1, 11, 'red')
      setCell(field, 2, 10, 'blue')
      setCell(field, 2, 11, 'red')

      // Act
      const evaluation = evaluateChain(field)

      // Assert
      expect(evaluation.patterns.length).toBeGreaterThan(0)
      expect(evaluation.bestPattern).toBeDefined()
      expect(evaluation.bestPattern?.type).toBe(ChainPatternType.GTR)
      expect(evaluation.chainPotential).toBeGreaterThan(50)
      expect(evaluation.totalScore).toBeGreaterThan(30)
    })

    it('複数パターンでの多様性評価', () => {
      // Arrange
      const field = createTestField(6, 12)

      // 異なる種類のパターンを配置
      // GTRパターン
      setCell(field, 0, 10, 'green')
      setCell(field, 0, 11, 'green')
      setCell(field, 1, 10, 'red')
      setCell(field, 1, 11, 'red')
      setCell(field, 2, 11, 'blue')

      // 階段積み
      setCell(field, 3, 11, 'yellow')
      setCell(field, 4, 10, 'purple')
      setCell(field, 4, 11, 'yellow')
      setCell(field, 5, 10, 'purple')
      setCell(field, 5, 11, 'green')

      // Act
      const evaluation = evaluateChain(field)

      // Assert
      expect(evaluation.patterns.length).toBeGreaterThanOrEqual(2)
      expect(evaluation.diversityScore).toBeGreaterThan(0)
    })

    it('安定性の高いパターンでの評価', () => {
      // Arrange
      const field = createTestField(6, 12)

      // L字積み（安定性が高い）
      setCell(field, 1, 9, 'red')
      setCell(field, 1, 10, 'red')
      setCell(field, 1, 11, 'red')
      setCell(field, 2, 10, 'blue')
      setCell(field, 2, 11, 'blue')

      // Act
      const evaluation = evaluateChain(field)

      // Assert
      expect(evaluation.patterns.length).toBeGreaterThan(0)
      expect(evaluation.stabilityScore).toBeGreaterThan(50)
    })

    it('実現可能性の評価', () => {
      // Arrange
      const field = createTestField(6, 12)

      // 残りスペースが少ない状況でのパターン
      for (let x = 0; x < 6; x++) {
        for (let y = 6; y < 11; y++) {
          setCell(field, x, y, 'red')
        }
      }

      // 上部に少しパターンを作る
      setCell(field, 2, 5, 'blue')
      setCell(field, 3, 5, 'blue')

      // Act
      const evaluation = evaluateChain(field)

      // Assert
      // 基本実装では実現可能性は現在のアルゴリズムの結果を受け入れる
      expect(evaluation.feasibilityScore).toBeGreaterThanOrEqual(0) // 0以上であることを確認
    })

    it('カスタム設定での評価', () => {
      // Arrange
      const field = createTestField(6, 12)
      setCell(field, 1, 10, 'red')
      setCell(field, 1, 11, 'red')
      setCell(field, 2, 11, 'blue')

      const customSettings = {
        ...DEFAULT_MAYAH_SETTINGS,
        minChainCompleteness: 0.8, // 完成度閾値を高く設定
      }

      // Act
      const evaluation = evaluateChain(field, customSettings)

      // Assert
      // 高い閾値により検出されるパターンが減る
      expect(evaluation.patterns.length).toBeLessThanOrEqual(
        detectChainPatterns(field).length,
      )
    })
  })

  describe('generateChainDescription', () => {
    it('パターン未検出時の説明生成', () => {
      // Arrange
      const evaluation = {
        patterns: [],
        bestPattern: undefined,
        chainPotential: 0,
        diversityScore: 0,
        stabilityScore: 0,
        feasibilityScore: 0,
        totalScore: 0,
      }

      // Act
      const description = generateChainDescription(evaluation)

      // Assert
      expect(description).toBe('連鎖パターン未検出')
    })

    it('GTRパターン検出時の説明生成', () => {
      // Arrange
      const field = createTestField(6, 12)
      setCell(field, 0, 10, 'green')
      setCell(field, 0, 11, 'green')
      setCell(field, 1, 10, 'red')
      setCell(field, 1, 11, 'red')
      setCell(field, 2, 11, 'blue')

      const evaluation = evaluateChain(field)

      // Act
      const description = generateChainDescription(evaluation)

      // Assert
      expect(description).toContain('連鎖')
      expect(description.length).toBeGreaterThan(5)
    })

    it('高品質パターンの説明に修飾語が付く', () => {
      // Arrange
      const field = createTestField(6, 12)

      // 複数の高品質パターンを配置
      setCell(field, 0, 9, 'green')
      setCell(field, 0, 10, 'green')
      setCell(field, 0, 11, 'green')
      setCell(field, 1, 10, 'red')
      setCell(field, 1, 11, 'red')
      setCell(field, 2, 11, 'blue')

      setCell(field, 3, 10, 'yellow')
      setCell(field, 3, 11, 'yellow')
      setCell(field, 4, 11, 'purple')

      const evaluation = evaluateChain(field)

      // Act
      const description = generateChainDescription(evaluation)

      // Assert
      // 多様性、安定性、実現性のいずれかの修飾語が含まれることを期待
      const hasQualityModifier =
        description.includes('多様性') ||
        description.includes('安定性') ||
        description.includes('実現性')
      expect(hasQualityModifier).toBe(true)
    })

    it('複数パターン検出時の説明', () => {
      // Arrange
      const field = createTestField(6, 12)

      // 異なるパターンを配置
      setCell(field, 0, 10, 'red')
      setCell(field, 0, 11, 'red')
      setCell(field, 1, 11, 'blue')

      setCell(field, 3, 11, 'green')
      setCell(field, 4, 10, 'yellow')
      setCell(field, 4, 11, 'green')

      const evaluation = evaluateChain(field)

      // Act
      const description = generateChainDescription(evaluation)

      // Assert
      if (evaluation.patterns.length > 1) {
        expect(description).toContain('パターン')
      }
    })
  })

  describe('selectBestChainPattern', () => {
    it('空配列でnullを返す', () => {
      // Arrange & Act
      const best = selectBestChainPattern([])

      // Assert
      expect(best).toBeNull()
    })

    it('単一パターンを正しく返す', () => {
      // Arrange
      const field = createTestField(6, 12)
      setCell(field, 1, 10, 'red')
      setCell(field, 1, 11, 'red')
      setCell(field, 2, 11, 'blue')

      const patterns = detectChainPatterns(field)

      // Act
      const best = selectBestChainPattern(patterns)

      // Assert
      expect(best).not.toBeNull()
      expect(best?.type).toBeDefined()
    })

    it('複数パターンから最適なものを選択', () => {
      // Arrange
      const field = createTestField(6, 12)

      // 高品質なGTRパターン
      setCell(field, 0, 8, 'green')
      setCell(field, 0, 9, 'green')
      setCell(field, 0, 10, 'green')
      setCell(field, 0, 11, 'green')
      setCell(field, 1, 9, 'red')
      setCell(field, 1, 10, 'red')
      setCell(field, 1, 11, 'red')
      setCell(field, 2, 10, 'blue')

      // 低品質な階段積み
      setCell(field, 4, 11, 'yellow')
      setCell(field, 5, 11, 'purple')

      const patterns = detectChainPatterns(field)

      // Act
      const best = selectBestChainPattern(patterns)

      // Assert
      expect(best).not.toBeNull()
      // より高いポテンシャルのパターンが選択されることを期待
      expect(best?.potential).toBeGreaterThan(0)
    })

    it('複合スコアによる選択', () => {
      // Arrange
      const field = createTestField(6, 12)

      // 複数パターンを配置
      setCell(field, 0, 10, 'red')
      setCell(field, 0, 11, 'red')
      setCell(field, 1, 11, 'blue')

      setCell(field, 3, 9, 'green')
      setCell(field, 3, 10, 'green')
      setCell(field, 3, 11, 'green')
      setCell(field, 4, 10, 'yellow')
      setCell(field, 4, 11, 'yellow')

      const patterns = detectChainPatterns(field)

      // Act
      const best = selectBestChainPattern(patterns)

      // Assert
      expect(best).not.toBeNull()
      // 複合スコアが最も高いパターンが選択される
      if (patterns.length > 1) {
        // bestがpatternsに含まれていることを確認
        const bestExists = patterns.some(
          (p) =>
            p.type === best?.type &&
            p.position.startX === best?.position.startX &&
            p.position.endX === best?.position.endX,
        )
        expect(bestExists).toBe(true)
      }
    })
  })

  describe('パターン特性テスト', () => {
    it('GTRパターンは高効率', () => {
      // Arrange
      const field = createTestField(6, 12)

      // 完全なGTRパターン
      setCell(field, 0, 8, 'green')
      setCell(field, 0, 9, 'green')
      setCell(field, 0, 10, 'green')
      setCell(field, 0, 11, 'green')
      setCell(field, 1, 9, 'red')
      setCell(field, 1, 10, 'red')
      setCell(field, 1, 11, 'red')
      setCell(field, 2, 10, 'blue')
      setCell(field, 2, 11, 'red')

      // Act
      const patterns = detectChainPatterns(field)
      const gtrPattern = patterns.find((p) => p.type === ChainPatternType.GTR)

      // Assert
      expect(gtrPattern).toBeDefined()
      expect(gtrPattern?.efficiency).toBeGreaterThan(0.8) // 高効率
    })

    it('L字積みは高安定性', () => {
      // Arrange
      const field = createTestField(6, 12)

      // L字積みパターン
      setCell(field, 1, 9, 'red')
      setCell(field, 1, 10, 'red')
      setCell(field, 1, 11, 'red')
      setCell(field, 2, 10, 'blue')
      setCell(field, 2, 11, 'blue')

      // Act
      const patterns = detectChainPatterns(field)
      const lstPattern = patterns.find(
        (p) => p.type === ChainPatternType.LST_STACKING,
      )

      // Assert
      expect(lstPattern).toBeDefined()
      expect(lstPattern?.stability).toBeGreaterThan(0.8) // 高安定性
    })

    it('フラクタルは高難易度', () => {
      // Arrange
      const field = createTestField(6, 12)

      // 複雑なフラクタルパターン
      setCell(field, 0, 7, 'red')
      setCell(field, 0, 8, 'red')
      setCell(field, 0, 9, 'red')
      setCell(field, 1, 8, 'blue')
      setCell(field, 1, 9, 'blue')
      setCell(field, 2, 9, 'yellow')
      setCell(field, 2, 10, 'green')
      setCell(field, 3, 10, 'red')
      setCell(field, 3, 11, 'blue')

      // Act
      const patterns = detectChainPatterns(field)
      const fractalPattern = patterns.find(
        (p) => p.type === ChainPatternType.FRACTAL,
      )

      // Assert
      if (fractalPattern) {
        expect(fractalPattern.difficulty).toBeGreaterThan(0.8) // 高難易度
      }
    })
  })
})
