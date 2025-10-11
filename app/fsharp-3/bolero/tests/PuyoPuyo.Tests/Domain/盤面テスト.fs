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

[<Fact>]
let ``ぷよペアをボードに固定できる`` () =
    // Arrange
    let _盤面 = 盤面.作成 6 13
    let ペア = ぷよペア.作成 3 10 赤 緑 0

    // Act
    let 新しい盤面 = 盤面操作.ぷよペア固定 _盤面 ペア

    // Assert
    let (位置1, 位置2) = ぷよペア.位置取得 ペア
    let (x1, y1) = 位置1
    let (x2, y2) = 位置2
    盤面.セル取得 新しい盤面 x1 y1 |> should equal (埋まっている 赤)
    盤面.セル取得 新しい盤面 x2 y2 |> should equal (埋まっている 緑)

[<Fact>]
let ``ぷよペアを固定しても元のボードは変更されない`` () =
    // Arrange
    let _盤面 = 盤面.作成 6 13
    let ペア = ぷよペア.作成 3 10 赤 緑 0

    // Act
    let 新しい盤面 = 盤面操作.ぷよペア固定 _盤面 ペア

    // Assert
    let (位置1, _) = ぷよペア.位置取得 ペア
    let (x1, y1) = 位置1
    盤面.セル取得 _盤面 x1 y1 |> should equal 空 // 元のボードは空のまま
    盤面.セル取得 新しい盤面 x1 y1 |> should equal (埋まっている 赤) // 新しいボードには固定

[<Fact>]
let ``横に4つ並んだぷよを検出できる`` () =
    // Arrange
    let _盤面 = 盤面.作成 6 13

    let _盤面 =
        _盤面
        |> (fun 盤 -> 盤面.セル設定 盤 0 12 (埋まっている 赤))
        |> (fun 盤 -> 盤面.セル設定 盤 1 12 (埋まっている 赤))
        |> (fun 盤 -> 盤面.セル設定 盤 2 12 (埋まっている 赤))
        |> (fun 盤 -> 盤面.セル設定 盤 3 12 (埋まっている 赤))

    // Act
    let グループ = 盤面.つながったグループ検出 _盤面

    // Assert
    グループ |> List.length |> should equal 1
    グループ |> List.head |> List.length |> should equal 4

[<Fact>]
let ``縦に4つ並んだぷよを検出できる`` () =
    // Arrange
    let _盤面 = 盤面.作成 6 13

    let _盤面 =
        _盤面
        |> (fun 盤 -> 盤面.セル設定 盤 2 9 (埋まっている 緑))
        |> (fun 盤 -> 盤面.セル設定 盤 2 10 (埋まっている 緑))
        |> (fun 盤 -> 盤面.セル設定 盤 2 11 (埋まっている 緑))
        |> (fun 盤 -> 盤面.セル設定 盤 2 12 (埋まっている 緑))

    // Act
    let グループ = 盤面.つながったグループ検出 _盤面

    // Assert
    グループ |> List.length |> should equal 1
    グループ |> List.head |> List.length |> should equal 4

[<Fact>]
let ``L字型につながった5つのぷよを検出できる`` () =
    // Arrange
    let _盤面 = 盤面.作成 6 13

    let _盤面 =
        _盤面
        |> (fun 盤 -> 盤面.セル設定 盤 1 10 (埋まっている 青))
        |> (fun 盤 -> 盤面.セル設定 盤 1 11 (埋まっている 青))
        |> (fun 盤 -> 盤面.セル設定 盤 1 12 (埋まっている 青))
        |> (fun 盤 -> 盤面.セル設定 盤 2 12 (埋まっている 青))
        |> (fun 盤 -> 盤面.セル設定 盤 3 12 (埋まっている 青))

    // Act
    let グループ = 盤面.つながったグループ検出 _盤面

    // Assert
    グループ |> List.length |> should equal 1
    グループ |> List.head |> List.length |> should equal 5

[<Fact>]
let ``3つ以下のぷよは検出されない`` () =
    // Arrange
    let _盤面 = 盤面.作成 6 13

    let _盤面 =
        _盤面
        |> (fun 盤 -> 盤面.セル設定 盤 0 12 (埋まっている 黄))
        |> (fun 盤 -> 盤面.セル設定 盤 1 12 (埋まっている 黄))
        |> (fun 盤 -> 盤面.セル設定 盤 2 12 (埋まっている 黄))

    // Act
    let グループ = 盤面.つながったグループ検出 _盤面

    // Assert
    グループ |> List.length |> should equal 0

