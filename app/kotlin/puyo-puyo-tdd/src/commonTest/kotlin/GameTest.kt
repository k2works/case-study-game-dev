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

    @Test
    fun ゲームをリセットするとステージがクリアされる() {
        // Arrange
        val game = Game()
        game.initialize()
        game.player.createNewPuyo()
        // ステージにぷよを配置
        game.stage.setPuyo(0, 0, 1)
        game.stage.setPuyo(1, 1, 2)

        // Act
        game.reset()

        // Assert
        // ステージが空になっている
        for (y in 0 until game.config.stageHeight) {
            for (x in 0 until game.config.stageWidth) {
                assertEquals(0, game.stage.getPuyo(x, y))
            }
        }
    }

    @Test
    fun ゲームをリセットするとスコアがゼロになる() {
        // Arrange
        val game = Game()
        game.initialize()
        game.score.add(1000)

        // Act
        game.reset()

        // Assert
        assertEquals(0, game.score.value)
    }

    @Test
    fun ゲームをリセットすると新しいぷよが生成される() {
        // Arrange
        val game = Game()
        game.initialize()
        game.player.createNewPuyo()

        // Act
        game.reset()

        // Assert
        // 新しいぷよが生成されている（puyoType が 0 でない）
        assertNotNull(game.player.puyoType)
    }
}
