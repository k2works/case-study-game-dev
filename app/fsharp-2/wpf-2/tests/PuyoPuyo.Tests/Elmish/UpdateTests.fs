module Elmish.UpdateTests

open System
open Xunit
open FsUnit.Xunit
open Domain.PuyoPair
open Domain.GameLogic
open Elmish.Model
open Elmish.Update

module ``ゲーム初期化`` =
    [<Fact>]
    let ``初期化時にボードが空である`` () =
        // Arrange & Act
        let model = init ()

        // Assert
        model.Board |> should equal (Array2D.create 6 12 Domain.Puyo.Empty)

    [<Fact>]
    let ``初期化時にスコアが0である`` () =
        // Arrange & Act
        let model = init ()

        // Assert
        model.Score |> should equal 0

    [<Fact>]
    let ``初期化時にゲーム状態がNotStarted`` () =
        // Arrange & Act
        let model = init ()

        // Assert
        model.GameState |> should equal NotStarted

module ``ゲームループ`` =
    [<Fact>]
    let ``StartGameメッセージで新しいぷよペアが生成される`` () =
        // Arrange
        let model = init ()
        let random = Random(42)

        // Act
        let newModel = updateWithRandom random StartGame model

        // Assert
        newModel.CurrentPair |> should not' (equal None)

    [<Fact>]
    let ``StartGameメッセージでゲーム状態がPlayingになる`` () =
        // Arrange
        let model = init ()
        let random = Random(42)

        // Act
        let newModel = updateWithRandom random StartGame model

        // Assert
        newModel.GameState |> should equal Playing

    [<Fact>]
    let ``Tickメッセージでゲーム状態が保持される`` () =
        // Arrange
        let random = Random(42)

        let model =
            { init () with
                CurrentPair = Some(generatePuyoPair random)
                GameState = Playing }

        // Act
        let newModel = updateWithRandom random Tick model

        // Assert
        // Tick処理が実行されること（現時点では状態が保持されることを確認）
        newModel.GameState |> should equal Playing

    [<Fact>]
    let ``Tickメッセージでぷよペアが下に移動する`` () =
        // Arrange
        let random = Random(42)
        let initialPair = generatePuyoPair random

        let model =
            { init () with
                CurrentPair =
                    Some
                        { initialPair with
                            AxisPosition = { X = 2; Y = 5 }
                            ChildPosition = { X = 2; Y = 4 } }
                GameState = Playing }

        // Act
        let newModel = updateWithRandom random Tick model

        // Assert
        match newModel.CurrentPair with
        | Some pair ->
            pair.AxisPosition.Y |> should equal 6
            pair.ChildPosition.Y |> should equal 5
        | None -> failwith "CurrentPair should exist"

    [<Fact>]
    let ``Tickメッセージで下に移動できない場合はぷよが固定される`` () =
        // Arrange
        let random = Random(42)
        let initialPair = generatePuyoPair random

        let model =
            { init () with
                CurrentPair =
                    Some
                        { initialPair with
                            AxisPosition = { X = 2; Y = 11 }
                            ChildPosition = { X = 2; Y = 10 } }
                GameState = Playing }

        // Act
        let newModel = updateWithRandom random Tick model

        // Assert
        // ぷよが固定されてボードに配置される
        Domain.Board.getCellColor 2 11 newModel.Board |> should equal initialPair.Axis

        Domain.Board.getCellColor 2 10 newModel.Board |> should equal initialPair.Child

        // 新しいぷよペアが生成される
        newModel.CurrentPair |> should not' (equal None)

    [<Fact>]
    let ``Tickメッセージでぷよ固定後に新しいぷよが生成される`` () =
        // Arrange
        let random = Random(42)
        let initialPair = generatePuyoPair random

        let model =
            { init () with
                CurrentPair =
                    Some
                        { initialPair with
                            AxisPosition = { X = 2; Y = 11 }
                            ChildPosition = { X = 2; Y = 10 } }
                GameState = Playing }

        // Act
        let newModel = updateWithRandom random Tick model

        // Assert
        match newModel.CurrentPair with
        | Some newPair ->
            // 初期位置に配置される
            newPair.AxisPosition.X |> should equal 2
            newPair.AxisPosition.Y |> should equal 0
        | None -> failwith "新しいぷよペアが生成されるべきです"

