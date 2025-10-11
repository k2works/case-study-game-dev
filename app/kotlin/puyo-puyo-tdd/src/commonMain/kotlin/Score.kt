package com.example.puyopuyo

class Score {
    var value: Int = 0
        private set

    /**
     * スコアを加算します
     */
    fun add(points: Int) {
        value += points
    }

    /**
     * スコアをリセットします
     */
    fun reset() {
        value = 0
    }

    companion object {
        /**
         * スコアを計算します
         *
         * @param erasedCount 消去したぷよの数
         * @param chainCount 連鎖数
         * @return 計算されたスコア
         */
        fun calculate(
            erasedCount: Int,
            chainCount: Int,
        ): Int {
            // 基本点: 消去数 × 10
            val basePoints = erasedCount * 10

            // 連鎖ボーナス倍率
            val chainBonus =
                when (chainCount) {
                    1 -> 1 // 1連鎖: ×1
                    2 -> 8 // 2連鎖: ×8
                    3 -> 16 // 3連鎖: ×16
                    4 -> 32 // 4連鎖: ×32
                    5 -> 64 // 5連鎖: ×64
                    6 -> 96 // 6連鎖: ×96
                    7 -> 128 // 7連鎖: ×128
                    else -> 160 // 8連鎖以上: ×160
                }

            return basePoints * chainBonus
        }

        /**
         * 全消しボーナスを計算します
         *
         * @return 全消しボーナスのポイント
         */
        fun calculateAllClearBonus(): Int {
            return 3600
        }
    }
}
