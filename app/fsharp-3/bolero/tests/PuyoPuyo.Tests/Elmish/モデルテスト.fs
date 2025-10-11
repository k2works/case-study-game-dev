module PuyoPuyo.Tests.Elmish.モデルテスト

open Xunit
open FsUnit.Xunit
open PuyoPuyo.Elmish
open PuyoPuyo.Domain

[<Fact>]
let ``初期化すると未開始状態になる`` () =
    // Arrange & Act
    let モデル = PuyoPuyo.Elmish.モデル.初期化 ()

    // Assert
    モデル.状態 |> should equal 未開始

[<Fact>]
let ``初期化すると盤面が作成される`` () =
    // Arrange & Act
    let モデル = PuyoPuyo.Elmish.モデル.初期化 ()

    // Assert
    モデル.盤面.列数 |> should equal 6
    モデル.盤面.行数 |> should equal 13

[<Fact>]
let ``初期化すると現在のぷよはない`` () =
    // Arrange & Act
    let モデル = PuyoPuyo.Elmish.モデル.初期化 ()

    // Assert
    モデル.現在のぷよ |> should equal None

[<Fact>]
let ``初期化すると次のぷよはない`` () =
    // Arrange & Act
    let モデル = PuyoPuyo.Elmish.モデル.初期化 ()

    // Assert
    モデル.次のぷよ |> should equal None

[<Fact>]
let ``初期化するとスコアは0`` () =
    // Arrange & Act
    let モデル = PuyoPuyo.Elmish.モデル.初期化 ()

    // Assert
    モデル.スコア.値 |> should equal 0

[<Fact>]
let ``初期化するとレベルは1`` () =
    // Arrange & Act
    let モデル = PuyoPuyo.Elmish.モデル.初期化 ()

    // Assert
    モデル.レベル |> should equal 1

[<Fact>]
let ``初期化するとゲーム時間は0`` () =
    // Arrange & Act
    let モデル = PuyoPuyo.Elmish.モデル.初期化 ()

    // Assert
    モデル.ゲーム時間 |> should equal 0

[<Fact>]
let ``初期化すると最後の連鎖数は0`` () =
    // Arrange & Act
    let モデル = PuyoPuyo.Elmish.モデル.初期化 ()

    // Assert
    モデル.最後の連鎖数 |> should equal 0
