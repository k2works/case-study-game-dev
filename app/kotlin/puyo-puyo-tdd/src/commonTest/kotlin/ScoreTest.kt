package com.example.puyopuyo

import kotlin.test.Test
import kotlin.test.assertEquals

class ScoreTest {
    @Test
    fun スコアの初期値は0() {
        val score = Score()

        assertEquals(0, score.value)
    }

    @Test
    fun スコアを加算できる() {
        val score = Score()

        score.add(100)

        assertEquals(100, score.value)
    }

    @Test
    fun スコアをリセットできる() {
        val score = Score()
        score.add(500)

        score.reset()

        assertEquals(0, score.value)
    }

    @Test
    fun 消去数に応じてスコアを計算できる() {
        // 4個消去、1連鎖
        val score1 = Score.calculate(erasedCount = 4, chainCount = 1)
        assertEquals(40, score1) // 4 × 10 × 1 = 40

        // 5個消去、1連鎖
        val score2 = Score.calculate(erasedCount = 5, chainCount = 1)
        assertEquals(50, score2) // 5 × 10 × 1 = 50
    }

    @Test
    fun 連鎖数に応じてスコアボーナスが増える() {
        // 4個消去、1連鎖
        val score1 = Score.calculate(erasedCount = 4, chainCount = 1)
        assertEquals(40, score1) // 4 × 10 × 1 = 40

        // 4個消去、2連鎖
        val score2 = Score.calculate(erasedCount = 4, chainCount = 2)
        assertEquals(320, score2) // 4 × 10 × 8 = 320

        // 4個消去、3連鎖
        val score3 = Score.calculate(erasedCount = 4, chainCount = 3)
        assertEquals(640, score3) // 4 × 10 × 16 = 640
    }

    @Test
    fun 高連鎖になるほどボーナスが大きくなる() {
        // 5連鎖
        val score5 = Score.calculate(erasedCount = 4, chainCount = 5)
        assertEquals(2560, score5) // 4 × 10 × 64 = 2560

        // 8連鎖以上
        val score8 = Score.calculate(erasedCount = 4, chainCount = 8)
        assertEquals(6400, score8) // 4 × 10 × 160 = 6400

        // 10連鎖（8連鎖以上は同じボーナス）
        val score10 = Score.calculate(erasedCount = 4, chainCount = 10)
        assertEquals(6400, score10) // 4 × 10 × 160 = 6400
    }
}
