// tests/PlayerTests.fs
module PuyoPuyo.Tests.PlayerTests

open Fable.Mocha
open PuyoPuyo.Types
open PuyoPuyo

let playerTests =
    testList "プレイヤー" [
        testCase "新しいぷよを作成すると、初期位置に配置される" <| fun _ ->
            let puyo = Player.createNewPuyo()

            Expect.equal puyo.Position.X 2 "ぷよのX座標は2（中央）であるべき"
            Expect.equal puyo.Position.Y 0 "ぷよのY座標は0（一番上）であるべき"

        testCase "新しいぷよを作成すると、色が設定される" <| fun _ ->
            let puyo = Player.createNewPuyo()

            Expect.notEqual puyo.Color PuyoColor.Empty "ぷよの色は空ではないべき"
    ]

let puyoMoveTests =
    testList "ぷよの移動" [
        testCase "左に移動できる場合、左に移動する" <| fun _ ->
            let puyo = Player.createNewPuyo()
            let initialX = puyo.Position.X

            let movedPuyo = Player.moveLeft puyo 6

            Expect.equal movedPuyo.Position.X (initialX - 1) "X座標が1減るべき"

        testCase "右に移動できる場合、右に移動する" <| fun _ ->
            let puyo = Player.createNewPuyo()
            let initialX = puyo.Position.X

            let movedPuyo = Player.moveRight puyo 6

            Expect.equal movedPuyo.Position.X (initialX + 1) "X座標が1増えるべき"

        testCase "左端にいる場合、左に移動できない" <| fun _ ->
            let puyo = { Player.createNewPuyo() with Position = { X = 0; Y = 0 } }

            let movedPuyo = Player.moveLeft puyo 6

            Expect.equal movedPuyo.Position.X 0 "X座標は変わらないべき"

        testCase "右端にいる場合、右に移動できない" <| fun _ ->
            let puyo = { Player.createNewPuyo() with Position = { X = 5; Y = 0 } }

            let movedPuyo = Player.moveRight puyo 6

            Expect.equal movedPuyo.Position.X 5 "X座標は変わらないべき"
    ]

let puyoPairTests =
    testList "ぷよペア" [
        testCase "新しいぷよペアを作成すると、軸ぷよは初期位置に配置される" <| fun _ ->
            let pair = Player.createNewPuyoPair()

            Expect.equal pair.Axis.Position.X 2 "軸ぷよのX座標は2（中央）であるべき"
            Expect.equal pair.Axis.Position.Y 0 "軸ぷよのY座標は0（一番上）であるべき"

        testCase "新しいぷよペアを作成すると、子ぷよは軸ぷよの上に配置される" <| fun _ ->
            let pair = Player.createNewPuyoPair()

            Expect.equal pair.Child.Position.X pair.Axis.Position.X "子ぷよのX座標は軸ぷよと同じであるべき"
            Expect.equal pair.Child.Position.Y (pair.Axis.Position.Y - 1) "子ぷよのY座標は軸ぷよの1つ上であるべき"

        testCase "新しいぷよペアを作成すると、軸ぷよと子ぷよの色が設定される" <| fun _ ->
            let pair = Player.createNewPuyoPair()

            Expect.notEqual pair.Axis.Color PuyoColor.Empty "軸ぷよの色は空ではないべき"
            Expect.notEqual pair.Child.Color PuyoColor.Empty "子ぷよの色は空ではないべき"
    ]

let puyoPairRotationTests =
    testList "ぷよペアの回転" [
        testCase "右回転すると、子ぷよが軸ぷよの右に移動する" <| fun _ ->
            let pair = Player.createNewPuyoPair()

            let rotatedPair = Player.rotateRight pair 6

            Expect.equal rotatedPair.Child.Position.X (rotatedPair.Axis.Position.X + 1) "子ぷよのX座標は軸ぷよより1大きいべき"
            Expect.equal rotatedPair.Child.Position.Y rotatedPair.Axis.Position.Y "子ぷよのY座標は軸ぷよと同じであるべき"

        testCase "右回転を2回すると、子ぷよが軸ぷよの下に移動する" <| fun _ ->
            let pair = Player.createNewPuyoPair()

            let rotatedPair = Player.rotateRight (Player.rotateRight pair 6) 6

            Expect.equal rotatedPair.Child.Position.X rotatedPair.Axis.Position.X "子ぷよのX座標は軸ぷよと同じであるべき"
            Expect.equal rotatedPair.Child.Position.Y (rotatedPair.Axis.Position.Y + 1) "子ぷよのY座標は軸ぷよより1大きいべき"

        testCase "右回転を3回すると、子ぷよが軸ぷよの左に移動する" <| fun _ ->
            let pair = Player.createNewPuyoPair()

            let rotatedPair = Player.rotateRight (Player.rotateRight (Player.rotateRight pair 6) 6) 6

            Expect.equal rotatedPair.Child.Position.X (rotatedPair.Axis.Position.X - 1) "子ぷよのX座標は軸ぷよより1小さいべき"
            Expect.equal rotatedPair.Child.Position.Y rotatedPair.Axis.Position.Y "子ぷよのY座標は軸ぷよと同じであるべき"

        testCase "右回転を4回すると、子ぷよが軸ぷよの上に戻る" <| fun _ ->
            let pair = Player.createNewPuyoPair()

            let rotatedPair = Player.rotateRight (Player.rotateRight (Player.rotateRight (Player.rotateRight pair 6) 6) 6) 6

            Expect.equal rotatedPair.Child.Position.X rotatedPair.Axis.Position.X "子ぷよのX座標は軸ぷよと同じであるべき"
            Expect.equal rotatedPair.Child.Position.Y (rotatedPair.Axis.Position.Y - 1) "子ぷよのY座標は軸ぷよより1小さいべき"
    ]

let wallKickTests =
    testList "壁キック" [
        testCase "左端で左回転すると、壁キックが発生する" <| fun _ ->
            // 左端に配置されたぷよペア（軸が左端、子が上）
            let pair = {
                Axis = { Color = PuyoColor.Red; Position = { X = 0; Y = 5 } }
                Child = { Color = PuyoColor.Blue; Position = { X = 0; Y = 4 } }
            }

            // 3回右回転すると左になるが、壁キックで軸が右に移動
            let rotatedPair = Player.rotateRight (Player.rotateRight (Player.rotateRight pair 6) 6) 6

            Expect.equal rotatedPair.Axis.Position.X 1 "軸ぷよが右に移動するべき"
            Expect.equal rotatedPair.Child.Position.X 0 "子ぷよのX座標は0であるべき"

        testCase "右端で右回転すると、壁キックが発生する" <| fun _ ->
            // 右端に配置されたぷよペア（軸が右端、子が上）
            let pair = {
                Axis = { Color = PuyoColor.Red; Position = { X = 5; Y = 5 } }
                Child = { Color = PuyoColor.Blue; Position = { X = 5; Y = 4 } }
            }

            // 1回右回転すると右になるが、壁キックで軸が左に移動
            let rotatedPair = Player.rotateRight pair 6

            Expect.equal rotatedPair.Axis.Position.X 4 "軸ぷよが左に移動するべき"
            Expect.equal rotatedPair.Child.Position.X 5 "子ぷよのX座標は5であるべき"
    ]

let tests =
    testList "プレイヤー機能" [
        playerTests
        puyoMoveTests
        puyoPairTests
        puyoPairRotationTests
        wallKickTests
    ]
