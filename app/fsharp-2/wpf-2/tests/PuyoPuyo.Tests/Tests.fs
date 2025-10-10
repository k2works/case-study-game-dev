module Tests

open System
open Xunit
open FsUnit.Xunit

// イテレーション1: ゲーム開始の実装

module ``ゲーム初期化`` =
    [<Fact>]
    let ``初期化時にボードが空である`` () =
        // Arrange & Act
        let model = Game.init ()

        // Assert
        model.Board |> should equal (Array2D.create 6 12 Game.Empty)

    [<Fact>]
    let ``初期化時にスコアが0である`` () =
        // Arrange & Act
        let model = Game.init ()

        // Assert
        model.Score |> should equal 0

    [<Fact>]
    let ``初期化時にゲーム状態がPlaying`` () =
        // Arrange & Act
        let model = Game.init ()

        // Assert
        model.GameState |> should equal Game.Playing

module ``ぷよペア生成`` =
    [<Fact>]
    let ``generatePuyoPairは2つのぷよを含むペアを生成する`` () =
        // Arrange
        let random = System.Random(42)

        // Act
        let pair = Game.generatePuyoPair random

        // Assert
        pair.Axis |> should not' (equal Game.Empty)
        pair.Child |> should not' (equal Game.Empty)

    [<Fact>]
    let ``generatePuyoPairは初期位置を設定する`` () =
        // Arrange
        let random = System.Random(42)

        // Act
        let pair = Game.generatePuyoPair random

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
        let pair = Game.generatePuyoPair random

        // Assert
        pair.Rotation |> should equal 0
