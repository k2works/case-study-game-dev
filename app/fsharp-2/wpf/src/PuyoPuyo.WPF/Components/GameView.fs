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
        let border =
            Border(Width = 30.0, Height = 30.0, BorderBrush = Brushes.Gray, BorderThickness = Thickness(1.0))

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
    let createBoardPanel (model: Model) : UIElement =
        // ボードパネル
        let boardPanel = StackPanel(Orientation = Orientation.Vertical)

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

            boardPanel.Children.Add(rowPanel) |> ignore

        // ゲームオーバー時はオーバーレイを追加
        if model.Status = GameOver then
            let grid = Grid()
            grid.Children.Add(boardPanel) |> ignore

            // 半透明の背景
            let overlay =
                Border(
                    Background = SolidColorBrush(Color.FromArgb(180uy, 0uy, 0uy, 0uy)),
                    HorizontalAlignment = HorizontalAlignment.Stretch,
                    VerticalAlignment = VerticalAlignment.Stretch
                )

            grid.Children.Add(overlay) |> ignore

            // ゲームオーバーテキスト
            let gameOverText =
                TextBlock(
                    Text = "GAME OVER",
                    FontSize = 32.0,
                    FontWeight = FontWeights.Bold,
                    Foreground = Brushes.White,
                    HorizontalAlignment = HorizontalAlignment.Center,
                    VerticalAlignment = VerticalAlignment.Center
                )

            grid.Children.Add(gameOverText) |> ignore

            grid :> UIElement
        else
            boardPanel :> UIElement

    /// 次のぷよを描画
    let createNextPiecePanel (model: Model) : Panel =
        let panel = StackPanel(Orientation = Orientation.Vertical)

        let title =
            TextBlock(
                Text = "Next",
                FontSize = 14.0,
                FontWeight = FontWeights.Bold,
                HorizontalAlignment = HorizontalAlignment.Center,
                Margin = Thickness(0.0, 0.0, 0.0, 5.0)
            )

        panel.Children.Add(title) |> ignore

        match model.NextPiece with
        | Some piece ->
            // 次のぷよをミニサイズで表示
            let nextPanel = StackPanel(Orientation = Orientation.Vertical)

            // 2x2のグリッドで表示
            for y in 0..1 do
                let rowPanel = StackPanel(Orientation = Orientation.Horizontal)

                for x in 0..1 do
                    let border =
                        Border(
                            Width = 20.0,
                            Height = 20.0,
                            BorderBrush = Brushes.LightGray,
                            BorderThickness = Thickness(1.0)
                        )

                    // 回転状態0の場合、(0,0)に軸ぷよ、(0,1)に2つ目のぷよ
                    let cell =
                        if x = 0 && y = 0 then
                            Filled piece.Puyo1Color
                        elif x = 0 && y = 1 then
                            Filled piece.Puyo2Color
                        else
                            Empty

                    match cell with
                    | Empty -> border.Background <- Brushes.Transparent
                    | Filled color ->
                        let ellipse = Ellipse(Width = 16.0, Height = 16.0, Margin = Thickness(2.0))

                        ellipse.Fill <-
                            match color with
                            | PuyoColor.Red -> Brushes.Red
                            | PuyoColor.Green -> Brushes.Green
                            | PuyoColor.Blue -> Brushes.Blue
                            | PuyoColor.Yellow -> Brushes.Yellow

                        border.Child <- ellipse

                    rowPanel.Children.Add(border) |> ignore

                nextPanel.Children.Add(rowPanel) |> ignore

            panel.Children.Add(nextPanel) |> ignore
        | None -> ()

        panel

    /// スコアと連鎖数を表示するパネルを作成
    let createInfoPanel (model: Model) : Panel =
        let panel = StackPanel(Orientation = Orientation.Vertical, Margin = Thickness(10.0))

        let scoreText =
            TextBlock(
                Text = sprintf "Score: %d" model.Score.Value,
                FontSize = 16.0,
                FontWeight = FontWeights.Bold,
                Margin = Thickness(0.0, 5.0, 0.0, 5.0)
            )

        let chainText =
            TextBlock(
                Text = sprintf "Chain: %d" model.LastChainCount,
                FontSize = 16.0,
                FontWeight = FontWeights.Bold,
                Margin = Thickness(0.0, 5.0, 0.0, 5.0)
            )

        panel.Children.Add(scoreText) |> ignore
        panel.Children.Add(chainText) |> ignore
        panel.Children.Add(createNextPiecePanel model) |> ignore

        panel

    /// メインパネルを作成
    let createMainPanel (currentModel: Model ref) (onStartGame: unit -> unit) : Panel * Border * Border =
        let mainPanel = StackPanel(Orientation = Orientation.Vertical)

        // タイトル
        let title =
            TextBlock(
                Text = "ぷよぷよゲーム",
                FontSize = 24.0,
                HorizontalAlignment = HorizontalAlignment.Center,
                Margin = Thickness(10.0)
            )

        mainPanel.Children.Add(title) |> ignore

        // ゲームエリア（ボードと情報パネルを横に並べる）
        let gameArea = StackPanel(Orientation = Orientation.Horizontal, HorizontalAlignment = HorizontalAlignment.Center)

        // ボードパネル（後で更新）
        let boardContainer =
            Border(
                HorizontalAlignment = HorizontalAlignment.Center,
                VerticalAlignment = VerticalAlignment.Top,
                Margin = Thickness(10.0)
            )

        gameArea.Children.Add(boardContainer) |> ignore

        // 情報パネル（後で更新）
        let infoContainer =
            Border(
                HorizontalAlignment = HorizontalAlignment.Left,
                VerticalAlignment = VerticalAlignment.Top,
                Margin = Thickness(10.0)
            )

        gameArea.Children.Add(infoContainer) |> ignore

        mainPanel.Children.Add(gameArea) |> ignore

        // ゲーム開始ボタン
        let startButton =
            Button(Content = "ゲーム開始", Width = 120.0, Height = 40.0, FontSize = 16.0, Margin = Thickness(10.0))

        startButton.Click.Add(fun _ -> onStartGame ())

        mainPanel.Children.Add(startButton) |> ignore

        // 初期ボードと情報表示
        boardContainer.Child <- createBoardPanel !currentModel
        infoContainer.Child <- createInfoPanel !currentModel

        (mainPanel, boardContainer, infoContainer)
