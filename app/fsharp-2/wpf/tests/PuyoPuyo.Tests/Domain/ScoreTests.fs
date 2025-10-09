module PuyoPuyo.Tests.Domain.ScoreTests

open Xunit
open FsUnit.Xunit
open PuyoPuyo.Domain

[<Fact>]
let ``初期スコアは0である`` () =
    // Arrange & Act
    let score = Score.create ()

    // Assert
    score.Value |> should equal 0

[<Fact>]
let ``スコアを加算できる`` () =
    // Arrange
    let score = Score.create ()

    // Act
    let updatedScore = Score.addScore 100 score

    // Assert
    updatedScore.Value |> should equal 100

[<Fact>]
let ``スコアを複数回加算できる`` () =
    // Arrange & Act
    let score = Score.create () |> Score.addScore 100 |> Score.addScore 200

    // Assert
    score.Value |> should equal 300

[<Fact>]
let ``全消しボーナスを加算できる`` () =
    // Arrange
    let score = Score.create ()

    // Act
    let updatedScore = Score.addZenkeshiBonus score

    // Assert
    updatedScore.Value |> should equal 3600

[<Fact>]
let ``通常スコアと全消しボーナスを組み合わせて加算できる`` () =
    // Arrange & Act
    let score = Score.create () |> Score.addScore 1000 |> Score.addZenkeshiBonus

    // Assert
    score.Value |> should equal 4600
