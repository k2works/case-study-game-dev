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

[<Fact>]
let ``回転メッセージでぷよペアが回転する`` () =
    // Arrange
    let 盤面 = 盤面.作成 6 13
    let ぷよペア = ぷよペア.作成 2 5 赤 緑 0 // 回転状態0

    let モデル =
        { モデル.初期化 () with
            盤面 = 盤面
            現在のぷよ = Some ぷよペア
            状態 = プレイ中 }

    // Act
    let (新しいモデル, _) = 更新.更新 回転 モデル

    // Assert
    match 新しいモデル.現在のぷよ with
    | Some 回転後のぷよペア -> 回転後のぷよペア.回転状態 |> should equal 1
    | None -> failwith "ぷよペアが存在するはずです"

[<Fact>]
let ``右端の回転メッセージで壁キックが発動する`` () =
    // Arrange
    let 盤面 = 盤面.作成 6 13
    let ぷよペア = ぷよペア.作成 5 5 赤 緑 0 // 右端、回転状態0

    let モデル =
        { モデル.初期化 () with
            盤面 = 盤面
            現在のぷよ = Some ぷよペア
            状態 = プレイ中 }

    // Act
    let (新しいモデル, _) = 更新.更新 回転 モデル

    // Assert
    match 新しいモデル.現在のぷよ with
    | Some 回転後のぷよペア ->
        回転後のぷよペア.回転状態 |> should equal 1
        回転後のぷよペア.X座標 |> should equal 4 // 壁キックで左にずれる
    | None -> failwith "ぷよペアが存在するはずです"

[<Fact>]
let ``下移動メッセージでぷよペアが下に移動する`` () =
    // Arrange
    let 盤面 = 盤面.作成 6 13
    let ぷよペア = ぷよペア.作成 2 5 赤 緑 0

    let モデル =
        { モデル.初期化 () with
            盤面 = 盤面
            現在のぷよ = Some ぷよペア
            状態 = プレイ中 }

    // Act
    let (新しいモデル, _) = 更新.更新 下移動 モデル

    // Assert
    match 新しいモデル.現在のぷよ with
    | Some 移動後のぷよペア -> 移動後のぷよペア.Y座標 |> should equal 6
    | None -> failwith "ぷよペアが存在するはずです"

[<Fact>]
let ``タイマー刻みメッセージでぷよが下に移動する`` () =
    // Arrange
    let 盤面 = 盤面.作成 6 13
    let ペア = ぷよペア.作成 3 5 赤 緑 0

    let モデル =
        { モデル.初期化 () with
            盤面 = 盤面
            現在のぷよ = Some ペア
            状態 = プレイ中 }

    // Act
    let (新しいモデル, _) = 更新.更新 タイマー刻み モデル

    // Assert
    match 新しいモデル.現在のぷよ with
    | Some 新しいペア -> 新しいペア.Y座標 |> should equal 6
    | None -> failwith "ぷよが存在するはずです"

[<Fact>]
let ``着地したぷよはボードに固定され次のぷよが生成される`` () =
    // Arrange
    let 盤面 = 盤面.作成 6 13
    let ペア = ぷよペア.作成 3 12 赤 緑 0 // 下端
    let 次のぷよ = ぷよペア.作成 2 1 青 黄 0

    let モデル =
        { モデル.初期化 () with
            盤面 = 盤面
            現在のぷよ = Some ペア
            次のぷよ = Some 次のぷよ
            状態 = プレイ中 }

    // Act
    let (新しいモデル, _) = 更新.更新 タイマー刻み モデル

    // Assert
    // 着地したぷよがボードに固定されている
    PuyoPuyo.Domain.盤面.セル取得 新しいモデル.盤面 3 12 |> should equal (埋まっている 赤)
    PuyoPuyo.Domain.盤面.セル取得 新しいモデル.盤面 3 11 |> should equal (埋まっている 緑)

    // 次のぷよが現在のぷよになっている
    match 新しいモデル.現在のぷよ with
    | Some 新しいペア ->
        新しいペア.X座標 |> should equal 2
        新しいペア.Y座標 |> should equal 1
        新しいペア.ぷよ1の色 |> should equal 青
    | None -> failwith "次のぷよが現在のぷよになるはずです"
