// tests/GameTests.fs
module PuyoPuyo.Tests.GameTests

open Fable.Mocha
open PuyoPuyo

let gameInitTests =
    testList "ゲームの初期化" [
        testCase "ゲームを初期化すると、ステージが6列12行で作成される" <| fun _ ->
            let gameState = Game.init()

            Expect.equal gameState.Stage.Cols 6 "ステージは6列であるべき"
            Expect.equal gameState.Stage.Rows 12 "ステージは12行であるべき"
    ]

let tests =
    testList "ゲーム" [
        gameInitTests
    ]
