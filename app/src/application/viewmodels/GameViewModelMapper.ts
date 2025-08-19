import type { FieldData } from '../../domain/models/Field.ts'
import { getPuyoAt } from '../../domain/models/Field.ts'
import type { Game } from '../../domain/models/Game'
import type { PuyoColor, PuyoData } from '../../domain/models/Puyo'
import type { PuyoPair } from '../../domain/models/PuyoPair'
import type { Score } from '../../domain/models/Score'
import { getDisplayScore } from '../../domain/models/Score'
import type {
  FieldViewModel,
  GameStateViewModel,
  GameViewModel,
  PuyoColorViewModel,
  PuyoPairViewModel,
  PuyoViewModel,
  ScoreViewModel,
} from './GameViewModel'

/**
 * ドメインエンティティをViewModelに変換するマッパークラス
 * Presentation層がDomain層に直接依存しないように変換を行う
 */
export class GameViewModelMapper {
  /**
   * GameドメインモデルをGameViewModelに変換
   */
  static toGameViewModel(game: Game): GameViewModel {
    return {
      id: game.id,
      state: this.toGameStateViewModel(game.state),
      field: this.toFieldViewModel(game.field),
      score: this.toScoreViewModel(game.score),
      level: game.level,
      currentPuyoPair: game.currentPuyoPair
        ? this.toPuyoPairViewModel(game.currentPuyoPair)
        : null,
      nextPuyoPair: game.nextPuyoPair
        ? this.toPuyoPairViewModel(game.nextPuyoPair)
        : null,
      lastChain: 0, // 現在のドメインモデルには連鎖数がないのでデフォルト値
      createdAt: game.createdAt.toISOString(),
      updatedAt: game.updatedAt.toISOString(),
    }
  }

  /**
   * GameStateをGameStateViewModelに変換
   */
  private static toGameStateViewModel(
    state: Game['state'],
  ): GameStateViewModel {
    return state as GameStateViewModel
  }

  /**
   * FieldドメインモデルをFieldViewModelに変換
   */
  private static toFieldViewModel(field: FieldData): FieldViewModel {
    const cells: (PuyoViewModel | null)[][] = []

    for (let x = 0; x < field.width; x++) {
      cells[x] = []
      for (let y = 0; y < field.height; y++) {
        const puyo = getPuyoAt({ x, y }, field)
        cells[x][y] = puyo ? this.toPuyoViewModel(puyo) : null
      }
    }

    return {
      width: field.width,
      height: field.height,
      cells,
    }
  }

  /**
   * PuyoドメインモデルをPuyoViewModelに変換
   */
  private static toPuyoViewModel(puyo: PuyoData): PuyoViewModel {
    return {
      id: `${puyo.position.x}-${puyo.position.y}`, // ドメインにはIDがないので位置から生成
      color: this.toPuyoColorViewModel(puyo.color),
      x: puyo.position.x,
      y: puyo.position.y,
    }
  }

  /**
   * PuyoColorをPuyoColorViewModelに変換
   */
  private static toPuyoColorViewModel(color: PuyoColor): PuyoColorViewModel {
    return color as PuyoColorViewModel
  }

  /**
   * PuyoPairドメインモデルをPuyoPairViewModelに変換
   */
  private static toPuyoPairViewModel(puyoPair: PuyoPair): PuyoPairViewModel {
    return {
      id: `pair-${puyoPair.main.position.x}-${puyoPair.main.position.y}`, // ドメインにはIDがないので位置から生成
      main: this.toPuyoViewModel(puyoPair.main),
      sub: this.toPuyoViewModel(puyoPair.sub),
      x: puyoPair.main.position.x, // メインぷよの位置をペアの位置とする
      y: puyoPair.main.position.y,
      rotation: 0, // ドメインには回転情報がないのでデフォルト値
    }
  }

  /**
   * ScoreドメインモデルをScoreViewModelに変換
   */
  private static toScoreViewModel(score: Score): ScoreViewModel {
    return {
      current: score.current,
      high: 0, // ドメインにはhighスコアがないのでデフォルト値
      display: getDisplayScore(score),
      chainBonus: 0, // ドメインにはchainBonusがないのでデフォルト値
      colorBonus: 0, // ドメインにはcolorBonusがないのでデフォルト値
    }
  }
}
