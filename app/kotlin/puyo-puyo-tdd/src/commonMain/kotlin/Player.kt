package com.example.puyopuyo

import kotlin.random.Random

class Player(private val config: Config, private val stage: Stage) {
    var puyoX: Int = 2
        private set
    var puyoY: Int = 0
        private set
    var puyoType: Int = 0
        private set
    var nextPuyoType: Int = 0
        private set
    var rotation: Int = 0
        private set

    fun createNewPuyo() {
        puyoX = 2 // ステージの中央
        puyoY = 0 // 一番上
        puyoType = Random.nextInt(1, 5) // 1〜4のランダムな値
        nextPuyoType = Random.nextInt(1, 5)
        rotation = 0 // 回転状態を0（上向き）にリセット
    }

    fun moveDown(): Boolean {
        if (puyoY < config.stageHeight - 1) {
            // 移動先にぷよがないかチェック
            if (stage.getPuyo(puyoX, puyoY + 1) == 0) {
                puyoY++
                return true
            }
        }
        return false
    }

    fun hasLanded(): Boolean {
        // ステージの底に到達したか
        if (puyoY >= config.stageHeight - 1) {
            return true
        }
        // 下にぷよがあるか
        if (stage.getPuyo(puyoX, puyoY + 1) != 0) {
            return true
        }
        return false
    }

    fun placePuyoOnStage() {
        stage.setPuyo(puyoX, puyoY, puyoType)
    }
}
