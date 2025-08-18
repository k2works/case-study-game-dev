import type { AIGameState, PossibleMove } from '../../domain/models/ai/types.ts'

/**
 * 手生成ポート
 * 可能な手を生成するインターフェース
 */
export interface MoveGeneratorPort {
  /** 可能な手を生成 */
  generateMoves(gameState: AIGameState): PossibleMove[]
}
