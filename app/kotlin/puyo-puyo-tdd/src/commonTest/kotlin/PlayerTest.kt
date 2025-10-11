package com.example.puyopuyo

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class PlayerTest {
    @Test
    fun 新しいぷよを生成すると初期位置に配置される() {
        // Arrange
        val config = Config()
        val stage = Stage(config)
        stage.initialize()
        val player = Player(config, stage)

        // Act
        player.createNewPuyo()

        // Assert
        assertEquals(2, player.puyoX) // ステージの中央（6マスの場合、x=2）
        assertEquals(0, player.puyoY) // 一番上（y=0）
    }

    @Test
    fun 新しいぷよを生成するとぷよの種類が設定される() {
        // Arrange
        val config = Config()
        val stage = Stage(config)
        stage.initialize()
        val player = Player(config, stage)

        // Act
        player.createNewPuyo()

        // Assert
        // ぷよの種類は1〜4のいずれか
        assertTrue(player.puyoType in 1..4)
    }

    @Test
    fun 新しいぷよを生成すると次のぷよも決まる() {
        // Arrange
        val config = Config()
        val stage = Stage(config)
        stage.initialize()
        val player = Player(config, stage)

        // Act
        player.createNewPuyo()

        // Assert
        // 次のぷよの種類も1〜4のいずれか
        assertTrue(player.nextPuyoType in 1..4)
    }

    @Test
    fun 新しいぷよを生成すると回転状態が0になる() {
        // Arrange
        val config = Config()
        val stage = Stage(config)
        stage.initialize()
        val player = Player(config, stage)

        // Act
        player.createNewPuyo()

        // Assert
        assertEquals(0, player.rotation)
    }

    @Test
    fun ぷよを下に移動できる() {
        // Arrange
        val config = Config()
        val stage = Stage(config)
        stage.initialize()
        val player = Player(config, stage)
        player.createNewPuyo()
        val initialY = player.puyoY

        // Act
        val result = player.moveDown()

        // Assert
        assertTrue(result) // 移動成功
        assertEquals(initialY + 1, player.puyoY)
    }

    @Test
    fun ぷよがステージの底に到達したら移動できない() {
        // Arrange
        val config = Config()
        val stage = Stage(config)
        stage.initialize()
        val player = Player(config, stage)
        player.createNewPuyo()

        // ぷよをステージの底まで移動
        while (player.puyoY < config.stageHeight - 1) {
            player.moveDown()
        }

        // Act
        val result = player.moveDown()

        // Assert
        assertFalse(result) // 移動失敗
    }

    @Test
    fun ぷよが着地判定できる() {
        // Arrange
        val config = Config()
        val stage = Stage(config)
        stage.initialize()
        val player = Player(config, stage)
        player.createNewPuyo()

        // ぷよをステージの底まで移動
        while (player.puyoY < config.stageHeight - 1) {
            player.moveDown()
        }

        // Act
        val hasLanded = player.hasLanded()

        // Assert
        assertTrue(hasLanded)
    }

    @Test
    fun 着地したぷよをステージに配置できる() {
        // Arrange
        val config = Config()
        val stage = Stage(config)
        stage.initialize()
        val player = Player(config, stage)
        player.createNewPuyo()
        val puyoType = player.puyoType

        // ぷよをステージの底まで移動
        while (!player.hasLanded()) {
            player.moveDown()
        }
        val finalX = player.puyoX
        val finalY = player.puyoY

        // Act
        player.placePuyoOnStage()

        // Assert
        assertEquals(puyoType, stage.getPuyo(finalX, finalY))
    }
}
