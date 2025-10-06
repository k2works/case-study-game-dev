namespace PuyoPuyo.Elmish

open Elmish
open PuyoPuyo.Domain

/// ゲームのメッセージ
type Message =
    | StartGame
    | ResetGame
    | MoveLeft
    | MoveRight
    | MoveDown
    | Rotate
    | Tick
    | StartFastFall
    | StopFastFall
    | HardDrop
    | GameStep
    | TimeStep
    | SpawnNewPiece
    | FixPiece
    | ProcessChain
    | CheckGameOver

module Update =
    /// ぷよを下に移動させる（共通処理）
    let private dropPuyo (model: Model) : Model * Cmd<Message> =
        match model.CurrentPiece with
        | Some piece ->
            match GameLogic.tryMovePuyoPair model.Board piece Down with
            | Some movedPiece ->
                // 移動成功
                { model with
                    CurrentPiece = Some movedPiece },
                Cmd.none
            | None ->
                // 移動できない（着地）
                let boardWithPuyo = Board.fixPuyoPair model.Board piece

                // 最初に重力を適用
                let boardAfterGravity = Board.applyGravity boardWithPuyo

                // 連鎖処理（消去と重力を繰り返し適用）
                let boardAfterChain = Board.clearAndApplyGravityRepeatedly boardAfterGravity

                let nextPiece = PuyoPair.createRandom 2 1 0

                { model with
                    Board = boardAfterChain
                    CurrentPiece = Some nextPiece },
                Cmd.none
        | None -> model, Cmd.none

    /// Update 関数
    let update (message: Message) (model: Model) : Model * Cmd<Message> =
        match message with
        | StartGame ->
            let firstPiece = PuyoPair.createRandom 2 1 0
            let nextPiece = PuyoPair.createRandom 2 1 0

            { model with
                Board = Board.create 6 13
                CurrentPiece = Some firstPiece
                NextPiece = Some nextPiece
                Score = 0
                GameTime = 0
                Status = Playing },
            Cmd.none

        | ResetGame -> Model.init (), Cmd.none

        | MoveLeft when model.Status = Playing ->
            match model.CurrentPiece with
            | Some piece ->
                match GameLogic.tryMovePuyoPair model.Board piece Left with
                | Some movedPiece ->
                    { model with
                        CurrentPiece = Some movedPiece },
                    Cmd.none
                | None -> model, Cmd.none
            | None -> model, Cmd.none

        | MoveRight when model.Status = Playing ->
            match model.CurrentPiece with
            | Some piece ->
                match GameLogic.tryMovePuyoPair model.Board piece Right with
                | Some movedPiece ->
                    { model with
                        CurrentPiece = Some movedPiece },
                    Cmd.none
                | None -> model, Cmd.none
            | None -> model, Cmd.none

        | Rotate when model.Status = Playing ->
            match model.CurrentPiece with
            | Some piece ->
                match GameLogic.tryRotatePuyoPair model.Board piece with
                | Some rotatedPiece ->
                    { model with
                        CurrentPiece = Some rotatedPiece },
                    Cmd.none
                | None -> model, Cmd.none
            | None -> model, Cmd.none

        | Tick when model.Status = Playing -> dropPuyo model

        | MoveDown when model.Status = Playing -> dropPuyo model

        | StartFastFall when model.Status = Playing -> { model with IsFastFalling = true }, Cmd.none

        | StopFastFall when model.Status = Playing -> { model with IsFastFalling = false }, Cmd.none

        | _ -> model, Cmd.none
