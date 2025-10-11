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
}
