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

let tests =
    testList "プレイヤー機能" [
        playerTests
        puyoMoveTests
    ]
