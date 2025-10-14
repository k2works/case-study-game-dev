package com.example.puyo

import org.scalajs.dom
import org.scalajs.dom.document

class スコア:
  private var _現在スコア: Int = 0
  private var _現在連鎖数: Int = 0

  def 現在スコア: Int = _現在スコア
  def 現在連鎖数: Int = _現在連鎖数

  def 消去を記録(消去数: Int, 連鎖数: Int): Unit =
    // スコア計算
    // 基本点 = 消去数 × 10
    // 連鎖ボーナス = 連鎖数 × 連鎖数 × 50
    val 基本点 = 消去数 * 10
    val 連鎖ボーナス = if 連鎖数 > 1 then 連鎖数 * 連鎖数 * 50 else 0
    val 獲得点 = 基本点 + 連鎖ボーナス

    _現在スコア += 獲得点
    _現在連鎖数 = 連鎖数

    // 画面に表示
    表示を更新()

  def 連鎖終了(): Unit =
    _現在連鎖数 = 0
    表示を更新()

  private def 表示を更新(): Unit =
    // ブラウザ環境でのみ表示更新
    if scala.scalajs.LinkingInfo.developmentMode || scala.scalajs.LinkingInfo.productionMode then
      try
        val scoreElement = document.getElementById("score")
        val chainElement = document.getElementById("chain")

        if scoreElement != null then
          scoreElement.textContent = _現在スコア.toString

        if chainElement != null then
          chainElement.textContent = _現在連鎖数.toString
      catch
        case _: Throwable => () // テスト環境ではdocumentが存在しない場合がある

  def リセット(): Unit =
    _現在スコア = 0
    _現在連鎖数 = 0
    表示を更新()
