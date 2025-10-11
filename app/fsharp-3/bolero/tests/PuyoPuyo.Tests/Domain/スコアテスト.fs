module PuyoPuyo.Tests.Domain.スコアテスト

open Xunit
open FsUnit.Xunit
open PuyoPuyo.Domain

[<Fact>]
let ``初期スコアは0である`` () =
    // Arrange & Act
    let 現在のスコア = スコア.作成 ()

    // Assert
    現在のスコア.値 |> should equal 0

[<Fact>]
let ``スコアを加算できる`` () =
    // Arrange
    let 現在のスコア = スコア.作成 ()

    // Act
    let updatedScore = スコア.スコア加算 現在のスコア 100

    // Assert
    updatedScore.値 |> should equal 100

[<Fact>]
let ``スコアを複数回加算できる`` () =
    // Arrange & Act
    let 現在のスコア = スコア.作成 () |> (fun s -> スコア.スコア加算 s 100) |> (fun s -> スコア.スコア加算 s 200)

    // Assert
    現在のスコア.値 |> should equal 300

[<Fact>]
let ``全消しボーナスを加算できる`` () =
    // Arrange
    let 現在のスコア = スコア.作成 ()

    // Act
    let updatedScore = スコア.全消しボーナス加算 現在のスコア

    // Assert
    updatedScore.値 |> should equal 3600

[<Fact>]
let ``通常スコアと全消しボーナスを組み合わせて加算できる`` () =
    // Arrange & Act
    let 現在のスコア = スコア.作成 () |> (fun s -> スコア.スコア加算 s 1000) |> スコア.全消しボーナス加算

    // Assert
    現在のスコア.値 |> should equal 4600
