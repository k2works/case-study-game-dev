module PuyoPuyo.Tests.Domain.盤面テスト

open Xunit
open FsUnit.Xunit
open PuyoPuyo.Domain

[<Fact>]
let ``空のボードを作成できる`` () =
    // Arrange & Act
    let board = 盤面.作成 6 13

    // Assert
    board.列数 |> should equal 6
    board.行数 |> should equal 13

[<Fact>]
let ``作成直後のボードはすべて空である`` () =
    // Arrange & Act
    let _盤面 = 盤面.作成 6 13

    // Assert
    for 行 in 0 .. _盤面.行数 - 1 do
        for 列 in 0 .. _盤面.列数 - 1 do
            盤面.セル取得 _盤面 列 行 |> should equal 空

[<Fact>]
let ``ボードにぷよを配置できる`` () =
    // Arrange
    let _盤面 = 盤面.作成 6 13

    // Act
    let 新しい盤面 = 盤面.セル設定 _盤面 2 10 (埋まっている 赤)

    // Assert
    盤面.セル取得 新しい盤面 2 10 |> should equal (埋まっている 赤)

[<Fact>]
let ``ボードにぷよを配置しても元のボードは変更されない`` () =
    // Arrange
    let _盤面 = 盤面.作成 6 13

    // Act
    let 新しい盤面 = 盤面.セル設定 _盤面 2 10 (埋まっている 赤)

    // Assert
    盤面.セル取得 _盤面 2 10 |> should equal 空
    盤面.セル取得 新しい盤面 2 10 |> should equal (埋まっている 赤)
