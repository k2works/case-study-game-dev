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
let ``未実装メッセージは状態を変更しない`` () =
    // Arrange
    let 初期モデル = モデル.初期化 ()

    // Act
    let (新しいモデル, _) = 更新.更新 左移動 初期モデル

    // Assert
    新しいモデル |> should equal 初期モデル
