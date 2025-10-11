package com.example.puyopuyo

data class PuyoPosition(val x: Int, val y: Int, val type: Int)

class Stage(private val config: Config) {
    private lateinit var field: Array<IntArray>

    fun initialize() {
        field = Array(config.stageHeight) { IntArray(config.stageWidth) { 0 } }
    }

    fun getPuyo(
        x: Int,
        y: Int,
    ): Int = field[y][x]

    fun setPuyo(
        x: Int,
        y: Int,
        puyoType: Int,
    ) {
        field[y][x] = puyoType
    }

    /**
     * 接続されたぷよを探索します（深さ優先探索）
     */
    fun searchConnectedPuyo(
        x: Int,
        y: Int,
        type: Int,
        visited: Array<BooleanArray> = Array(config.stageHeight) { BooleanArray(config.stageWidth) },
        result: MutableList<PuyoPosition> = mutableListOf(),
    ): List<PuyoPosition> {
        // 範囲外チェック
        if (x !in 0 until config.stageWidth || y !in 0 until config.stageHeight) {
            return result
        }

        // 訪問済みチェック
        if (visited[y][x]) {
            return result
        }

        // 同じ色かチェック
        if (field[y][x] != type) {
            return result
        }

        // 訪問済みにする
        visited[y][x] = true
        result.add(PuyoPosition(x, y, type))

        // 上下左右を再帰的に探索
        searchConnectedPuyo(x - 1, y, type, visited, result) // 左
        searchConnectedPuyo(x + 1, y, type, visited, result) // 右
        searchConnectedPuyo(x, y - 1, type, visited, result) // 上
        searchConnectedPuyo(x, y + 1, type, visited, result) // 下

        return result
    }
}
