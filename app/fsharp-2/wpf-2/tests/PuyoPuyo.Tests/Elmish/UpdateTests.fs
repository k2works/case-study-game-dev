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
    let ``初期化時にゲーム状態がPlaying`` () =
        // Arrange & Act
        let model = init ()

        // Assert
        model.GameState |> should equal Playing

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
    let ``Tickメッセージでゲーム状態が更新される`` () =
        // Arrange
        let random = Random(42)

        let model =
            { init () with
                CurrentPair = Some(generatePuyoPair random) }

        // Act
        let newModel = updateWithRandom random Tick model

        // Assert
        // Tick処理が実行されること（現時点では状態が保持されることを確認）
        newModel.GameState |> should equal Playing
