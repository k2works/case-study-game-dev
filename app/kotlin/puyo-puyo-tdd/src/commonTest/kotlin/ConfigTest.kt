package com.example.puyopuyo

import kotlin.test.Test
import kotlin.test.assertEquals

class ConfigTest {
    @Test
    fun ステージの幅が正しく設定されている() {
        // Arrange
        val config = Config()

        // Act & Assert
        assertEquals(6, config.stageWidth)
    }

    @Test
    fun ステージの高さが正しく設定されている() {
        // Arrange
        val config = Config()

        // Act & Assert
        assertEquals(13, config.stageHeight)
    }

    @Test
    fun ぷよのサイズが正しく設定されている() {
        // Arrange
        val config = Config()

        // Act & Assert
        assertEquals(40, config.puyoSize)
    }
}
