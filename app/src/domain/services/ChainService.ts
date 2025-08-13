import type { Field } from '../models/Field'
import {
  type EliminationResult,
  EliminationService,
} from './EliminationService'
import { GravityService } from './GravityService'

export interface ChainResult {
  chainCount: number
  totalScore: number
  eliminationResults: EliminationResult[]
}

export class ChainService {
  private eliminationService = new EliminationService()
  private gravityService = new GravityService()

  processChain(field: Field): ChainResult {
    const eliminationResults: EliminationResult[] = []
    let chainCount = 0
    let totalScore = 0

    while (true) {
      const eliminableGroups =
        this.eliminationService.findEliminableGroups(field)

      if (eliminableGroups.length === 0) {
        break // 連鎖終了
      }

      chainCount++
      const eliminationResult = this.eliminationService.eliminateGroups(
        field,
        eliminableGroups,
      )

      // 連鎖ボーナス適用
      const chainBonus = this.calculateChainBonus(chainCount)
      eliminationResult.totalScore *= chainBonus

      eliminationResults.push(eliminationResult)
      totalScore += eliminationResult.totalScore

      // 重力適用
      this.gravityService.applyGravity(field)
    }

    return {
      chainCount,
      totalScore,
      eliminationResults,
    }
  }

  private calculateChainBonus(chainCount: number): number {
    // 連鎖ボーナス計算
    // 1連鎖: 1倍, 2連鎖: 8倍, 3連鎖: 16倍, 4連鎖: 32倍...
    const bonusTable = [
      1, 8, 16, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416,
      448, 480, 512,
    ]
    return bonusTable[Math.min(chainCount - 1, bonusTable.length - 1)]
  }
}
