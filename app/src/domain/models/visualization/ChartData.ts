/**
 * チャートデータドメインモデル
 * データ可視化のためのチャートデータ構造を定義
 */

/**
 * チャートデータポイント
 */
export interface ChartDataPoint {
  readonly label: string // データポイントのラベル
  readonly value: number // メインの値
  readonly timestamp?: Date // タイムスタンプ（時系列データ用）
  readonly [key: string]: string | number | Date | undefined // 追加プロパティ
}

/**
 * チャートシリーズ
 */
export interface ChartSeries {
  readonly name: string // シリーズ名
  readonly dataKey: string // データキー
  readonly color: string // 色（hex形式）
  readonly strokeWidth?: number // 線の太さ
}

/**
 * ラインチャートデータ
 */
export interface LineChartData {
  readonly title: string // チャートタイトル
  readonly data: readonly ChartDataPoint[] // データポイント配列
  readonly series: readonly ChartSeries[] // シリーズ配列
  readonly xAxisLabel?: string // X軸ラベル
  readonly yAxisLabel?: string // Y軸ラベル
}

/**
 * 値フォーマットタイプ
 */
export type ValueFormatType = 'number' | 'percentage' | 'time'

/**
 * チャートデータポイント作成
 */
export const createChartDataPoint = (params: {
  label: string
  value: number
  timestamp?: Date
  [key: string]: string | number | Date | undefined
}): ChartDataPoint => ({
  label: params.label,
  value: params.value,
  timestamp: params.timestamp,
  ...Object.fromEntries(
    Object.entries(params).filter(([key]) => !['label', 'value', 'timestamp'].includes(key))
  ),
})

/**
 * チャートデータポイント検証
 */
export const isValidChartDataPoint = (dataPoint: ChartDataPoint): boolean => {
  return (
    dataPoint.label.length > 0 &&
    typeof dataPoint.value === 'number' &&
    !isNaN(dataPoint.value) &&
    isFinite(dataPoint.value)
  )
}

/**
 * チャート値フォーマット
 */
export const formatChartValue = (
  value: number,
  format: ValueFormatType = 'number'
): string => {
  switch (format) {
    case 'percentage':
      return `${(value * 100).toFixed(1)}%`
    case 'time':
      return formatTimeValue(value)
    case 'number':
    default:
      return Math.round(value).toLocaleString()
  }
}

/**
 * 時間値フォーマット（ミリ秒を分秒形式に変換）
 */
const formatTimeValue = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}分${seconds}秒`
}

/**
 * ラインチャートデータ作成
 */
export const createLineChartData = (params: {
  title: string
  data: ChartDataPoint[]
  series: ChartSeries[]
  xAxisLabel?: string
  yAxisLabel?: string
}): LineChartData => ({
  title: params.title,
  data: params.data,
  series: params.series,
  xAxisLabel: params.xAxisLabel,
  yAxisLabel: params.yAxisLabel,
})

/**
 * デフォルトのチャート色パレット
 */
export const DEFAULT_CHART_COLORS = [
  '#8884d8', // 青
  '#82ca9d', // 緑
  '#ffc658', // オレンジ
  '#ff7c7c', // 赤
  '#8dd1e1', // 水色
  '#d084d0', // 紫
  '#ffb347', // ピーチ
  '#87ceeb', // スカイブルー
] as const