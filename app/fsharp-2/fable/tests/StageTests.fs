// tests/StageTests.fs
module PuyoPuyo.Tests.StageTests

open Fable.Mocha
open PuyoPuyo.Types
open PuyoPuyo

let gravityTests =
    testList "重力処理" [
        testCase "下に空間があるぷよは落下する" <| fun _ ->
            let stage = Stage.create()

            // (2, 5) に赤ぷよを配置
            let stageWithPuyo = Stage.setPuyo 2 5 PuyoColor.Red stage

            // 重力を適用
            let afterGravity = Stage.applyGravity stageWithPuyo

            // ぷよが最下段まで落下していることを確認
            Expect.equal afterGravity.Cells.[stage.Rows - 1].[2] PuyoColor.Red "ぷよが最下段に落下している"
            Expect.equal afterGravity.Cells.[5].[2] PuyoColor.Empty "元の位置は空になっている"

        testCase "下にぷよがある場合は落下しない" <| fun _ ->
            let stage = Stage.create()

            // (2, 11) に赤ぷよ、(2, 10) に青ぷよを配置
            let stageWithPuyos =
                stage
                |> Stage.setPuyo 2 (stage.Rows - 1) PuyoColor.Red
                |> Stage.setPuyo 2 (stage.Rows - 2) PuyoColor.Blue

            // 重力を適用
            let afterGravity = Stage.applyGravity stageWithPuyos

            // ぷよの位置が変わっていないことを確認
            Expect.equal afterGravity.Cells.[stage.Rows - 1].[2] PuyoColor.Red "赤ぷよが最下段にある"
            Expect.equal afterGravity.Cells.[stage.Rows - 2].[2] PuyoColor.Blue "青ぷよがその上にある"

        testCase "複数のぷよが連鎖的に落下する" <| fun _ ->
            let stage = Stage.create()

            // (2, 3) に赤ぷよ、(2, 5) に青ぷよを配置
            let stageWithPuyos =
                stage
                |> Stage.setPuyo 2 3 PuyoColor.Red
                |> Stage.setPuyo 2 5 PuyoColor.Blue

            // 重力を適用
            let afterGravity = Stage.applyGravity stageWithPuyos

            // 両方のぷよが落下していることを確認
            Expect.equal afterGravity.Cells.[stage.Rows - 1].[2] PuyoColor.Blue "青ぷよが最下段にある"
            Expect.equal afterGravity.Cells.[stage.Rows - 2].[2] PuyoColor.Red "赤ぷよがその上にある"
            Expect.equal afterGravity.Cells.[3].[2] PuyoColor.Empty "元の位置は空"
            Expect.equal afterGravity.Cells.[5].[2] PuyoColor.Empty "元の位置は空"
    ]

let tests =
    testList "ステージ機能" [
        gravityTests
    ]
