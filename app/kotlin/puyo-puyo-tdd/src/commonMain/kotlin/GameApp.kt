package com.example.puyopuyo

import androidx.compose.foundation.layout.*
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Surface
import androidx.compose.material.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
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
                GameStage(game)

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
