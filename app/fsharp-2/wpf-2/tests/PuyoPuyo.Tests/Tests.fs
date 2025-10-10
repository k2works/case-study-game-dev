module Tests

open System
open Xunit
open FsUnit.Xunit
open Domain.Board
open Domain.Puyo
open Domain.PuyoPair
open Domain.GameLogic
open Elmish.Model
open Elmish.Update

// イテレーション1: ゲーム開始の実装

module ``ゲーム初期化`` =
    [<Fact>]
    let ``初期化時にボードが空である`` () =
        // Arrange & Act
        let model = init ()

        // Assert
        model.Board |> should equal (Array2D.create 6 12 Empty)

    [<Fact>]
    let ``初期化時にスコアが0である`` () =
        // Arrange & Act
        let model = init ()

        // Assert
        model.Score |> should equal 0

    [<Fact>]
    let ``初期化時にゲーム状態がPlaying`` () =
        // Arrange & Act
        let model = init ()

        // Assert
        model.GameState |> should equal Playing

module ``ぷよペア生成`` =
    [<Fact>]
    let ``generatePuyoPairは2つのぷよを含むペアを生成する`` () =
        // Arrange
        let random = System.Random(42)

        // Act
        let pair = generatePuyoPair random

        // Assert
        pair.Axis |> should not' (equal Empty)
        pair.Child |> should not' (equal Empty)

    [<Fact>]
    let ``generatePuyoPairは初期位置を設定する`` () =
        // Arrange
        let random = System.Random(42)

        // Act
        let pair = generatePuyoPair random

        // Assert
        pair.AxisPosition.X |> should equal 2
        pair.AxisPosition.Y |> should equal 0
        pair.ChildPosition.X |> should equal 2
        pair.ChildPosition.Y |> should equal -1

    [<Fact>]
    let ``generatePuyoPairは回転方向を0に設定する`` () =
        // Arrange
        let random = System.Random(42)

        // Act
        let pair = generatePuyoPair random

        // Assert
        pair.Rotation |> should equal 0

module ``ゲームループ`` =
    [<Fact>]
    let ``StartGameメッセージで新しいぷよペアが生成される`` () =
        // Arrange
        let model = init ()
        let random = System.Random(42)

        // Act
        let newModel = updateWithRandom random StartGame model

        // Assert
        newModel.CurrentPair |> should not' (equal None)

    [<Fact>]
    let ``Tickメッセージでゲーム状態が更新される`` () =
        // Arrange
        let random = System.Random(42)

        let model =
            { init () with
                CurrentPair = Some(generatePuyoPair random) }

        // Act
        let newModel = updateWithRandom random Tick model

        // Assert
        // Tick処理が実行されること（現時点では状態が保持されることを確認）
        newModel.GameState |> should equal Playing

module ``ぷよ表示`` =
    [<Fact>]
    let ``getCellColorは指定位置のぷよ色を返す`` () =
        // Arrange
        let model = init ()

        let model =
            { model with
                Board = Array2D.create 6 12 Empty }
        // ボードの(1, 2)に赤いぷよを配置
        model.Board.[1, 2] <- Red

        // Act
        let color = getCellColor 1 2 model.Board

        // Assert
        color |> should equal Red

    [<Fact>]
    let ``getCellColorは空のセルでEmptyを返す`` () =
        // Arrange
        let model = init ()

        // Act
        let color = getCellColor 0 0 model.Board

        // Assert
        color |> should equal Empty

    [<Fact>]
    let ``getCurrentPairPuyosはぷよペアの位置と色を返す`` () =
        // Arrange
        let random = System.Random(42)
        let model = init ()

        let model =
            { model with
                CurrentPair = Some(generatePuyoPair random) }

        // Act
        let puyos = getCurrentPairPuyos model.CurrentPair

        // Assert
        puyos |> List.length |> should equal 2
