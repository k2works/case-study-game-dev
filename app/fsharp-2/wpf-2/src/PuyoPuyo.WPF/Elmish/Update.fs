module Elmish.Update

open System
open Domain.Board
open Domain.GameLogic
open Domain.PuyoPair
open Elmish.Model

// 連鎖処理を再帰的に実行
let rec private processChain (board: Board) (chainCount: int) : Board * int =
    // 消去判定
    let groups = findConnectedGroups board

    if List.isEmpty groups then
        // 消去対象がない場合、連鎖終了
        (board, chainCount)
    else
        // 消去処理
        let positions = groups |> List.concat
        let boardAfterClear = board |> clearPuyos positions
        // 重力適用
        let boardAfterGravity = applyGravity boardAfterClear
        // 連鎖カウントを増やして再帰呼び出し
        processChain boardAfterGravity (chainCount + 1)

// ぷよを下に移動させる（共通処理）
let private dropPuyo (random: Random) (model: Model) =
    match model.CurrentPair with
    | Some pair ->
        // 下に移動を試みる
        match tryMovePuyoPair model.Board pair Down with
        | Some movedPair ->
            // 移動できた場合
            { model with
                CurrentPair = Some movedPair }
        | None ->
            // 移動できない場合、ぷよを固定
            let boardWithPuyo = fixPuyoPair model.Board pair
            // 重力適用
            let boardAfterGravity = applyGravity boardWithPuyo

            // 連鎖処理
            let (boardAfterChain, chainCount) = processChain boardAfterGravity 0

            // 新しいぷよを生成
            let newPair = generatePuyoPair random

            { model with
                Board = boardAfterChain
                Chain = chainCount
                CurrentPair = Some newPair }
    | None -> model

// ランダム生成器を受け取る更新関数（テスト用）
let updateWithRandom (random: Random) msg model =
    match msg with
    | StartGame ->
        { model with
            CurrentPair = Some(generatePuyoPair random)
            GameState = Playing }
    | Tick -> dropPuyo random model
    | MoveLeft ->
        match model.CurrentPair with
        | Some pair ->
            match tryMovePuyoPair model.Board pair Left with
            | Some movedPair ->
                { model with
                    CurrentPair = Some movedPair }
            | None -> model
        | None -> model
    | MoveRight ->
        match model.CurrentPair with
        | Some pair ->
            match tryMovePuyoPair model.Board pair Right with
            | Some movedPair ->
                { model with
                    CurrentPair = Some movedPair }
            | None -> model
        | None -> model
    | Rotate ->
        match model.CurrentPair with
        | Some pair ->
            match tryRotatePuyoPair model.Board pair with
            | Some rotatedPair ->
                { model with
                    CurrentPair = Some rotatedPair }
            | None -> model
        | None -> model
    | MoveDown -> dropPuyo random model

// 更新関数（Elmish用）
let update msg model =
    let random = Random()
    updateWithRandom random msg model
