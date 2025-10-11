package com.example.puyopuyo

import kotlin.random.Random

class Player(private val config: Config, private val stage: Stage) {
    var puyoX: Int = 2
        private set
    var puyoY: Int = 0
        private set
    var puyoType: Int = 0
        private set
    var childPuyoType: Int = 0
        private set
    var nextPuyoType: Int = 0
        private set
    var rotation: Int = 0
        private set

    fun createNewPuyo() {
        puyoX = 2 // ステージの中央
        puyoY = 0 // 一番上
        puyoType = Random.nextInt(1, 5) // 1〜4のランダムな値
        childPuyoType = Random.nextInt(1, 5) // 子ぷよの種類を設定
        nextPuyoType = Random.nextInt(1, 5)
        rotation = 0 // 回転状態を0（上向き）にリセット
    }

    fun moveDown(): Boolean {
        // 軸ぷよが底に到達していないかチェック
        if (puyoY >= config.stageHeight - 1) {
            return false
        }

        // 軸ぷよの移動先にぷよがないかチェック
        if (stage.getPuyo(puyoX, puyoY + 1) != 0) {
            return false
        }

        // 子ぷよの移動先チェック
        val (childX, childY) = getChildPuyoPosition()
        if (childY >= 0 && childY < config.stageHeight) {
            // 子ぷよが範囲内にある場合
            val newChildY = childY + 1

            // 子ぷよが底を超えるかチェック
            if (newChildY >= config.stageHeight) {
                return false
            }

            // 子ぷよの移動先にぷよがないかチェック
            val newChildX = childX
            if (stage.getPuyo(newChildX, newChildY) != 0) {
                return false
            }
        }

        // 移動可能
        puyoY++
        return true
    }

    fun hasLanded(): Boolean {
        // 軸ぷよの着地判定
        if (puyoY >= config.stageHeight - 1) {
            return true
        }
        if (stage.getPuyo(puyoX, puyoY + 1) != 0) {
            return true
        }

        // 子ぷよの着地判定
        val (childX, childY) = getChildPuyoPosition()

        // 子ぷよが範囲内の場合のみチェック
        if (childY >= 0 && childY < config.stageHeight) {
            // 子ぷよが底に到達したか
            if (childY >= config.stageHeight - 1) {
                return true
            }
            // 子ぷよの下にぷよがあるか
            if (childY + 1 < config.stageHeight && stage.getPuyo(childX, childY + 1) != 0) {
                return true
            }
        }

        return false
    }

    fun placePuyoOnStage() {
        // 軸ぷよを配置
        stage.setPuyo(puyoX, puyoY, puyoType)

        // 子ぷよを配置
        val (childX, childY) = getChildPuyoPosition()
        if (childY >= 0 && childY < config.stageHeight) {
            stage.setPuyo(childX, childY, childPuyoType)
        }
    }

    fun moveLeft() {
        if (puyoX > 0) {
            // 移動先にぷよがないかチェック
            if (stage.getPuyo(puyoX - 1, puyoY) == 0) {
                puyoX--
            }
        }
    }

    fun moveRight() {
        if (puyoX < config.stageWidth - 1) {
            // 移動先にぷよがないかチェック
            if (stage.getPuyo(puyoX + 1, puyoY) == 0) {
                puyoX++
            }
        }
    }

    fun getChildPuyoPosition(): Pair<Int, Int> {
        return when (rotation) {
            0 -> Pair(puyoX, puyoY - 1) // 上
            1 -> Pair(puyoX + 1, puyoY) // 右
            2 -> Pair(puyoX, puyoY + 1) // 下
            3 -> Pair(puyoX - 1, puyoY) // 左
            else -> Pair(puyoX, puyoY - 1)
        }
    }

    fun rotateRight() {
        val newRotation = (rotation + 1) % 4

        // 回転後の子ぷよの位置を計算
        val (childX, childY) =
            when (newRotation) {
                0 -> Pair(puyoX, puyoY - 1)
                1 -> Pair(puyoX + 1, puyoY)
                2 -> Pair(puyoX, puyoY + 1)
                3 -> Pair(puyoX - 1, puyoY)
                else -> Pair(puyoX, puyoY - 1)
            }

        // 壁蹴り処理
        if (childX < 0) {
            puyoX++ // 左端を超える場合、右にずらす
        } else if (childX >= config.stageWidth) {
            puyoX-- // 右端を超える場合、左にずらす
        }

        // 再計算
        val (newChildX, newChildY) =
            when (newRotation) {
                0 -> Pair(puyoX, puyoY - 1)
                1 -> Pair(puyoX + 1, puyoY)
                2 -> Pair(puyoX, puyoY + 1)
                3 -> Pair(puyoX - 1, puyoY)
                else -> Pair(puyoX, puyoY - 1)
            }

        // 衝突チェック
        if (newChildY >= 0 && newChildY < config.stageHeight &&
            newChildX >= 0 && newChildX < config.stageWidth
        ) {
            if (stage.getPuyo(puyoX, puyoY) == 0 &&
                stage.getPuyo(newChildX, newChildY) == 0
            ) {
                rotation = newRotation
            }
        }
    }

    fun rotateLeft() {
        val newRotation = (rotation + 3) % 4

        val (childX, childY) =
            when (newRotation) {
                0 -> Pair(puyoX, puyoY - 1)
                1 -> Pair(puyoX + 1, puyoY)
                2 -> Pair(puyoX, puyoY + 1)
                3 -> Pair(puyoX - 1, puyoY)
                else -> Pair(puyoX, puyoY - 1)
            }

        if (childX < 0) {
            puyoX++
        } else if (childX >= config.stageWidth) {
            puyoX--
        }

        val (newChildX, newChildY) =
            when (newRotation) {
                0 -> Pair(puyoX, puyoY - 1)
                1 -> Pair(puyoX + 1, puyoY)
                2 -> Pair(puyoX, puyoY + 1)
                3 -> Pair(puyoX - 1, puyoY)
                else -> Pair(puyoX, puyoY - 1)
            }

        if (newChildY >= 0 && newChildY < config.stageHeight &&
            newChildX >= 0 && newChildX < config.stageWidth
        ) {
            if (stage.getPuyo(puyoX, puyoY) == 0 &&
                stage.getPuyo(newChildX, newChildY) == 0
            ) {
                rotation = newRotation
            }
        }
    }
}