module ``ぷよの移動`` =
    [<Fact>]
    let ``MoveLeftメッセージでぷよペアが左に移動する`` () =
        // Arrange
        let random = Random(42)
        let initialPair = generatePuyoPair random

        let model =
            { init () with
                CurrentPair =
                    Some
                        { initialPair with
                            AxisPosition = { X = 3; Y = 5 }
                            ChildPosition = { X = 3; Y = 4 } }
                GameState = Playing }

        // Act
        let newModel = updateWithRandom random MoveLeft model

        // Assert
        match newModel.CurrentPair with
        | Some pair ->
            pair.AxisPosition.X |> should equal 2
            pair.ChildPosition.X |> should equal 2
        | None -> failwith "CurrentPair should exist"

    [<Fact>]
    let ``MoveRightメッセージでぷよペアが右に移動する`` () =
        // Arrange
        let random = Random(42)
        let initialPair = generatePuyoPair random

        let model =
            { init () with
                CurrentPair =
                    Some
                        { initialPair with
                            AxisPosition = { X = 2; Y = 5 }
                            ChildPosition = { X = 2; Y = 4 } }
                GameState = Playing }

        // Act
        let newModel = updateWithRandom random MoveRight model

        // Assert
        match newModel.CurrentPair with
        | Some pair ->
            pair.AxisPosition.X |> should equal 3
            pair.ChildPosition.X |> should equal 3
        | None -> failwith "CurrentPair should exist"

module ``ぷよの高速落下`` =
    [<Fact>]
    let ``MoveDownメッセージでぷよペアが下に移動する`` () =
        // Arrange
        let random = Random(42)
        let initialPair = generatePuyoPair random

        let model =
            { init () with
                CurrentPair =
                    Some
                        { initialPair with
                            AxisPosition = { X = 2; Y = 5 }
                            ChildPosition = { X = 2; Y = 4 } }
                GameState = Playing }

        // Act
        let newModel = updateWithRandom random MoveDown model

        // Assert
        match newModel.CurrentPair with
        | Some pair ->
            pair.AxisPosition.Y |> should equal 6
            pair.ChildPosition.Y |> should equal 5
        | None -> failwith "CurrentPair should exist"

    [<Fact>]
    let ``MoveDownメッセージで下端に到達した場合はぷよが固定される`` () =
        // Arrange
        let random = Random(42)
        let initialPair = generatePuyoPair random

        let model =
            { init () with
                CurrentPair =
                    Some
                        { initialPair with
                            AxisPosition = { X = 2; Y = 11 }
                            ChildPosition = { X = 2; Y = 10 } }
                GameState = Playing }

        // Act
        let newModel = updateWithRandom random MoveDown model

        // Assert
        // ぷよが固定されてボードに配置される
        Domain.Board.getCellColor 2 11 newModel.Board |> should equal initialPair.Axis

        Domain.Board.getCellColor 2 10 newModel.Board |> should equal initialPair.Child

        // 新しいぷよペアが生成される
        newModel.CurrentPair |> should not' (equal None)

module ``ぷよの消去`` =
    [<Fact>]
    let ``着地時に4つ以上つながったぷよが消える`` () =
        // Arrange
        let random = Random(42)

        // ボードに赤いぷよを 3 つ並べておく
        let board =
            init().Board
            |> Domain.Board.setCellColor 2 11 Domain.Puyo.Red
            |> Domain.Board.setCellColor 2 10 Domain.Puyo.Red
            |> Domain.Board.setCellColor 2 9 Domain.Puyo.Red

        // 赤いぷよペアを上から落とす
        let model =
            { init () with
                Board = board
                CurrentPair =
                    Some
                        { Axis = Domain.Puyo.Red
                          Child = Domain.Puyo.Red
                          AxisPosition = { X = 2; Y = 8 }
                          ChildPosition = { X = 2; Y = 7 }
                          Rotation = 0 }
                GameState = Playing }

        // Act - 着地させる
        let newModel = updateWithRandom random Tick model

        // Assert - 4つつながって消える
        Domain.Board.getCellColor 2 11 newModel.Board |> should equal Domain.Puyo.Empty
        Domain.Board.getCellColor 2 10 newModel.Board |> should equal Domain.Puyo.Empty
        Domain.Board.getCellColor 2 9 newModel.Board |> should equal Domain.Puyo.Empty
        Domain.Board.getCellColor 2 8 newModel.Board |> should equal Domain.Puyo.Empty

