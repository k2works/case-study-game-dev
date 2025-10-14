package com.example.puyopuyo

import androidx.compose.foundation.focusable
import androidx.compose.foundation.layout.*
import androidx.compose.material.Button
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Surface
import androidx.compose.material.Text
import androidx.compose.material.Typography
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.input.key.*
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

// 日本語フォントをサポートするタイポグラフィ
// 注意: Compose Multiplatform Web では現在 CJK フォントの表示に制限があります
// 参照: https://github.com/JetBrains/compose-multiplatform/issues/3967
private val JapaneseTypography = Typography(
    h3 = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Bold,
        fontSize = 48.sp,
    ),
    h5 = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Medium,
        fontSize = 24.sp,
    ),
    body1 = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Normal,
        fontSize = 16.sp,
    ),
    button = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Medium,
        fontSize = 14.sp,
    ),
)

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
    LaunchedEffect(game.mode) {
        // 起動時にフォーカスを要求
        focusRequester.requestFocus()

        frameCount = 0
        while (game.mode != GameMode.GameOver) {
            kotlinx.coroutines.delay(16) // 約60FPS
            frameCount++

            // 約1秒ごとに落下
            if (frameCount % 60 == 0) {
                if (!game.player.moveDown()) {
                    // 移動できなかった場合は着地
                    if (game.player.hasLanded()) {
                        game.player.placePuyoOnStage()

                        // 連鎖処理を実行
                        val chainResult = game.stage.processChain()

                        // 連鎖が発生しなかった場合でも重力を適用
                        if (chainResult.chainCount == 0) {
                            game.stage.applyGravity()
                        }

                        if (chainResult.chainCount > 0) {
                            // 各連鎖のスコアを計算
                            chainResult.chainInfoList.forEachIndexed { index, chainInfo ->
                                val chainNumber = index + 1 // 連鎖数は1から始まる
                                val points =
                                    Score.calculate(
                                        chainInfo.erasedPuyoCount,
                                        chainNumber,
                                    )
                                game.score.add(points)
                            }

                            // 全消し判定を行い、全消しならボーナスを加算
                            if (game.stage.isAllClear()) {
                                val bonus = Score.calculateAllClearBonus()
                                game.score.add(bonus)
                            }
                        }

                        // 新しいぷよを生成
                        game.player.createNewPuyo()

                        // ゲームオーバー判定
                        if (game.player.checkGameOver()) {
                            game.mode = GameMode.GameOver
                        }
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
                    if (game.mode != GameMode.GameOver && event.type == KeyEventType.KeyDown) {
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
        MaterialTheme(
            typography = JapaneseTypography,
        ) {
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

                    Spacer(modifier = Modifier.height(16.dp))

                    // リセットボタン
                    Button(onClick = {
                        game.reset()
                        updateTrigger++
                    }) {
                        Text("リセット")
                    }

                    // ゲームオーバー画面
                    if (game.mode == GameMode.GameOver) {
                        Spacer(modifier = Modifier.height(32.dp))

                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                        ) {
                            Text(
                                text = "GAME OVER",
                                style = MaterialTheme.typography.h3,
                                color = MaterialTheme.colors.error,
                            )

                            Spacer(modifier = Modifier.height(16.dp))

                            Text(
                                text = "最終スコア: ${game.score.value}",
                                style = MaterialTheme.typography.h5,
                            )

                            Spacer(modifier = Modifier.height(24.dp))

                            Button(
                                onClick = {
                                    game.reset()
                                    game.mode = GameMode.Start
                                    updateTrigger++
                                },
                            ) {
                                Text("もう一度プレイする")
                            }
                        }
                    }
                }
            }
        }
    }
}
