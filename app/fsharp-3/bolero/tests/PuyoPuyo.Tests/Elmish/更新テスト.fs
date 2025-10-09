module PuyoPuyo.Tests.Elmish.更新テスト

open Xunit
open FsUnit.Xunit
open PuyoPuyo.Elmish
open PuyoPuyo.Domain

[<Fact>]
let ``ゲーム開始メッセージで状態がプレイ中になる`` () =
    // Arrange
    let 初期モデル = モデル.初期化 ()

    // Act
    let (新しいモデル, _) = 更新.更新 ゲーム開始 初期モデル

    // Assert
    新しいモデル.状態 |> should equal プレイ中

[<Fact>]
let ``ゲーム開始メッセージで現在のぷよが生成される`` () =
    // Arrange
    let 初期モデル = モデル.初期化 ()

    // Act
    let (新しいモデル, _) = 更新.更新 ゲーム開始 初期モデル

    // Assert
    新しいモデル.現在のぷよ |> should not' (equal None)

[<Fact>]
let ``ゲーム開始メッセージで次のぷよが生成される`` () =
    // Arrange
    let 初期モデル = モデル.初期化 ()

    // Act
    let (新しいモデル, _) = 更新.更新 ゲーム開始 初期モデル

    // Assert
    新しいモデル.次のぷよ |> should not' (equal None)

[<Fact>]
let ``ゲーム開始メッセージでスコアが0にリセットされる`` () =
    // Arrange
    let 初期モデル = モデル.初期化 ()

    // Act
    let (新しいモデル, _) = 更新.更新 ゲーム開始 初期モデル

    // Assert
    新しいモデル.スコア |> should equal 0

[<Fact>]
let ``ゲーム開始メッセージでゲーム時間が0にリセットされる`` () =
    // Arrange
    let 初期モデル = モデル.初期化 ()

    // Act
    let (新しいモデル, _) = 更新.更新 ゲーム開始 初期モデル

    // Assert
    新しいモデル.ゲーム時間 |> should equal 0

[<Fact>]
let ``ゲーム開始メッセージで盤面が新しく作成される`` () =
    // Arrange
    let 初期モデル = モデル.初期化 ()

    // Act
    let (新しいモデル, _) = 更新.更新 ゲーム開始 初期モデル

    // Assert
    新しいモデル.盤面.列数 |> should equal 6
    新しいモデル.盤面.行数 |> should equal 13

[<Fact>]
let ``ゲームリセットメッセージで初期状態に戻る`` () =
    // Arrange
    let モデル =
        { モデル.初期化 () with
            状態 = プレイ中
            スコア = 100
            ゲーム時間 = 60 }

    // Act
    let (新しいモデル, _) = 更新.更新 ゲームリセット モデル

    // Assert
    新しいモデル.状態 |> should equal 未開始
    新しいモデル.スコア |> should equal 0
    新しいモデル.ゲーム時間 |> should equal 0

[<Fact>]
let ``左移動メッセージでぷよペアが左に移動する`` () =
    // Arrange
    let 盤面 = 盤面.作成 6 13
    let ぷよペア = ぷよペア.作成 3 5 赤 緑 0

    let モデル =
        { モデル.初期化 () with
            盤面 = 盤面
            現在のぷよ = Some ぷよペア
            状態 = プレイ中 }

    // Act
    let (新しいモデル, _) = 更新.更新 左移動 モデル

    // Assert
    match 新しいモデル.現在のぷよ with
    | Some 移動後のぷよペア -> 移動後のぷよペア.X座標 |> should equal 2
    | None -> failwith "ぷよペアが存在するはずです"

[<Fact>]
let ``右移動メッセージでぷよペアが右に移動する`` () =
    // Arrange
    let 盤面 = 盤面.作成 6 13
    let ぷよペア = ぷよペア.作成 2 5 赤 緑 0

    let モデル =
        { モデル.初期化 () with
            盤面 = 盤面
            現在のぷよ = Some ぷよペア
            状態 = プレイ中 }

    // Act
    let (新しいモデル, _) = 更新.更新 右移動 モデル

    // Assert
    match 新しいモデル.現在のぷよ with
    | Some 移動後のぷよペア -> 移動後のぷよペア.X座標 |> should equal 3
    | None -> failwith "ぷよペアが存在するはずです"

[<Fact>]
let ``左端では左移動メッセージが無視される`` () =
    // Arrange
    let 盤面 = 盤面.作成 6 13
    let ぷよペア = ぷよペア.作成 0 5 赤 緑 0

    let モデル =
        { モデル.初期化 () with
            盤面 = 盤面
            現在のぷよ = Some ぷよペア
            状態 = プレイ中 }

    // Act
    let (新しいモデル, _) = 更新.更新 左移動 モデル

    // Assert
    match 新しいモデル.現在のぷよ with
    | Some 移動後のぷよペア -> 移動後のぷよペア.X座標 |> should equal 0
    | None -> failwith "ぷよペアが存在するはずです"

[<Fact>]
let ``右端では右移動メッセージが無視される`` () =
    // Arrange
    let 盤面 = 盤面.作成 6 13
    let ぷよペア = ぷよペア.作成 5 5 赤 緑 0

    let モデル =
        { モデル.初期化 () with
            盤面 = 盤面
            現在のぷよ = Some ぷよペア
            状態 = プレイ中 }

    // Act
    let (新しいモデル, _) = 更新.更新 右移動 モデル

    // Assert
    match 新しいモデル.現在のぷよ with
    | Some 移動後のぷよペア -> 移動後のぷよペア.X座標 |> should equal 5
    | None -> failwith "ぷよペアが存在するはずです"
