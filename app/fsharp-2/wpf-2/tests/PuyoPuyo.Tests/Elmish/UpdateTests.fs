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
