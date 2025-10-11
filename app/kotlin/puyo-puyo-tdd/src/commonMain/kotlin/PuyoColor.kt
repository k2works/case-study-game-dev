package com.example.puyopuyo

import androidx.compose.ui.graphics.Color

object PuyoColor {
    val Empty = Color.White
    val Red = Color(0xFFFF4444) // 赤ぷよ (type = 1)
    val Blue = Color(0xFF4444FF) // 青ぷよ (type = 2)
    val Green = Color(0xFF44FF44) // 緑ぷよ (type = 3)
    val Yellow = Color(0xFFFFFF44) // 黄ぷよ (type = 4)

    fun getColor(puyoType: Int): Color {
        return when (puyoType) {
            1 -> Red
            2 -> Blue
            3 -> Green
            4 -> Yellow
            else -> Empty
        }
    }
}
