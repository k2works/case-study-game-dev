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

let eraseTests =
    testList "ぷよの消去判定" [
        testCase "同じ色のぷよが4つつながっていると、消去対象になる" <| fun _ ->
            let stage = Stage.create()

            // 2×2の正方形に赤ぷよを配置
            let stageWithPuyo =
                stage
                |> Stage.setPuyo 1 (stage.Rows - 2) PuyoColor.Red
                |> Stage.setPuyo 2 (stage.Rows - 2) PuyoColor.Red
                |> Stage.setPuyo 1 (stage.Rows - 1) PuyoColor.Red
                |> Stage.setPuyo 2 (stage.Rows - 1) PuyoColor.Red

            // 消去判定
            let eraseInfo = Stage.checkErase stageWithPuyo

            // 4つのぷよが消去対象になっている
            Expect.equal eraseInfo.ErasePuyoCount 4 "4つのぷよが消去対象"
            Expect.isTrue (eraseInfo.ErasePositions.Length > 0) "消去位置がある"

        testCase "異なる色のぷよは消去対象にならない" <| fun _ ->
            let stage = Stage.create()

            // 市松模様に赤と青のぷよを配置
            let stageWithPuyo =
                stage
                |> Stage.setPuyo 1 (stage.Rows - 2) PuyoColor.Red
                |> Stage.setPuyo 2 (stage.Rows - 2) PuyoColor.Blue
                |> Stage.setPuyo 1 (stage.Rows - 1) PuyoColor.Blue
                |> Stage.setPuyo 2 (stage.Rows - 1) PuyoColor.Red

            // 消去判定
            let eraseInfo = Stage.checkErase stageWithPuyo

            // 消去対象がない
            Expect.equal eraseInfo.ErasePuyoCount 0 "消去対象がない"
            Expect.equal eraseInfo.ErasePositions.Length 0 "消去位置がない"

        testCase "3つ以下のつながりは消去対象にならない" <| fun _ ->
            let stage = Stage.create()

            // L字型に赤ぷよを3つ配置
            let stageWithPuyo =
                stage
                |> Stage.setPuyo 1 (stage.Rows - 2) PuyoColor.Red
                |> Stage.setPuyo 1 (stage.Rows - 1) PuyoColor.Red
                |> Stage.setPuyo 2 (stage.Rows - 1) PuyoColor.Red

            // 消去判定
            let eraseInfo = Stage.checkErase stageWithPuyo

            // 消去対象がない
            Expect.equal eraseInfo.ErasePuyoCount 0 "3つ以下は消去されない"
    ]

let eraseExecutionTests =
    testList "ぷよの消去実行" [
        testCase "消去対象のぷよを消去する" <| fun _ ->
            let stage = Stage.create()

            // 2×2の正方形に赤ぷよを配置
            let stageWithPuyo =
                stage
                |> Stage.setPuyo 1 (stage.Rows - 2) PuyoColor.Red
                |> Stage.setPuyo 2 (stage.Rows - 2) PuyoColor.Red
                |> Stage.setPuyo 1 (stage.Rows - 1) PuyoColor.Red
                |> Stage.setPuyo 2 (stage.Rows - 1) PuyoColor.Red

            // 消去判定
            let eraseInfo = Stage.checkErase stageWithPuyo

            // 消去実行
            let erasedStage = Stage.eraseBlocks eraseInfo.ErasePositions stageWithPuyo

            // ぷよが消去されている
            Expect.equal erasedStage.Cells.[stage.Rows - 2].[1] PuyoColor.Empty "位置(1,10)が空"
            Expect.equal erasedStage.Cells.[stage.Rows - 2].[2] PuyoColor.Empty "位置(2,10)が空"
            Expect.equal erasedStage.Cells.[stage.Rows - 1].[1] PuyoColor.Empty "位置(1,11)が空"
            Expect.equal erasedStage.Cells.[stage.Rows - 1].[2] PuyoColor.Empty "位置(2,11)が空"

        testCase "消去後、上にあるぷよが落下している" <| fun _ ->
            let stage = Stage.create()

            // 赤ぷよの上に青ぷよを配置
            let stageWithPuyo =
                stage
                |> Stage.setPuyo 1 (stage.Rows - 2) PuyoColor.Red
                |> Stage.setPuyo 2 (stage.Rows - 2) PuyoColor.Red
                |> Stage.setPuyo 1 (stage.Rows - 1) PuyoColor.Red
                |> Stage.setPuyo 2 (stage.Rows - 1) PuyoColor.Red
                |> Stage.setPuyo 2 (stage.Rows - 4) PuyoColor.Blue
                |> Stage.setPuyo 2 (stage.Rows - 3) PuyoColor.Blue

            // 消去判定と実行
            let eraseInfo = Stage.checkErase stageWithPuyo
            let erasedStage = Stage.eraseBlocks eraseInfo.ErasePositions stageWithPuyo

            // 重力を適用
            let fallenStage = Stage.applyGravity erasedStage

            // 青ぷよが落下している
            Expect.equal fallenStage.Cells.[stage.Rows - 2].[2] PuyoColor.Blue "青ぷよ1が落下"
            Expect.equal fallenStage.Cells.[stage.Rows - 1].[2] PuyoColor.Blue "青ぷよ2が落下"
    ]

let zenkeshiTests =
    testList "全消し判定" [
        testCase "盤面上のぷよがすべて消えると全消しになる" <| fun _ ->
            let stage = Stage.create()

            // ステージにぷよを配置
            let stageWithPuyo =
                stage
                |> Stage.setPuyo 1 (stage.Rows - 2) PuyoColor.Red
                |> Stage.setPuyo 2 (stage.Rows - 2) PuyoColor.Red
                |> Stage.setPuyo 1 (stage.Rows - 1) PuyoColor.Red
                |> Stage.setPuyo 2 (stage.Rows - 1) PuyoColor.Red

            // 消去判定と実行
            let eraseInfo = Stage.checkErase stageWithPuyo
            let erasedStage = Stage.eraseBlocks eraseInfo.ErasePositions stageWithPuyo

            // 全消し判定
            let isZenkeshi = Stage.checkZenkeshi erasedStage

            // 全消しになっている
            Expect.isTrue isZenkeshi "全消しになる"

        testCase "盤面上にぷよが残っていると全消しにならない" <| fun _ ->
            let stage = Stage.create()

            // ステージにぷよを配置
            let stageWithPuyo =
                stage
                |> Stage.setPuyo 1 (stage.Rows - 2) PuyoColor.Red
                |> Stage.setPuyo 2 (stage.Rows - 2) PuyoColor.Red
                |> Stage.setPuyo 1 (stage.Rows - 1) PuyoColor.Red
                |> Stage.setPuyo 2 (stage.Rows - 1) PuyoColor.Red
                |> Stage.setPuyo 3 (stage.Rows - 1) PuyoColor.Blue  // 消えないぷよ

            // 消去判定と実行
            let eraseInfo = Stage.checkErase stageWithPuyo
            let erasedStage = Stage.eraseBlocks eraseInfo.ErasePositions stageWithPuyo

            // 全消し判定
            let isZenkeshi = Stage.checkZenkeshi erasedStage

            // 全消しになっていない
            Expect.isFalse isZenkeshi "全消しにならない"
    ]

let tests =
    testList "ステージ機能" [
        gravityTests
        eraseTests
        eraseExecutionTests
        zenkeshiTests
    ]
