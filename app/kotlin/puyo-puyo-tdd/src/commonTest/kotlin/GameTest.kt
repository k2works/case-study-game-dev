package com.example.puyopuyo

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

class GameTest {
    @Test
    fun ゲームを初期化すると必要なコンポーネントが作成される() {
        // Arrange
        val game = Game()

        // Act
        game.initialize()

        // Assert
        assertNotNull(game.config)
        assertNotNull(game.stage)
        assertNotNull(game.player)
        assertNotNull(game.score)
    }

    @Test
    fun ゲームを初期化するとゲームモードがStartになる() {
        // Arrange
        val game = Game()

        // Act
        game.initialize()

        // Assert
        assertEquals(GameMode.Start, game.mode)
    }
}
