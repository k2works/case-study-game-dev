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

let chainReactionTests =
    testList "連鎖反応" [
        testCase "ぷよの消去と落下後、新たな消去パターンがあれば連鎖が発生する" <| fun _ ->
            let gameState = Game.init()

            // 連鎖が発生する配置を作成
            // 赤ぷよの2×2と、その上に青ぷよが縦に3つ、さらに青ぷよが1つ横に
            let stage = gameState.Stage
            let stageWithPuyo =
                stage
                |> Stage.setPuyo 1 (stage.Rows - 2) Types.PuyoColor.Red      // 赤
                |> Stage.setPuyo 2 (stage.Rows - 2) Types.PuyoColor.Red      // 赤
                |> Stage.setPuyo 1 (stage.Rows - 1) Types.PuyoColor.Red      // 赤
                |> Stage.setPuyo 2 (stage.Rows - 1) Types.PuyoColor.Red      // 赤
                |> Stage.setPuyo 3 (stage.Rows - 2) Types.PuyoColor.Blue     // 青（横）
                |> Stage.setPuyo 2 (stage.Rows - 5) Types.PuyoColor.Blue     // 青（上）
                |> Stage.setPuyo 2 (stage.Rows - 4) Types.PuyoColor.Blue     // 青（上）
                |> Stage.setPuyo 2 (stage.Rows - 3) Types.PuyoColor.Blue     // 青（上）

            // autoFallを実行（連鎖処理も完了する）
            let stateAfterChain = { gameState with Stage = stageWithPuyo }

            // processEraseを直接呼び出して連鎖処理を実行
            let rec processErase (currentStage: Stage.StageState) : Stage.StageState =
                let info = Stage.checkErase currentStage
                if info.ErasePuyoCount > 0 then
                    let erasedStage = Stage.eraseBlocks info.ErasePositions currentStage
                    let fallenStage = Stage.applyGravity erasedStage
                    processErase fallenStage
                else
                    currentStage

            let finalStage = processErase stageWithPuyo

            // 連鎖後、すべてのぷよが消えている（赤4つ + 青4つ = 8つ）
            let remainingPuyoCount =
                finalStage.Cells
                |> Array.sumBy (fun row ->
                    row |> Array.filter (fun cell -> cell <> Types.PuyoColor.Empty) |> Array.length)

            Expect.equal remainingPuyoCount 0 "連鎖によりすべてのぷよが消える"
    ]

let scoreTests =
    testList "スコア計算" [
        testCase "ぷよを消すとスコアが加算される" <| fun _ ->
            // 4つのぷよを消す（1連鎖目）
            let score = Score.calculateScore 4 1

            // スコアが加算されている
            Expect.isTrue (score > 0) "スコアが加算される"
            Expect.equal score 40 "4つ消して1連鎖なら40点"

        testCase "連鎖数が多いほどスコアが高くなる" <| fun _ ->
            // 1連鎖目のスコア
            let score1 = Score.calculateScore 4 1

            // 2連鎖目のスコア
            let score2 = Score.calculateScore 4 2

            // 2連鎖目の方がスコアが高い
            Expect.isTrue (score2 > score1) "連鎖数が多いとスコアが高い"
            Expect.equal score2 320 "4つ消して2連鎖なら320点"

        testCase "消したぷよが多いほどスコアが高くなる" <| fun _ ->
            // 4つ消した場合
            let score4 = Score.calculateScore 4 1

            // 8つ消した場合
            let score8 = Score.calculateScore 8 1

            // 8つ消した方がスコアが高い
            Expect.isTrue (score8 > score4) "消したぷよが多いとスコアが高い"
            Expect.equal score8 80 "8つ消して1連鎖なら80点"
    ]

