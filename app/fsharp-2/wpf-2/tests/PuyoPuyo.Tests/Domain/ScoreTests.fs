module Domain.ScoreTests

open Xunit
open FsUnit.Xunit
open Domain.Score

module ``スコア`` =
    [<Fact>]
    let ``initialScoreは0である`` () =
        // Assert
        initialScore |> should equal 0
