// src/App.fs
module App

open Browser.Dom
open Browser.Types
open Fable.Core.JsInterop
open PuyoPuyo

// キャンバスの設定
let canvas = document.getElementById("game-canvas") :?> HTMLCanvasElement
let ctx = canvas.getContext_2d()

// ゲームの初期化
let gameState = Game.init()

// 描画関数
let render () =
    // 背景をクリア
    ctx.fillStyle <- !!("#f0f0f0")
    ctx.fillRect(0.0, 0.0, canvas.width, canvas.height)

    // テキストを描画
    ctx.fillStyle <- !!("#333")
    ctx.font <- "20px Arial"
    ctx.fillText("ぷよぷよ - F# Fable版", 10.0, 30.0)
    ctx.fillText(sprintf "ステージ: %dx%d" gameState.Stage.Cols gameState.Stage.Rows, 10.0, 60.0)
    ctx.fillText(sprintf "スコア: %d" gameState.Score, 10.0, 90.0)

// 初期描画
render()

// コンソールログ
printfn "ゲーム初期化完了"
printfn "ステージサイズ: %dx%d" gameState.Stage.Cols gameState.Stage.Rows
