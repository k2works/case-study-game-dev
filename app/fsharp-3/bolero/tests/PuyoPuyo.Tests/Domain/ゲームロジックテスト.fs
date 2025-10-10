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

[<Fact>]
let ``空いている位置では回転できる`` () =
    // Arrange
    let 盤面 = 盤面.作成 6 13
    let ペア = ぷよペア.作成 2 5 赤 緑 0 // 回転状態0（上）

    // Act
    let 回転後 = ぷよペア.時計回り回転 ペア
    let 結果 = ゲームロジック.ぷよペア回転を試行 盤面 ペア 回転後

    // Assert
    match 結果 with
    | Some 回転後のペア -> 回転後のペア.回転状態 |> should equal 1
    | None -> failwith "回転できるはずです"

[<Fact>]
let ``壁に当たる位置では回転できない`` () =
    // Arrange
    let 盤面 = 盤面.作成 6 13
    let ペア = ぷよペア.作成 5 5 赤 緑 0 // 回転状態0（上）

    // Act
    let 回転後 = ぷよペア.時計回り回転 ペア // 回転状態1（右）になると列6になり範囲外
    let 結果 = ゲームロジック.ぷよペア回転を試行 盤面 ペア 回転後

    // Assert
    結果 |> should equal None

[<Fact>]
let ``右端で右向き回転のとき左にずらして回転できる`` () =
    // Arrange
    let 盤面 = 盤面.作成 6 13
    let ペア = ぷよペア.作成 5 5 赤 緑 0 // 回転状態0（上）、列5（右端）

    // Act
    let 結果 = ゲームロジック.ぷよペア壁キック回転 盤面 ペア ぷよペア.時計回り回転

    // Assert
    match 結果 with
    | Some 回転後のペア ->
        回転後のペア.回転状態 |> should equal 1 // 回転状態1（右）
        回転後のペア.X座標 |> should equal 4 // 左に1マスずらす
    | None -> failwith "壁キックで回転できるはずです"

[<Fact>]
let ``左端で左向き回転のとき右にずらして回転できる`` () =
    // Arrange
    let 盤面 = 盤面.作成 6 13
    let ペア = ぷよペア.作成 0 5 赤 緑 2 // 回転状態2（下）、列0（左端）

    // Act
    let 結果 = ゲームロジック.ぷよペア壁キック回転 盤面 ペア ぷよペア.時計回り回転

    // Assert
    match 結果 with
    | Some 回転後のペア ->
        回転後のペア.回転状態 |> should equal 3 // 回転状態3（左）
        回転後のペア.X座標 |> should equal 1 // 右に1マスずらす
    | None -> failwith "壁キックで回転できるはずです"

[<Fact>]
let ``ぷよペアを下に移動できる`` () =
    // Arrange
    let 盤面 = 盤面.作成 6 13
    let ペア = ぷよペア.作成 3 5 赤 緑 0

    // Act
    let 結果 = ゲームロジック.ぷよペア移動を試行 盤面 ペア 下

    // Assert
    match 結果 with
    | Some 移動後のペア ->
        移動後のペア.X座標 |> should equal 3
        移動後のペア.Y座標 |> should equal 6
    | None -> failwith "下に移動できるはずです"

[<Fact>]
let ``下端では下に移動できない`` () =
    // Arrange
    let 盤面 = 盤面.作成 6 13
    let ペア = ぷよペア.作成 3 12 赤 緑 0 // 回転状態0（上）、軸ぷよが y=12（下端）

    // Act
    let 結果 = ゲームロジック.ぷよペア移動を試行 盤面 ペア 下

    // Assert
    結果 |> should equal None

[<Fact>]
let ``下にぷよがある場合は移動できない`` () =
    // Arrange
    let 初期盤面 = 盤面.作成 6 13
    let 盤面 = 盤面.セル設定 初期盤面 3 6 (埋まっている 青) // 軸ぷよの下（y=6）に障害物
    let ペア = ぷよペア.作成 3 5 赤 緑 0 // 軸ぷよ (3,5)、2つ目 (3,4)

    // Act
    let 結果 = ゲームロジック.ぷよペア移動を試行 盤面 ペア 下

    // Assert
    結果 |> should equal None
