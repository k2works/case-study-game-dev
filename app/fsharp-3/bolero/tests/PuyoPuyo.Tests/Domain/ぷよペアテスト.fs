module PuyoPuyo.Tests.Domain.ぷよペアテスト

open Xunit
open FsUnit.Xunit
open PuyoPuyo.Domain

[<Fact>]
let ``ぷよペアを作成できる`` () =
    // Arrange & Act
    let ぷよペア = ぷよペア.作成 2 0 赤 緑 0

    // Assert
    ぷよペア.X座標 |> should equal 2
    ぷよペア.Y座標 |> should equal 0
    ぷよペア.ぷよ1の色 |> should equal 赤
    ぷよペア.ぷよ2の色 |> should equal 緑
    ぷよペア.回転状態 |> should equal 0

[<Fact>]
let ``回転状態0のとき2つ目のぷよは上にある`` () =
    // Arrange
    let ペア = ぷよペア.作成 2 5 赤 緑 0

    // Act
    let (位置1, 位置2) = ぷよペア.位置取得 ペア

    // Assert
    位置1 |> should equal (2, 5) // 軸ぷよ
    位置2 |> should equal (2, 4) // 2つ目のぷよは上

[<Fact>]
let ``回転状態1のとき2つ目のぷよは右にある`` () =
    // Arrange
    let ペア = ぷよペア.作成 2 5 赤 緑 1

    // Act
    let (位置1, 位置2) = ぷよペア.位置取得 ペア

    // Assert
    位置1 |> should equal (2, 5) // 軸ぷよ
    位置2 |> should equal (3, 5) // 2つ目のぷよは右

[<Fact>]
let ``回転状態2のとき2つ目のぷよは下にある`` () =
    // Arrange
    let ペア = ぷよペア.作成 2 5 赤 緑 2

    // Act
    let (位置1, 位置2) = ぷよペア.位置取得 ペア

    // Assert
    位置1 |> should equal (2, 5) // 軸ぷよ
    位置2 |> should equal (2, 6) // 2つ目のぷよは下

[<Fact>]
let ``回転状態3のとき2つ目のぷよは左にある`` () =
    // Arrange
    let ペア = ぷよペア.作成 2 5 赤 緑 3

    // Act
    let (位置1, 位置2) = ぷよペア.位置取得 ペア

    // Assert
    位置1 |> should equal (2, 5) // 軸ぷよ
    位置2 |> should equal (1, 5) // 2つ目のぷよは左
