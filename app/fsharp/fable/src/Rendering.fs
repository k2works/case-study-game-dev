module Puyo.Rendering

open Puyo
open Puyo.BoardModule
open Puyo.PuyoManagement
open Fable.Core
open Browser.Types
open Browser.Dom

let cellSize = 30.0

/// 色を CSS カラーコードに変換
let colorToHex (color: Color) : string =
    match color with
    | Red -> "#ff4444"
    | Green -> "#44ff44"
    | Blue -> "#4444ff"
    | Yellow -> "#ffff44"
    | Purple -> "#ff44ff"

/// セルを CSS カラーコードに変換
let cellToHex (cell: Cell) : string =
    match cell with
    | Empty -> "#ffffff"
    | Filled color -> colorToHex color

/// Canvas コンテキストの初期化
let initCanvas (canvasId: string) : CanvasRenderingContext2D option =
    match document.getElementById canvasId with
    | null -> None
    | canvas ->
        let canvasElement = canvas :?> HTMLCanvasElement
        canvasElement.width <- float (boardWidth * int cellSize)
        canvasElement.height <- float (boardHeight * int cellSize)
        Some (canvasElement.getContext_2d())

/// 単一セルの描画（円形）
let drawCell (ctx: CanvasRenderingContext2D) (x: int) (y: int) (color: string) : unit =
    let centerX = float x * cellSize + cellSize / 2.0
    let centerY = float y * cellSize + cellSize / 2.0
    let radius = cellSize / 2.5

    // 背景（枠線）
    ctx.strokeStyle <- U3.Case1 "#dddddd"
    ctx.lineWidth <- 1.0
    ctx.strokeRect(float x * cellSize, float y * cellSize, cellSize, cellSize)

    // ぷよ（円形）
    if color <> "#ffffff" then
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0.0, 2.0 * System.Math.PI)
        ctx.fillStyle <- U3.Case1 color
        ctx.fill()
        ctx.strokeStyle <- U3.Case1 "#333333"
        ctx.lineWidth <- 2.0
        ctx.stroke()

/// ボード全体の描画
let renderBoard (ctx: CanvasRenderingContext2D) (board: Board) : unit =
    // 背景クリア
    ctx.fillStyle <- U3.Case1 "#f0f0f0"
    ctx.fillRect(0.0, 0.0, float board.Width * cellSize, float board.Height * cellSize)

    // 各セルを描画
    for y in 0 .. (board.Height - 1) do
        for x in 0 .. (board.Width - 1) do
            let cell = board.Cells.[y].[x]
            let color = cellToHex cell
            drawCell ctx x y color

/// 組ぷよの描画
let renderPuyoPair (ctx: CanvasRenderingContext2D) (pair: PuyoPair) : unit =
    let (pos1, pos2) = getPuyoPairPositions pair
    let color1 = colorToHex pair.Puyo1Color
    let color2 = colorToHex pair.Puyo2Color

    drawCell ctx pos1.X pos1.Y color1
    drawCell ctx pos2.X pos2.Y color2

/// NEXT ぷよの描画
let renderNextPuyo (canvasId: string) (nextPair: PuyoPair option) : unit =
    match document.getElementById canvasId with
    | null -> ()
    | canvas ->
        let canvasElement = canvas :?> HTMLCanvasElement
        let ctx = canvasElement.getContext_2d()

        // 背景クリア
        ctx.fillStyle <- U3.Case1 "#f8f8f8"
        ctx.fillRect(0.0, 0.0, canvasElement.width, canvasElement.height)

        match nextPair with
        | None -> ()
        | Some pair ->
            let color1 = colorToHex pair.Puyo1Color
            let color2 = colorToHex pair.Puyo2Color

            // puyo1 を上に描画
            ctx.beginPath()
            ctx.arc(30.0, 25.0, 8.0, 0.0, 2.0 * System.Math.PI)
            ctx.fillStyle <- U3.Case1 color1
            ctx.fill()

            // puyo2 を下に描画
            ctx.beginPath()
            ctx.arc(30.0, 45.0, 8.0, 0.0, 2.0 * System.Math.PI)
            ctx.fillStyle <- U3.Case1 color2
            ctx.fill()

/// ゲーム情報の表示更新
let updateScoreDisplay (score: int) : unit =
    match document.getElementById "score" with
    | null -> ()
    | element -> element.textContent <- string score

let updateLevelDisplay (level: int) : unit =
    match document.getElementById "level" with
    | null -> ()
    | element -> element.textContent <- string level

let updateChainDisplay (chainCount: int) : unit =
    match document.getElementById "chain" with
    | null -> ()
    | element -> element.textContent <- string chainCount

let formatGameTime (seconds: int) : string =
    let minutes = seconds / 60
    let remainingSeconds = seconds % 60
    sprintf "%d:%02d" minutes remainingSeconds

let updateTimeDisplay (gameTime: int) : unit =
    match document.getElementById "time" with
    | null -> ()
    | element -> element.textContent <- formatGameTime gameTime