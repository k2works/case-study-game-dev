module PuyoPuyo.Tests.Domain.ゲームロジックテスト

open Xunit
open FsUnit.Xunit
open PuyoPuyo.Domain

[<Fact>]
let ``ぷよペアを左に移動できる`` () =
    // Arrange
    let 盤面 = 盤面.作成 6 13
    let ぷよペア = ぷよペア.作成 3 5 赤 緑 0

    // Act
    let 結果 = ゲームロジック.ぷよペア移動を試行 盤面 ぷよペア 左

    // Assert
    match 結果 with
    | Some 移動後のペア ->
        移動後のペア.X座標 |> should equal 2
        移動後のペア.Y座標 |> should equal 5
    | None -> failwith "移動できるはずです"

[<Fact>]
let ``ぷよペアを右に移動できる`` () =
    // Arrange
    let 盤面 = 盤面.作成 6 13
    let ぷよペア = ぷよペア.作成 2 5 赤 緑 0

    // Act
    let 結果 = ゲームロジック.ぷよペア移動を試行 盤面 ぷよペア 右

    // Assert
    match 結果 with
    | Some 移動後のペア ->
        移動後のペア.X座標 |> should equal 3
        移動後のペア.Y座標 |> should equal 5
    | None -> failwith "移動できるはずです"

[<Fact>]
let ``左端では左に移動できない`` () =
    // Arrange
    let 盤面 = 盤面.作成 6 13
    let ぷよペア = ぷよペア.作成 0 5 赤 緑 0

    // Act
    let 結果 = ゲームロジック.ぷよペア移動を試行 盤面 ぷよペア 左

    // Assert
    結果 |> should equal None

[<Fact>]
let ``右端では右に移動できない`` () =
    // Arrange
    let 盤面 = 盤面.作成 6 13
    let ぷよペア = ぷよペア.作成 5 5 赤 緑 0

    // Act
    let 結果 = ゲームロジック.ぷよペア移動を試行 盤面 ぷよペア 右

    // Assert
    結果 |> should equal None
