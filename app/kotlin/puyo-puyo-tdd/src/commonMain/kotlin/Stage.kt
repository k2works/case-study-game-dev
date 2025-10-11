package com.example.puyopuyo

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
}
