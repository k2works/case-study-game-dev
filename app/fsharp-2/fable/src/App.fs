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
let mutable gameState = Game.init()

// 定数
let cellSize = 32.0
let offsetX = 10.0
let offsetY = 100.0

// ぷよの色を取得
let getPuyoColor (color: Types.PuyoColor) =
    match color with
    | Types.PuyoColor.Red -> "#ff0000"
    | Types.PuyoColor.Blue -> "#0000ff"
    | Types.PuyoColor.Green -> "#00ff00"
    | Types.PuyoColor.Yellow -> "#ffff00"
    | Types.PuyoColor.Purple -> "#ff00ff"
    | Types.PuyoColor.Empty -> "#ffffff"

// ぷよを描画する
let drawPuyo (puyo: Types.Puyo) =
    let x = offsetX + float puyo.Position.X * cellSize
    let y = offsetY + float puyo.Position.Y * cellSize
    let centerX = x + cellSize / 2.0
    let centerY = y + cellSize / 2.0
    let radius = (cellSize - 4.0) / 2.0

    // 塗りつぶし
    ctx.fillStyle <- !!(getPuyoColor puyo.Color)
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0.0, 2.0 * System.Math.PI)
    ctx.fill()

    // 枠線
    ctx.strokeStyle <- !!("#000")
    ctx.lineWidth <- 1.0
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0.0, 2.0 * System.Math.PI)
    ctx.stroke()

// 描画関数
let render () =
    // 背景をクリア
    ctx.fillStyle <- !!("#f0f0f0")
    ctx.fillRect(0.0, 0.0, canvas.width, canvas.height)

    // ステージの枠を描画
    ctx.strokeStyle <- !!("#333")
    ctx.lineWidth <- 2.0
    ctx.strokeRect(offsetX, offsetY, float gameState.Stage.Cols * cellSize, float gameState.Stage.Rows * cellSize)

    // テキストを描画
    ctx.fillStyle <- !!("#333")
    ctx.font <- "20px Arial"
    ctx.fillText("ぷよぷよ - F# Fable版", 10.0, 30.0)
    ctx.fillText(sprintf "ステージ: %dx%d" gameState.Stage.Cols gameState.Stage.Rows, 10.0, 60.0)
    ctx.fillText(sprintf "スコア: %d" gameState.Score, 10.0, 80.0)

    // 操作方法を表示
    ctx.fillStyle <- !!("#666")
    ctx.font <- "14px Arial"
    ctx.fillText("←→: 移動  ↑: 回転", 10.0, float gameState.Stage.Rows * cellSize + offsetY + 30.0)

    // ステージ上のぷよを描画
    for row in 0 .. gameState.Stage.Rows - 1 do
        for col in 0 .. gameState.Stage.Cols - 1 do
            let color = gameState.Stage.Cells.[row].[col]
            if color <> Types.PuyoColor.Empty then
                let puyo: Types.Puyo = { Color = color; Position = { X = col; Y = row } }
                drawPuyo puyo

    // 現在のぷよペアを描画
    match gameState.CurrentPuyo with
    | Some pair ->
        drawPuyo pair.Axis
        drawPuyo pair.Child
    | None -> ()

// キーボードイベントハンドラー
let handleKeyDown (e: Event) =
    let ke = e :?> KeyboardEvent
    match ke.key with
    | "ArrowLeft" ->
        gameState <- Game.movePuyoLeft gameState
        render()
    | "ArrowRight" ->
        gameState <- Game.movePuyoRight gameState
        render()
    | "ArrowUp" ->
        gameState <- Game.rotatePuyo gameState
        render()
    | _ -> ()

// ゲームループ
let gameLoop () =
    gameState <- Game.autoFall gameState
    render()

// イベントリスナーを追加
document.addEventListener("keydown", handleKeyDown)

// ゲームループを開始（1秒ごとに落下）
let fallInterval = 1000 // ミリ秒
Browser.Dom.window.setInterval(gameLoop, fallInterval) |> ignore

// 初期描画
render()

// コンソールログ
printfn "ゲーム初期化完了"
printfn "ステージサイズ: %dx%d" gameState.Stage.Cols gameState.Stage.Rows
printfn "操作方法: ←→キーで移動、↑キーで回転"
