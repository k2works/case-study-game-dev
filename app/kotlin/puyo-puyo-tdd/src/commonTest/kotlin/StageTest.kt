package com.example.puyopuyo

import kotlin.test.Test
import kotlin.test.assertEquals

class StageTest {
    @Test
    fun 初期状態では全てのマスが空である() {
        // Arrange
        val config = Config()
        val stage = Stage(config)
        stage.initialize()

        // Act & Assert
        for (y in 0 until config.stageHeight) {
            for (x in 0 until config.stageWidth) {
                assertEquals(0, stage.getPuyo(x, y))
            }
        }
    }

    @Test
    fun ぷよを配置できる() {
        // Arrange
        val config = Config()
        val stage = Stage(config)
        stage.initialize()

        // Act
        stage.setPuyo(2, 10, 1) // (x=2, y=10) に種類1のぷよを配置

        // Assert
        assertEquals(1, stage.getPuyo(2, 10))
    }

    @Test
    fun 複数のぷよを配置できる() {
        // Arrange
        val config = Config()
        val stage = Stage(config)
        stage.initialize()

        // Act
        stage.setPuyo(0, 12, 1) // 赤ぷよ
        stage.setPuyo(1, 12, 2) // 青ぷよ
        stage.setPuyo(2, 12, 3) // 緑ぷよ
        stage.setPuyo(3, 12, 4) // 黄ぷよ

        // Assert
        assertEquals(1, stage.getPuyo(0, 12))
        assertEquals(2, stage.getPuyo(1, 12))
        assertEquals(3, stage.getPuyo(2, 12))
        assertEquals(4, stage.getPuyo(3, 12))
    }

    @Test
    fun ぷよを上書きできる() {
        // Arrange
        val config = Config()
        val stage = Stage(config)
        stage.initialize()
        stage.setPuyo(2, 10, 1)

        // Act
        stage.setPuyo(2, 10, 2) // 上書き

        // Assert
        assertEquals(2, stage.getPuyo(2, 10))
    }

    @Test
    fun 隣接する同じ色のぷよを探索できる() {
        // Arrange
        val config = Config()
        val stage = Stage(config)
        stage.initialize()

        // 縦に4つ並べる
        stage.setPuyo(2, 9, 1)
        stage.setPuyo(2, 10, 1)
        stage.setPuyo(2, 11, 1)
        stage.setPuyo(2, 12, 1)

        // Act
        val connectedPuyos = stage.searchConnectedPuyo(2, 9, 1)

        // Assert
        assertEquals(4, connectedPuyos.size)
    }

    @Test
    fun L字型につながったぷよを探索できる() {
        // Arrange
        val config = Config()
        val stage = Stage(config)
        stage.initialize()

        // L字型に配置
        stage.setPuyo(2, 11, 1)
        stage.setPuyo(2, 12, 1)
        stage.setPuyo(3, 12, 1)
        stage.setPuyo(4, 12, 1)

        // Act
        val connectedPuyos = stage.searchConnectedPuyo(2, 11, 1)

        // Assert
        assertEquals(4, connectedPuyos.size)
    }

    @Test
    fun 消去判定で4つ以上つながったぷよが見つかる() {
        // Arrange
        val config = Config()
        val stage = Stage(config)
        stage.initialize()

        // 縦に4つ並べる（消える）
        stage.setPuyo(2, 9, 1)
        stage.setPuyo(2, 10, 1)
        stage.setPuyo(2, 11, 1)
        stage.setPuyo(2, 12, 1)

        // Act
        val eraseInfo = stage.checkErase()

        // Assert
        assertEquals(4, eraseInfo.erasePuyoCount)
    }

    @Test
    fun 消去判定で3つ以下のぷよは消えない() {
        // Arrange
        val config = Config()
        val stage = Stage(config)
        stage.initialize()

        // 縦に3つだけ並べる（消えない）
        stage.setPuyo(2, 10, 1)
        stage.setPuyo(2, 11, 1)
        stage.setPuyo(2, 12, 1)

        // Act
        val eraseInfo = stage.checkErase()

        // Assert
        assertEquals(0, eraseInfo.erasePuyoCount)
    }

    @Test
    fun 複数の色のぷよが混在していても正しく消去判定できる() {
        // Arrange
        val config = Config()
        val stage = Stage(config)
        stage.initialize()

        // 赤4つ（消える）
        stage.setPuyo(2, 9, 1)
        stage.setPuyo(2, 10, 1)
        stage.setPuyo(2, 11, 1)
        stage.setPuyo(2, 12, 1)

        // 青3つ（消えない）
        stage.setPuyo(3, 10, 2)
        stage.setPuyo(3, 11, 2)
        stage.setPuyo(3, 12, 2)

        // Act
        val eraseInfo = stage.checkErase()

        // Assert
        // 赤の4つだけが消去対象
        assertEquals(4, eraseInfo.erasePuyoCount)
    }
}
