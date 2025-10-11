module PuyoPuyo.Tests.Domain.ぷよペアテスト

open Xunit
open FsUnit.Xunit
open PuyoPuyo.Domain

[<Fact>]
let ``ぷよペアを作成できる`` () =
    // Arrange & Act
    let ぷよペア = ぷよペア.作成 2<列> 0<行> 赤 緑 0

    // Assert
    ぷよペア.X座標 |> should equal 2
    ぷよペア.Y座標 |> should equal 0
    ぷよペア.ぷよ1の色 |> should equal 赤
    ぷよペア.ぷよ2の色 |> should equal 緑
    ぷよペア.回転状態 |> should equal 0

[<Fact>]
let ``回転状態0のとき2つ目のぷよは上にある`` () =
    // Arrange
    let ペア = ぷよペア.作成 2<列> 5<行> 赤 緑 0

    // Act
    let (位置1, 位置2) = ぷよペア.位置取得 ペア

    // Assert
    位置1 |> should equal (2<列>, 5<行>) // 軸ぷよ
    位置2 |> should equal (2<列>, 4<行>) // 2つ目のぷよは上

[<Fact>]
let ``回転状態1のとき2つ目のぷよは右にある`` () =
    // Arrange
    let ペア = ぷよペア.作成 2<列> 5<行> 赤 緑 1

    // Act
    let (位置1, 位置2) = ぷよペア.位置取得 ペア

    // Assert
    位置1 |> should equal (2<列>, 5<行>) // 軸ぷよ
    位置2 |> should equal (3<列>, 5<行>) // 2つ目のぷよは右

[<Fact>]
let ``回転状態2のとき2つ目のぷよは下にある`` () =
    // Arrange
    let ペア = ぷよペア.作成 2<列> 5<行> 赤 緑 2

    // Act
    let (位置1, 位置2) = ぷよペア.位置取得 ペア

    // Assert
    位置1 |> should equal (2<列>, 5<行>) // 軸ぷよ
    位置2 |> should equal (2<列>, 6<行>) // 2つ目のぷよは下

[<Fact>]
let ``回転状態3のとき2つ目のぷよは左にある`` () =
    // Arrange
    let ペア = ぷよペア.作成 2<列> 5<行> 赤 緑 3

    // Act
    let (位置1, 位置2) = ぷよペア.位置取得 ペア

    // Assert
    位置1 |> should equal (2<列>, 5<行>) // 軸ぷよ
    位置2 |> should equal (1<列>, 5<行>) // 2つ目のぷよは左

[<Fact>]
let ``時計回りに回転すると回転状態が1増える`` () =
    // Arrange
    let ペア = ぷよペア.作成 2<列> 5<行> 赤 緑 0

    // Act
    let 回転後 = ぷよペア.時計回り回転 ペア

    // Assert
    回転後.回転状態 |> should equal 1

[<Fact>]
let ``回転状態3から時計回りに回転すると0に戻る`` () =
    // Arrange
    let ペア = ぷよペア.作成 2<列> 5<行> 赤 緑 3

    // Act
    let 回転後 = ぷよペア.時計回り回転 ペア

    // Assert
    回転後.回転状態 |> should equal 0

[<Fact>]
let ``回転すると2つ目のぷよの位置が変わる`` () =
    // Arrange
    let ペア = ぷよペア.作成 3<列> 5<行> 赤 緑 0 // 回転状態0（上）

    // Act
    let 回転後 = ぷよペア.時計回り回転 ペア // 回転状態1（右）
    let (位置1, 位置2) = ぷよペア.位置取得 回転後

    // Assert
    位置1 |> should equal (3<列>, 5<行>) // 軸ぷよは変わらない
    位置2 |> should equal (4<列>, 5<行>) // 2つ目のぷよは右に
