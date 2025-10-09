namespace PuyoPuyo.Components

open System.Windows
open System.Windows.Controls
open System.Windows.Media
open System.Windows.Shapes
open PuyoPuyo.Domain
open PuyoPuyo.Game

/// <summary>
/// ゲームビューコンポーネント
/// </summary>
module GameView =

    /// セルを描画
    let createCellBorder (cell: Cell) : Border =
        let border = Border(Width = 30.0, Height = 30.0, BorderBrush = Brushes.Gray, BorderThickness = Thickness(1.0))

        match cell with
        | Empty -> border.Background <- Brushes.White
        | Filled color ->
            let ellipse = Ellipse(Width = 26.0, Height = 26.0, Margin = Thickness(2.0))

            ellipse.Fill <-
                match color with
                | PuyoColor.Red -> Brushes.Red
                | PuyoColor.Green -> Brushes.Green
                | PuyoColor.Blue -> Brushes.Blue
                | PuyoColor.Yellow -> Brushes.Yellow

            border.Child <- ellipse

        border

    /// ボードを描画
    let createBoardPanel (model: Model) : Panel =
        let panel = StackPanel(Orientation = Orientation.Vertical)

        // 現在のぷよの位置を取得
        let currentPiecePositions =
            match model.CurrentPiece with
            | Some piece ->
                let (pos1, pos2) = PuyoPair.getPositions piece
                Map.ofList [ (pos1, Filled piece.Puyo1Color); (pos2, Filled piece.Puyo2Color) ]
            | None -> Map.empty

        // ボードの各行を描画
        for y in 0 .. model.Board.Rows - 1 do
            let rowPanel = StackPanel(Orientation = Orientation.Horizontal)

            for x in 0 .. model.Board.Cols - 1 do
                // 現在のぷよがあればそれを優先、なければボードのセル
                let cell =
                    match Map.tryFind (x, y) currentPiecePositions with
                    | Some puyoCell -> puyoCell
                    | None -> Board.getCell model.Board x y

                let cellBorder = createCellBorder cell
                rowPanel.Children.Add(cellBorder) |> ignore

            panel.Children.Add(rowPanel) |> ignore

        panel
