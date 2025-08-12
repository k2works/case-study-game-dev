/**
 * プレゼンテーション層用の型定義
 * ドメイン層への依存を避けるため、プレーンなオブジェクト型として定義
 */

export interface PuyoData {
  color: string
}

export interface PuyoPairData {
  main: PuyoData
  sub: PuyoData
}

export interface GameStateData {
  isPlaying: boolean
  isPaused: boolean
  isGameOver: boolean
  currentScore: number
  chainCount: number
  fieldData: PuyoData[][]
  nextPair: PuyoPairData | null
}

export interface ChainData {
  count: number
  score: number
  isActive: boolean
}
