package com.example.puyopuyo

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.unit.dp

@Composable
fun GameStage(game: Game) {
    val puyoSize = game.config.puyoSize.dp
    val width = (game.config.stageWidth * game.config.puyoSize).dp
    val height = (game.config.stageHeight * game.config.puyoSize).dp

    Canvas(modifier = Modifier.size(width, height)) {
        // グリッド線を描画
        for (y in 0..game.config.stageHeight) {
            drawLine(
                color = Color.Gray,
                start = Offset(0f, y * game.config.puyoSize.dp.toPx()),
                end = Offset(size.width, y * game.config.puyoSize.dp.toPx()),
                strokeWidth = 1f,
            )
        }
        for (x in 0..game.config.stageWidth) {
            drawLine(
                color = Color.Gray,
                start = Offset(x * game.config.puyoSize.dp.toPx(), 0f),
                end = Offset(x * game.config.puyoSize.dp.toPx(), size.height),
                strokeWidth = 1f,
            )
        }

        // ステージ上のぷよを描画
        for (y in 0 until game.config.stageHeight) {
            for (x in 0 until game.config.stageWidth) {
                val puyoType = game.stage.getPuyo(x, y)
                if (puyoType != 0) {
                    drawPuyo(x, y, puyoType, game.config.puyoSize)
                }
            }
        }

        // 落下中のぷよを描画
        drawPuyo(game.player.puyoX, game.player.puyoY, game.player.puyoType, game.config.puyoSize)
    }
}

fun DrawScope.drawPuyo(
    x: Int,
    y: Int,
    puyoType: Int,
    puyoSize: Int,
) {
    val pixelSize = puyoSize.dp.toPx()
    val color = PuyoColor.getColor(puyoType)

    // ぷよ本体を描画（角丸四角形）
    drawRoundRect(
        color = color,
        topLeft = Offset(x * pixelSize + 2, y * pixelSize + 2),
        size = Size(pixelSize - 4, pixelSize - 4),
        cornerRadius = CornerRadius(pixelSize / 4),
    )

    // ハイライトを描画（光沢効果）
    drawRoundRect(
        color = Color.White.copy(alpha = 0.3f),
        topLeft = Offset(x * pixelSize + 4, y * pixelSize + 4),
        size = Size(pixelSize / 2, pixelSize / 2),
        cornerRadius = CornerRadius(pixelSize / 6),
    )
}
