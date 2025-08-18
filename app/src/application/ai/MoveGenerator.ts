/**
 * 手生成サービス
 * AI用の可能な手を生成する
 */
import type { MoveGeneratorPort } from '../../domain/ai/ports'
import type { AIGameState, PossibleMove } from '../../domain/ai/types'

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

    return moves.filter((move) => move.isValid)
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

    const isValid = this.isValidPlacement(positions, field)

    return {
      x,
      rotation,
      isValid,
      primaryPosition: positions.primary,
      secondaryPosition: positions.secondary,
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
  ): { primary: { x: number; y: number }; secondary: { x: number; y: number } } | null {
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
   * 境界チェック
   */
  private isWithinBounds(
    positions: { primary: { x: number; y: number }; secondary: { x: number; y: number } },
    field: { width: number; height: number },
  ): boolean {
    const { primary, secondary } = positions
    return (
      primary.x >= 0 &&
      primary.x < field.width &&
      secondary.x >= 0 &&
      secondary.x < field.width
    )
  }

  /**
   * 配置が有効かどうかをチェック
   */
  private isValidPlacement(
    positions: { primary: { x: number; y: number }; secondary: { x: number; y: number } },
    field: { width: number; height: number; cells: (string | null)[][] },
  ): boolean {
    if (!this.isWithinBounds(positions, field)) {
      return false
    }

    const { primary, secondary } = positions

    // 各ぷよの落下先を計算
    const primaryFinalY = this.calculateDropPosition(primary.x, field)
    const secondaryFinalY = this.calculateDropPosition(secondary.x, field)

    // 落下先が有効範囲内かチェック
    if (
      primaryFinalY < 0 ||
      primaryFinalY >= field.height ||
      secondaryFinalY < 0 ||
      secondaryFinalY >= field.height
    ) {
      return false
    }

    // 配置可能性をチェック
    return this.canPlacePuyoPair(
      primary.x,
      secondary.x,
      primaryFinalY,
      secondaryFinalY,
      field,
    )
  }

  /**
   * 指定列での落下位置を計算
   */
  private calculateDropPosition(x: number, field: { height: number; cells: (string | null)[][] }): number {
    for (let y = field.height - 1; y >= 0; y--) {
      if (field.cells[x] && field.cells[x][y] === null) {
        return y
      }
    }
    return -1 // 列が満杯
  }

  /**
   * ぷよペアが配置可能かチェック
   */
  private canPlacePuyoPair(
    primaryX: number,
    secondaryX: number,
    primaryY: number,
    secondaryY: number,
    field: { cells: (string | null)[][] },
  ): boolean {
    // 同じ位置に配置しようとしていないかチェック
    if (primaryX === secondaryX && primaryY === secondaryY) {
      return false
    }

    // 各位置が空いているかチェック
    const isPrimaryEmpty = field.cells[primaryX] && field.cells[primaryX][primaryY] === null
    const isSecondaryEmpty = field.cells[secondaryX] && field.cells[secondaryX][secondaryY] === null

    return isPrimaryEmpty && isSecondaryEmpty
  }
}