[<Fact>]
let ``指定位置のぷよを消去できる`` () =
    // Arrange
    let _盤面 = 盤面.作成 6 13

    let _盤面 =
        _盤面
        |> (fun 盤 -> 盤面.セル設定 盤 2 10 (埋まっている 赤))
        |> (fun 盤 -> 盤面.セル設定 盤 2 11 (埋まっている 赤))

    // Act
    let 消去後の盤面 = 盤面.ぷよ消去 _盤面 [ (2, 10); (2, 11) ]

    // Assert
    盤面.セル取得 消去後の盤面 2 10 |> should equal 空
    盤面.セル取得 消去後の盤面 2 11 |> should equal 空

[<Fact>]
let ``ぷよ消去後も元の盤面は変更されない`` () =
    // Arrange
    let _盤面 = 盤面.作成 6 13

    let _盤面 = _盤面 |> (fun 盤 -> 盤面.セル設定 盤 2 10 (埋まっている 赤))

    // Act
    let 消去後の盤面 = 盤面.ぷよ消去 _盤面 [ (2, 10) ]

    // Assert
    盤面.セル取得 _盤面 2 10 |> should equal (埋まっている 赤)
    盤面.セル取得 消去後の盤面 2 10 |> should equal 空

[<Fact>]
let ``重力適用で浮いているぷよが落下する`` () =
    // Arrange
    let _盤面 = 盤面.作成 6 13

    let _盤面 =
        _盤面
        |> (fun 盤 -> 盤面.セル設定 盤 2 10 (埋まっている 赤))
        |> (fun 盤 -> 盤面.セル設定 盤 2 12 (埋まっている 青))

    // Act - 赤を消去すると青が落下する
    let 消去後 = 盤面.ぷよ消去 _盤面 [ (2, 10) ]
    let 重力適用後 = 盤面.重力適用 消去後

    // Assert
    盤面.セル取得 重力適用後 2 12 |> should equal (埋まっている 青)
    盤面.セル取得 重力適用後 2 11 |> should equal 空
    盤面.セル取得 重力適用後 2 10 |> should equal 空

[<Fact>]
let ``重力適用で複数のぷよが正しく落下する`` () =
    // Arrange
    let _盤面 = 盤面.作成 6 13

    let _盤面 =
        _盤面
        |> (fun 盤 -> 盤面.セル設定 盤 2 8 (埋まっている 赤))
        |> (fun 盤 -> 盤面.セル設定 盤 2 10 (埋まっている 緑))
        |> (fun 盤 -> 盤面.セル設定 盤 2 11 (埋まっている 青))

    // Act - 緑を消去すると赤が落下
    let 消去後 = 盤面.ぷよ消去 _盤面 [ (2, 10) ]
    let 重力適用後 = 盤面.重力適用 消去後

    // Assert
    盤面.セル取得 重力適用後 2 12 |> should equal (埋まっている 青)
    盤面.セル取得 重力適用後 2 11 |> should equal (埋まっている 赤)
    盤面.セル取得 重力適用後 2 10 |> should equal 空
    盤面.セル取得 重力適用後 2 8 |> should equal 空

[<Fact>]
let ``重力適用で列ごとに独立して落下する`` () =
    // Arrange
    let _盤面 = 盤面.作成 6 13

    let _盤面 =
        _盤面
        |> (fun 盤 -> 盤面.セル設定 盤 1 10 (埋まっている 赤))
        |> (fun 盤 -> 盤面.セル設定 盤 2 8 (埋まっている 青))
        |> (fun 盤 -> 盤面.セル設定 盤 2 10 (埋まっている 緑))

    // Act - 列2の緑を消去
    let 消去後 = 盤面.ぷよ消去 _盤面 [ (2, 10) ]
    let 重力適用後 = 盤面.重力適用 消去後

    // Assert
    // 列1は赤が下端に落下
    盤面.セル取得 重力適用後 1 12 |> should equal (埋まっている 赤)
    盤面.セル取得 重力適用後 1 10 |> should equal 空
    // 列2は青が落下
    盤面.セル取得 重力適用後 2 12 |> should equal (埋まっている 青)
    盤面.セル取得 重力適用後 2 8 |> should equal 空
