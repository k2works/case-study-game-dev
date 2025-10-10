module Domain.GameLogicTests

open Xunit
open FsUnit.Xunit
open Domain.GameLogic

module ``ゲーム状態`` =
    [<Fact>]
    let ``GameStateにはNotStarted状態がある`` () =
        // Assert
        NotStarted |> should equal NotStarted

    [<Fact>]
    let ``GameStateにはPlaying状態がある`` () =
        // Assert
        Playing |> should equal Playing

    [<Fact>]
    let ``GameStateにはPaused状態がある`` () =
        // Assert
        Paused |> should equal Paused

    [<Fact>]
    let ``GameStateにはGameOver状態がある`` () =
        // Assert
        GameOver |> should equal GameOver
