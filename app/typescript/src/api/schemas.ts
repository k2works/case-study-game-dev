import { z } from 'zod';

/**
 * Iris 分類リクエストスキーマ
 *
 * @example
 * {
 *   "sepal_length": 5.1,
 *   "sepal_width": 3.5,
 *   "petal_length": 1.4,
 *   "petal_width": 0.2
 * }
 */
export const IrisRequestSchema = z.object({
  sepal_length: z
    .number()
    .nonnegative('がく片の長さは 0 以上である必要があります')
    .describe('がく片の長さ (cm)'),
  sepal_width: z
    .number()
    .nonnegative('がく片の幅は 0 以上である必要があります')
    .describe('がく片の幅 (cm)'),
  petal_length: z
    .number()
    .nonnegative('花弁の長さは 0 以上である必要があります')
    .describe('花弁の長さ (cm)'),
  petal_width: z
    .number()
    .nonnegative('花弁の幅は 0 以上である必要があります')
    .describe('花弁の幅 (cm)'),
});

export type IrisRequest = z.infer<typeof IrisRequestSchema>;

/**
 * Cinema 売上予測リクエストスキーマ
 *
 * @example
 * {
 *   "sns1": 500,
 *   "sns2": 300,
 *   "actor": 70,
 *   "original": 1
 * }
 */
export const CinemaRequestSchema = z.object({
  sns1: z
    .number()
    .int()
    .nonnegative('SNS 言及数 1 は 0 以上である必要があります')
    .describe('SNS プラットフォーム 1 の言及数'),
  sns2: z
    .number()
    .int()
    .nonnegative('SNS 言及数 2 は 0 以上である必要があります')
    .describe('SNS プラットフォーム 2 の言及数'),
  actor: z
    .number()
    .int()
    .min(0)
    .max(100, '主演俳優スコアは 0-100 の範囲である必要があります')
    .describe('主演俳優の知名度スコア (0-100)'),
  original: z
    .number()
    .int()
    .min(0)
    .max(1, 'オリジナル作品フラグは 0 または 1 である必要があります')
    .describe('オリジナル作品かどうか (0: 続編, 1: オリジナル)'),
});

export type CinemaRequest = z.infer<typeof CinemaRequestSchema>;

/**
 * Survived 生存予測リクエストスキーマ
 *
 * @example
 * {
 *   "pclass": 3,
 *   "age": 22,
 *   "sex": "male"
 * }
 */
export const SurvivedRequestSchema = z.object({
  pclass: z
    .number()
    .int()
    .min(1)
    .max(3, '客室クラスは 1, 2, 3 のいずれかである必要があります')
    .describe('客室クラス (1: 上等, 2: 中等, 3: 下等)'),
  age: z
    .number()
    .int()
    .min(0)
    .max(100, '年齢は 0-100 の範囲である必要があります')
    .describe('年齢'),
  sex: z
    .enum(['male', 'female'], {
      message: '性別は male または female である必要があります',
    })
    .describe('性別'),
});

export type SurvivedRequest = z.infer<typeof SurvivedRequestSchema>;

/**
 * Boston 住宅価格予測リクエストスキーマ
 *
 * @example
 * {
 *   "rm": 6.5,
 *   "lstat": 4.98,
 *   "ptratio": 15.3
 * }
 */
export const BostonRequestSchema = z.object({
  rm: z
    .number()
    .positive('部屋数は正の数である必要があります')
    .describe('住宅あたりの平均部屋数'),
  lstat: z
    .number()
    .min(0)
    .max(100, '低所得者人口割合は 0-100% の範囲である必要があります')
    .describe('低所得者人口の割合 (%)'),
  ptratio: z
    .number()
    .positive('生徒と教師の比率は正の数である必要があります')
    .describe('町ごとの生徒と教師の比率'),
});

export type BostonRequest = z.infer<typeof BostonRequestSchema>;

/**
 * Iris 分類レスポンススキーマ
 */
export const IrisResponseSchema = z.object({
  species: z.string().describe('予測された品種'),
});

export type IrisResponse = z.infer<typeof IrisResponseSchema>;

/**
 * Cinema 売上予測レスポンススキーマ
 */
export const CinemaResponseSchema = z.object({
  predicted_sales: z.number().describe('予測された売上（万円）'),
});

export type CinemaResponse = z.infer<typeof CinemaResponseSchema>;

/**
 * Survived 生存予測レスポンススキーマ
 */
export const SurvivedResponseSchema = z.object({
  survived: z.number().int().min(0).max(1).describe('生存予測 (0: 死亡, 1: 生存)'),
});

export type SurvivedResponse = z.infer<typeof SurvivedResponseSchema>;

/**
 * Boston 住宅価格予測レスポンススキーマ
 */
export const BostonResponseSchema = z.object({
  predicted_price: z.number().describe('予測された住宅価格（$1000単位）'),
});

export type BostonResponse = z.infer<typeof BostonResponseSchema>;
