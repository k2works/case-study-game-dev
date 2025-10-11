package com.example.puyopuyo

import androidx.compose.foundation.focusable
import androidx.compose.foundation.layout.*
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Surface
import androidx.compose.material.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.input.key.*
import androidx.compose.ui.unit.dp

@Composable
fun GameApp() {
    // ゲームインスタンスの作成と初期化
    val game =
        remember {
            Game().apply {
                initialize()
                player.createNewPuyo()
            }
        }

    // 再描画をトリガーするための状態
    var updateTrigger by remember { mutableStateOf(0) }
    var frameCount by remember { mutableStateOf(0) }

    // フォーカス制御
    val focusRequester = remember { FocusRequester() }

    // ゲームループ：約60FPSで動作
    LaunchedEffect(Unit) {
        // 起動時にフォーカスを要求
        focusRequester.requestFocus()

        while (true) {
            kotlinx.coroutines.delay(16) // 約60FPS
            frameCount++

            // 約1秒ごとに落下
            if (frameCount % 60 == 0) {
                if (!game.player.moveDown()) {
                    // 移動できなかった場合は着地
                    if (game.player.hasLanded()) {
                        game.player.placePuyoOnStage()
                        game.player.createNewPuyo()
                    }
                }
                updateTrigger++ // 再描画をトリガー
            }
        }
    }

    Box(
        modifier =
            Modifier
                .fillMaxSize()
                .focusRequester(focusRequester)
                .onKeyEvent { event ->
                    if (event.type == KeyEventType.KeyDown) {
                        when (event.key) {
                            Key.DirectionLeft -> {
                                game.player.moveLeft()
                                updateTrigger++
                                true
                            }
                            Key.DirectionRight -> {
                                game.player.moveRight()
                                updateTrigger++
                                true
                            }
                            Key.DirectionUp, Key.Z -> {
                                game.player.rotateRight()
                                updateTrigger++
                                true
                            }
                            Key.X -> {
                                game.player.rotateLeft()
                                updateTrigger++
                                true
                            }
                            Key.DirectionDown -> {
                                game.player.moveDown()
                                updateTrigger++
                                true
                            }
                            else -> false
                        }
                    } else {
                        false
                    }
                }
                .focusable(),
    ) {
        MaterialTheme {
            Surface(
                modifier = Modifier.fillMaxSize(),
                color = MaterialTheme.colors.background,
            ) {
                Column(
                    modifier = Modifier.fillMaxSize(),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center,
                ) {
                    // タイトル
                    Text(
                        text = "ぷよぷよ",
                        style = MaterialTheme.typography.h3,
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    // ゲームステージ
                    key(updateTrigger) {
                        GameStage(game)
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // スコア表示
                    Text(
                        text = "スコア: ${game.score.value}",
                        style = MaterialTheme.typography.h5,
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    // ゲームモード表示
                    Text(
                        text = "モード: ${game.mode}",
                        style = MaterialTheme.typography.body1,
                    )
                }
            }
        }
    }
}
