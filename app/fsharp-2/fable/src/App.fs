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

// キー入力の状態
let mutable isDownKeyPressed = false

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
    ctx.fillText("←→: 移動  ↑: 回転  ↓: 高速落下", 10.0, float gameState.Stage.Rows * cellSize + offsetY + 30.0)

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

    // ゲームオーバー表示
    if gameState.IsGameOver then
        // 半透明の黒背景
        ctx.fillStyle <- !!"rgba(0, 0, 0, 0.7)"
        ctx.fillRect(offsetX, offsetY, float gameState.Stage.Cols * cellSize, float gameState.Stage.Rows * cellSize)

        // ゲームオーバーテキスト
        ctx.fillStyle <- !!("#ff0000")
        ctx.font <- "bold 48px Arial"
        ctx.textAlign <- "center"
        ctx.fillText("GAME OVER", offsetX + float gameState.Stage.Cols * cellSize / 2.0, offsetY + float gameState.Stage.Rows * cellSize / 2.0)

        // 最終スコア
        ctx.fillStyle <- !!("#ffffff")
        ctx.font <- "24px Arial"
        ctx.fillText(sprintf "Score: %d" gameState.Score, offsetX + float gameState.Stage.Cols * cellSize / 2.0, offsetY + float gameState.Stage.Rows * cellSize / 2.0 + 50.0)

        // リスタートメッセージ
        ctx.font <- "18px Arial"
        ctx.fillText("Press R to Restart", offsetX + float gameState.Stage.Cols * cellSize / 2.0, offsetY + float gameState.Stage.Rows * cellSize / 2.0 + 90.0)

        // textAlignを戻す
        ctx.textAlign <- "left"

// キーボードイベントハンドラー
let handleKeyDown (e: Event) =
    let ke = e :?> KeyboardEvent

    // ゲームオーバー時はRキーのみ受け付ける
    if gameState.IsGameOver then
        match ke.key with
        | "r" | "R" ->
            // ゲームをリセット
            gameState <- Game.init()
            isDownKeyPressed <- false
            render()
        | _ -> ()
    else
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
        | "ArrowDown" ->
            isDownKeyPressed <- true
        | _ -> ()

let handleKeyUp (e: Event) =
    let ke = e :?> KeyboardEvent
    match ke.key with
    | "ArrowDown" ->
        isDownKeyPressed <- false
    | _ -> ()

// ゲームループ
let mutable lastFallTime = 0.0
let baseFallInterval = 1000.0 // 基本落下間隔（ミリ秒）

let rec update (currentTime: float) =
    // ゲームオーバー時以外はゲームを更新
    if not gameState.IsGameOver then
        let speed = Player.getDropSpeed isDownKeyPressed
        let fallInterval = baseFallInterval / speed

        if currentTime - lastFallTime >= fallInterval then
            gameState <- Game.autoFall gameState
            lastFallTime <- currentTime
            render()

    // ゲームオーバー時でもループは継続（リスタート時に再開するため）
    Browser.Dom.window.requestAnimationFrame(update) |> ignore

// イベントリスナーを追加
document.addEventListener("keydown", handleKeyDown)
document.addEventListener("keyup", handleKeyUp)

// ゲームループを開始
Browser.Dom.window.requestAnimationFrame(update) |> ignore

// 初期描画
render()

// コンソールログ
printfn "ゲーム初期化完了"
printfn "ステージサイズ: %dx%d" gameState.Stage.Cols gameState.Stage.Rows
printfn "操作方法: ←→キーで移動、↑キーで回転"
