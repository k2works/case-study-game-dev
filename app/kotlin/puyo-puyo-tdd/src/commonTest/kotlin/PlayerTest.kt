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

    @Test
    fun 着地したぷよを配置すると子ぷよもステージに配置される() {
        // Arrange
        val config = Config()
        val stage = Stage(config)
        stage.initialize()
        val player = Player(config, stage)
        player.createNewPuyo()
        val childPuyoType = player.childPuyoType

        // ぷよをステージの底まで移動
        while (!player.hasLanded()) {
            player.moveDown()
        }
        val (childX, childY) = player.getChildPuyoPosition()

        // Act
        player.placePuyoOnStage()

        // Assert
        // 子ぷよがステージ内にある場合のみ配置される
        if (childY >= 0 && childY < config.stageHeight) {
            assertEquals(childPuyoType, stage.getPuyo(childX, childY))
        }
    }

    @Test
    fun ぷよを左に移動できる() {
        // Arrange
        val config = Config()
        val stage = Stage(config)
        stage.initialize()
        val player = Player(config, stage)
        player.createNewPuyo()
        val initialX = player.puyoX

        // Act
        player.moveLeft()

        // Assert
        assertEquals(initialX - 1, player.puyoX)
    }

    @Test
    fun ぷよを右に移動できる() {
        // Arrange
        val config = Config()
        val stage = Stage(config)
        stage.initialize()
        val player = Player(config, stage)
        player.createNewPuyo()
        val initialX = player.puyoX

        // Act
        player.moveRight()

        // Assert
        assertEquals(initialX + 1, player.puyoX)
    }

    @Test
    fun ぷよが左端にある場合は左に移動できない() {
        // Arrange
        val config = Config()
        val stage = Stage(config)
        stage.initialize()
        val player = Player(config, stage)
        player.createNewPuyo()

        // ぷよを左端まで移動
        while (player.puyoX > 0) {
            player.moveLeft()
        }

        // Act
        player.moveLeft()

        // Assert
        assertEquals(0, player.puyoX) // 左端から動かない
    }

    @Test
    fun ぷよが右端にある場合は右に移動できない() {
        // Arrange
        val config = Config()
        val stage = Stage(config)
        stage.initialize()
        val player = Player(config, stage)
        player.createNewPuyo()

        // ぷよを右端まで移動
        while (player.puyoX < config.stageWidth - 1) {
            player.moveRight()
        }

        // Act
        player.moveRight()

        // Assert
        assertEquals(config.stageWidth - 1, player.puyoX) // 右端から動かない
    }

    @Test
    fun 左に他のぷよがある場合は左に移動できない() {
        // Arrange
        val config = Config()
        val stage = Stage(config)
        stage.initialize()
        val player = Player(config, stage)
        player.createNewPuyo()

        // 左側にぷよを配置
        stage.setPuyo(player.puyoX - 1, player.puyoY, 1)
        val initialX = player.puyoX

        // Act
        player.moveLeft()

        // Assert
        assertEquals(initialX, player.puyoX) // 移動しない
    }

    @Test
    fun 右に他のぷよがある場合は右に移動できない() {
        // Arrange
        val config = Config()
        val stage = Stage(config)
        stage.initialize()
        val player = Player(config, stage)
        player.createNewPuyo()

        // 右側にぷよを配置
        stage.setPuyo(player.puyoX + 1, player.puyoY, 1)
        val initialX = player.puyoX

        // Act
        player.moveRight()

        // Assert
        assertEquals(initialX, player.puyoX) // 移動しない
    }

    @Test
    fun 新しいぷよを生成すると子ぷよの種類も設定される() {
        // Arrange
        val config = Config()
        val stage = Stage(config)
        stage.initialize()
        val player = Player(config, stage)

        // Act
        player.createNewPuyo()

        // Assert
        assertTrue(player.childPuyoType in 1..4)
    }

    @Test
    fun 子ぷよの初期位置は軸ぷよの上() {
        // Arrange
        val config = Config()
        val stage = Stage(config)
        stage.initialize()
        val player = Player(config, stage)
        player.createNewPuyo()

        // Act
        val (childX, childY) = player.getChildPuyoPosition()

        // Assert
        assertEquals(player.puyoX, childX)
        assertEquals(player.puyoY - 1, childY) // 軸ぷよの上
    }

    @Test
    fun ぷよを右回転できる() {
        // Arrange
        val config = Config()
        val stage = Stage(config)
        stage.initialize()
        val player = Player(config, stage)
        player.createNewPuyo()
        val initialRotation = player.rotation

        // Act
        player.rotateRight()

        // Assert
        assertEquals((initialRotation + 1) % 4, player.rotation)
    }

    @Test
    fun ぷよを左回転できる() {
        // Arrange
        val config = Config()
        val stage = Stage(config)
        stage.initialize()
        val player = Player(config, stage)
        player.createNewPuyo()

        // Act
        player.rotateLeft()

        // Assert
        assertEquals(3, player.rotation) // 0 から左回転すると 3
    }

    @Test
    fun 壁の近くで回転すると壁蹴りが発生する() {
        // Arrange
        val config = Config()
        val stage = Stage(config)
        stage.initialize()
        val player = Player(config, stage)
        player.createNewPuyo()

        // ぷよを右端まで移動
        while (player.puyoX < config.stageWidth - 1) {
            player.moveRight()
        }

        // Act
        player.rotateRight() // 子ぷよが右に来る回転

        // Assert
        // 壁蹴りで左にずれる
        assertTrue(player.puyoX < config.stageWidth - 1)
    }

    @Test
    fun 子ぷよが下にある状態で地面に着地する() {
        // Arrange
        val config = Config()
        val stage = Stage(config)
        stage.initialize()
        val player = Player(config, stage)
        player.createNewPuyo()

        // 子ぷよを下にする（2回右回転）
        player.rotateRight()
        player.rotateRight()
        assertEquals(2, player.rotation) // 子ぷよが下

        // 底の1つ上まで移動
        while (player.puyoY < config.stageHeight - 2) {
            player.moveDown()
        }

        // Act & Assert
        // この時点で子ぷよ(puyoY + 1)が底(stageHeight - 1)に到達
        assertTrue(player.hasLanded())
    }

    @Test
    fun 子ぷよが下にある状態で他のぷよの上に着地する() {
        // Arrange
        val config = Config()
        val stage = Stage(config)
        stage.initialize()
        val player = Player(config, stage)
        player.createNewPuyo()

        // 底にぷよを配置
        stage.setPuyo(2, 12, 1)

        // 子ぷよを下にする（2回右回転）
        player.rotateRight()
        player.rotateRight()
        assertEquals(2, player.rotation) // 子ぷよが下

        // 底から2つ上まで移動
        while (player.puyoY < config.stageHeight - 3) {
            player.moveDown()
        }

        // Act & Assert
        // この時点で子ぷよ(puyoY + 1)が配置済みぷよの上に到達
        assertTrue(player.hasLanded())
    }

    @Test
    fun 子ぷよが下にある状態で移動できなくなる() {
        // Arrange
        val config = Config()
        val stage = Stage(config)
        stage.initialize()
        val player = Player(config, stage)
        player.createNewPuyo()

        // 底にぷよを配置
        stage.setPuyo(2, 11, 1)

        // 子ぷよを下にする（2回右回転）
        player.rotateRight()
        player.rotateRight()
        assertEquals(2, player.rotation) // 子ぷよが下

        // puyoY=9 まで移動（子ぷよが puyoY=10 になる）
        while (player.puyoY < 9) {
            player.moveDown()
        }

        // Act
        // この時点で子ぷよ（puyoY + 1 = 10）の下（11）に配置済みぷよがある
        val canMove = player.moveDown()

        // Assert
        assertFalse(canMove) // 移動できない
        assertEquals(9, player.puyoY) // 移動していない
    }
}
