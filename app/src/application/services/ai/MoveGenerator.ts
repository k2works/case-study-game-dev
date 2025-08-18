/**
 * 手生成サービス
 * AI用の可能な手を生成する
 */
import type { AIGameState, PossibleMove } from '../../../domain/models/ai/types'
import type { MoveGeneratorPort } from '../../ports/MoveGeneratorPort.ts'

/**
 * 基本的な手生成器
 */
export class MoveGenerator implements MoveGeneratorPort {
  /**
   * 可能な手を生成
   */
  generateMoves(gameState: AIGameState): PossibleMove[] {
    if (!gameState.currentPuyoPair) {
      return []
    }

    const moves: PossibleMove[] = []
    const field = gameState.field
    const rotations = [0, 90, 180, 270]

    // 各回転状態と各列の組み合わせを生成
    for (const rotation of rotations) {
      for (let x = 0; x < field.width; x++) {
        const move = this.generateMoveForPosition(gameState, x, rotation)
        if (move) {
          moves.push(move)
        }
      }
    }

    return moves
  }

  /**
   * 指定位置・回転での手を生成
   */
  private generateMoveForPosition(
    gameState: AIGameState,
    x: number,
    rotation: number,
  ): PossibleMove | null {
    if (!gameState.currentPuyoPair) {
      return null
    }

    const field = gameState.field
    const positions = this.calculatePuyoPositions(x, rotation, field)

    if (!positions) {
      return {
        x,
        rotation,
        isValid: false,
        primaryPosition: { x: -1, y: -1 },
        secondaryPosition: { x: -1, y: -1 },
      }
    }

    const finalPositions = this.calculateFinalDropPositions(positions, field)
    const isValid = finalPositions !== null

    // 実際の落下後の位置を返す
    const finalPrimary = finalPositions
      ? { x: finalPositions.primaryX, y: finalPositions.primaryY }
      : { x: -1, y: -1 }
    const finalSecondary = finalPositions
      ? { x: finalPositions.secondaryX, y: finalPositions.secondaryY }
      : { x: -1, y: -1 }

    return {
      x,
      rotation,
      isValid,
      primaryPosition: finalPrimary,
      secondaryPosition: finalSecondary,
    }
  }

  /**
   * 回転状態に基づく相対位置を取得
   */
  private getRotationOffset(rotation: number): { x: number; y: number } | null {
    switch (rotation) {
      case 0: // 上
        return { x: 0, y: -1 }
      case 90: // 右
        return { x: 1, y: 0 }
      case 180: // 下
        return { x: 0, y: 1 }
      case 270: // 左
        return { x: -1, y: 0 }
      default:
        return null
    }
  }

  /**
   * 回転状態に基づいてぷよの配置位置を計算
   */
  private calculatePuyoPositions(
    x: number,
    rotation: number,
    field: { width: number; height: number },
  ): {
    primary: { x: number; y: number }
    secondary: { x: number; y: number }
  } | null {
    // フィールド境界チェック
    if (x < 0 || x >= field.width) {
      return null
    }

    const offset = this.getRotationOffset(rotation)
    if (!offset) {
      return null
    }

    const secondaryX = x + offset.x
    const secondaryY = 0 + offset.y

    // 従ぷよの境界チェック
    if (secondaryX < 0 || secondaryX >= field.width) {
      return null
    }

    return {
      primary: { x, y: 0 },
      secondary: { x: secondaryX, y: secondaryY },
    }
  }

  /**
   * 最終的な落下位置を計算
   */
  private calculateFinalDropPositions(
    positions: {
      primary: { x: number; y: number }
      secondary: { x: number; y: number }
    },
    field: { width: number; height: number; cells: (string | null)[][] },
  ): {
    primaryX: number
    secondaryX: number
    primaryY: number
    secondaryY: number
  } | null {
    const { primary, secondary } = positions

    const primaryFinalY = this.calculateDropPosition(primary.x, field)
    const secondaryFinalY = this.calculateDropPosition(secondary.x, field)

    if (
      !this.isValidDropY(primaryFinalY, field) ||
      !this.isValidDropY(secondaryFinalY, field)
    ) {
      return null
    }

    // 上向き回転の特別処理
    if (secondary.y < 0) {
      return this.handleUpwardRotation(primary.x, secondary.x, primaryFinalY)
    }

    return {
      primaryX: primary.x,
      secondaryX: secondary.x,
      primaryY: primaryFinalY,
      secondaryY: secondaryFinalY,
    }
  }

  /**
   * Y座標が有効な落下位置かチェック
   */
  private isValidDropY(y: number, field: { height: number }): boolean {
    return y >= 0 && y < field.height
  }

  /**
   * 上向き回転（0度）の処理
   */
  private handleUpwardRotation(
    primaryX: number,
    secondaryX: number,
    primaryFinalY: number,
  ): {
    primaryX: number
    secondaryX: number
    primaryY: number
    secondaryY: number
  } | null {
    const adjustedSecondaryY = primaryFinalY - 1
    if (adjustedSecondaryY < 0) {
      return null
    }

    return {
      primaryX,
      secondaryX,
      primaryY: primaryFinalY,
      secondaryY: adjustedSecondaryY,
    }
  }

  /**
   * 指定列での落下位置を計算
   */
  private calculateDropPosition(
    x: number,
    field: { height: number; cells: (string | null)[][] },
  ): number {
    // 下から上に向かって空いている最も下の位置を探す
    for (let y = field.height - 1; y >= 0; y--) {
      if (field.cells[x] && field.cells[x][y] === null) {
        return y
      }
    }
    return -1 // 列が満杯
  }
}