let zenkeshiBonusTests =
    testList "全消しボーナス" [
        testCase "盤面上のぷよをすべて消すと全消しボーナスが加算される" <| fun _ ->
            let gameState = Game.init()

            // 盤面に2つのぷよを配置（縦に並べる）
            let stage = gameState.Stage
            let stageWithPuyo =
                stage
                |> Stage.setPuyo 1 (stage.Rows - 1) Types.PuyoColor.Red  // (1, 11)
                |> Stage.setPuyo 1 (stage.Rows - 2) Types.PuyoColor.Red  // (1, 10)

            // ぷよペアを固定する位置に配置（着地済みの状態）
            // 赤色で統一し、縦4つにして全消しが発生するようにする
            let pairAtBottom: Types.PuyoPair = {
                Axis = { Color = Types.PuyoColor.Red; Position = { X = 1; Y = stage.Rows - 3 } }   // (1, 9)
                Child = { Color = Types.PuyoColor.Red; Position = { X = 1; Y = stage.Rows - 4 } }  // (1, 8)
            }

            let stateWithPuyo = { gameState with Stage = stageWithPuyo; CurrentPuyo = Some pairAtBottom }

            // autoFallを実行（着地、消去、全消し判定が実行される）
            let finalState = Game.autoFall stateWithPuyo

            // スコアが加算されている
            Expect.isTrue (finalState.Score > 0) "スコアが加算される"

            // 全消しボーナスが含まれている（4つ消去 + 全消しボーナス）
            let expectedScore = Score.calculateScore 4 1 + Score.zenkeshiBonus
            Expect.equal finalState.Score expectedScore "全消しボーナスが加算されている"
    ]

let gameOverTests =
    testList "ゲームオーバー処理" [
        testCase "新しいぷよを配置できない場合、IsGameOverがtrueになる" <| fun _ ->
            let gameState = Game.init()

            // ステージの上部（X=2, Y=0）にぷよを配置（ゲームオーバー判定用）
            // Redが落ちないように、X=2の列全体を埋める（Y=1からY=Rows-1まで）
            let stage = gameState.Stage
            let mutable stageWithPuyo = Stage.setPuyo 2 0 Types.PuyoColor.Red stage  // ゲームオーバー判定用

            // X=2の列を下から埋める（消去されないように異なる色を交互に配置）
            for y in 1 .. (stage.Rows - 1) do
                let color = if y % 2 = 0 then Types.PuyoColor.Purple else Types.PuyoColor.Green
                stageWithPuyo <- Stage.setPuyo 2 y color stageWithPuyo

            // X=1の最下行にも配置（着地先）
            stageWithPuyo <- Stage.setPuyo 1 (stage.Rows - 1) Types.PuyoColor.Blue stageWithPuyo

            // ぷよペアを下から2番目に配置（着地直前）
            let pair: Types.PuyoPair = {
                Axis = { Color = Types.PuyoColor.Yellow; Position = { X = 1; Y = stage.Rows - 2 } }
                Child = { Color = Types.PuyoColor.Yellow; Position = { X = 1; Y = stage.Rows - 3 } }
            }

            let stateBeforeFall = { gameState with Stage = stageWithPuyo; CurrentPuyo = Some pair; IsGameOver = false }

            // autoFallを実行（着地、消去、ゲームオーバー判定が実行される）
            let finalState = Game.autoFall stateBeforeFall

            // IsGameOverがtrueになっていることを確認
            Expect.isTrue finalState.IsGameOver "配置できない場合はゲームオーバーになる"
            Expect.equal finalState.CurrentPuyo None "ゲームオーバー時はCurrentPuyoがNone"

        testCase "新しいぷよを配置できる場合、IsGameOverがfalseになる" <| fun _ ->
            let gameState = Game.init()

            // ぷよペアを最下部に配置（着地直前）
            let pair: Types.PuyoPair = {
                Axis = { Color = Types.PuyoColor.Blue; Position = { X = 1; Y = gameState.Stage.Rows - 2 } }
                Child = { Color = Types.PuyoColor.Green; Position = { X = 1; Y = gameState.Stage.Rows - 3 } }
            }

            let stateBeforeFall = { gameState with CurrentPuyo = Some pair }

            // autoFallを実行
            let finalState = Game.autoFall stateBeforeFall

            // IsGameOverがfalseのままであることを確認
            Expect.isFalse finalState.IsGameOver "配置できる場合はゲームオーバーにならない"
            Expect.notEqual finalState.CurrentPuyo None "ゲーム継続時は新しいぷよが生成される"
    ]

let tests =
    testList "ゲーム" [
        gameInitTests
        chainReactionTests
        scoreTests
        zenkeshiBonusTests
        gameOverTests
    ]