module ``連鎖反応`` =
    [<Fact>]
    let ``初期化時の連鎖カウントは0`` () =
        // Arrange & Act
        let model = init ()

        // Assert
        model.Chain |> should equal 0

    [<Fact>]
    let ``連鎖が発生すると連鎖カウントが増加する`` () =
        // Arrange
        let random = Random(42)

        // 連鎖が発生する配置:
        // 赤ぷよ 4つ（下）+ 青ぷよ 4つ（上）
        // 赤が消えると青が落ちて4つつながり、連鎖発生
        let board =
            init().Board
            // 赤ぷよ（下）
            |> Domain.Board.setCellColor 2 11 Domain.Puyo.Red
            |> Domain.Board.setCellColor 2 10 Domain.Puyo.Red
            |> Domain.Board.setCellColor 2 9 Domain.Puyo.Red
            |> Domain.Board.setCellColor 2 8 Domain.Puyo.Red
            // 青ぷよ（縦3 + 横1）
            |> Domain.Board.setCellColor 2 7 Domain.Puyo.Blue
            |> Domain.Board.setCellColor 2 6 Domain.Puyo.Blue
            |> Domain.Board.setCellColor 2 5 Domain.Puyo.Blue
            |> Domain.Board.setCellColor 3 8 Domain.Puyo.Blue

        let model =
            { init () with
                Board = board
                CurrentPair =
                    Some
                        { Axis = Domain.Puyo.Red
                          Child = Domain.Puyo.Red
                          AxisPosition = { X = 2; Y = 4 }
                          ChildPosition = { X = 2; Y = 3 }
                          Rotation = 0 }
                GameState = Playing }

        // Act - 着地させて連鎖を発生させる
        let newModel = updateWithRandom random Tick model

        // Assert - 2連鎖が発生（1回目の消去 + 2回目の消去）
        newModel.Chain |> should be (greaterThanOrEqualTo 2)

module ``全消しボーナス`` =
    [<Fact>]
    let ``全消し時に3600点のボーナスが加算される`` () =
        // Arrange
        let random = Random(42)

        // ボードに赤いぷよを 3 つ並べておく（全消しになる配置）
        let board =
            init().Board
            |> Domain.Board.setCellColor 2 11 Domain.Puyo.Red
            |> Domain.Board.setCellColor 2 10 Domain.Puyo.Red
            |> Domain.Board.setCellColor 2 9 Domain.Puyo.Red

        // 赤いぷよペアを上から落として全消しさせる
        let model =
            { init () with
                Board = board
                CurrentPair =
                    Some
                        { Axis = Domain.Puyo.Red
                          Child = Domain.Puyo.Red
                          AxisPosition = { X = 2; Y = 8 }
                          ChildPosition = { X = 2; Y = 7 }
                          Rotation = 0 }
                GameState = Playing
                Score = 0 }

        // Act - 着地させて全消しさせる
        let newModel = updateWithRandom random Tick model

        // Assert - 全消しボーナス3600点が加算される
        newModel.Score |> should equal 3600

    [<Fact>]
    let ``全消しでない場合はボーナスが加算されない`` () =
        // Arrange
        let random = Random(42)

        // ボードに赤いぷよ 3 つ + 緑のぷよ 1 つ（全消しにならない配置）
        let board =
            init().Board
            |> Domain.Board.setCellColor 2 11 Domain.Puyo.Red
            |> Domain.Board.setCellColor 2 10 Domain.Puyo.Red
            |> Domain.Board.setCellColor 2 9 Domain.Puyo.Red
            |> Domain.Board.setCellColor 3 11 Domain.Puyo.Green

        // 赤いぷよペアを上から落とす（赤だけ消えて緑が残る）
        let model =
            { init () with
                Board = board
                CurrentPair =
                    Some
                        { Axis = Domain.Puyo.Red
                          Child = Domain.Puyo.Red
                          AxisPosition = { X = 2; Y = 8 }
                          ChildPosition = { X = 2; Y = 7 }
                          Rotation = 0 }
                GameState = Playing
                Score = 0 }

        // Act - 着地させる（赤だけ消えて緑が残る）
        let newModel = updateWithRandom random Tick model

        // Assert - ボーナスは加算されない（スコア0のまま）
        newModel.Score |> should equal 0
