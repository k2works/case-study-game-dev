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
