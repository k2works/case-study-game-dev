module PuyoGame.Elmish.Update

open PuyoGame.Domain
open PuyoGame.Domain.Board
open PuyoGame.Domain.Puyo
open PuyoGame.Domain.GameLogic
open PuyoGame.Elmish.Model
open PuyoGame.Elmish.Commands
open Elmish

/// ゲームオーバー判定（上部 2 行にぷよがある場合）
let isGameOver (board: Board) : bool =
    [0; 1]
    |> List.exists (fun y ->
        [0 .. (width board - 1)]
        |> List.exists (fun x ->
            match tryGetCell board { X = x; Y = y } with
            | Some (Filled _) -> true
            | _ -> false
        )
    )

/// Update 関数
let update (message: Message) (model: Model) : Model * Cmd<Message> =
    match message with
    | StartGame ->
        let firstPiece = spawnNewPuyoPair ()
        let nextPiece = spawnNewPuyoPair ()
        {
            model with
                Board = createEmpty
                CurrentPiece = Some firstPiece
                NextPiece = Some nextPiece
                Score = 0
                Level = 1
                ChainCount = 0
                GameTime = 0
                GameStatus = Playing
        }, startGameLoop ()

    | MoveLeft ->
        match model.CurrentPiece with
        | None -> model, Cmd.none
        | Some piece when model.GameStatus = Playing ->
            let movedPiece = movePuyoPairLeft model.Board piece
            { model with CurrentPiece = Some movedPiece }, Cmd.none
        | _ -> model, Cmd.none

    | MoveRight ->
        match model.CurrentPiece with
        | None -> model, Cmd.none
        | Some piece when model.GameStatus = Playing ->
            let movedPiece = movePuyoPairRight model.Board piece
            { model with CurrentPiece = Some movedPiece }, Cmd.none
        | _ -> model, Cmd.none

    | MoveDown ->
        match model.CurrentPiece with
        | None -> model, Cmd.none
        | Some piece when model.GameStatus = Playing ->
            let movedPiece = movePuyoPairDown model.Board piece
            { model with CurrentPiece = Some movedPiece }, Cmd.none
        | _ -> model, Cmd.none

    | Rotate ->
        match model.CurrentPiece with
        | None -> model, Cmd.none
        | Some piece when model.GameStatus = Playing ->
            let rotatedPiece = rotatePuyoPair piece
            // 回転後の位置が有効かチェック
            if canMovePuyoPair model.Board rotatedPiece Down ||
               not (canFall model.Board rotatedPiece) then
                { model with CurrentPiece = Some rotatedPiece }, Cmd.none
            else
                model, Cmd.none
        | _ -> model, Cmd.none

    | HardDrop ->
        match model.CurrentPiece with
        | None -> model, Cmd.none
        | Some piece when model.GameStatus = Playing ->
            let droppedPiece = hardDrop model.Board piece
            { model with CurrentPiece = Some droppedPiece }, Cmd.none
        | _ -> model, Cmd.none

    | GameTick ->
        if model.GameStatus <> Playing then
            model, Cmd.none
        else
            match model.CurrentPiece with
            | None ->
                // 現在のピースがない場合、次のピースを配置
                match model.NextPiece with
                | Some nextPiece ->
                    let newNextPiece = spawnNewPuyoPair ()
                    {
                        model with
                            CurrentPiece = Some nextPiece
                            NextPiece = Some newNextPiece
                    }, scheduleNextTick ()
                | None ->
                    let newPiece = spawnNewPuyoPair ()
                    let nextPiece = spawnNewPuyoPair ()
                    {
                        model with
                            CurrentPiece = Some newPiece
                            NextPiece = Some nextPiece
                    }, scheduleNextTick ()

            | Some currentPiece ->
                if canFall model.Board currentPiece then
                    // まだ落下できる場合
                    let movedPiece = movePuyoPairDown model.Board currentPiece
                    { model with CurrentPiece = Some movedPiece }, scheduleNextTick ()
                else
                    // 落下できない場合 - 固定処理
                    let fixedBoard = fixPuyoPairToBoard model.Board currentPiece

                    // 固定後に浮遊ぷよを落下させる
                    let droppedBoard = dropFloatingPuyos fixedBoard

                    // 連鎖処理
                    let chainResult = executeChain droppedBoard

                    // ゲームオーバーチェック
                    if isGameOver chainResult.Board then
                        {
                            model with
                                Board = chainResult.Board
                                CurrentPiece = None
                                Score = model.Score + chainResult.TotalScore
                                ChainCount = chainResult.ChainCount
                                GameStatus = GameOver
                        }, Cmd.none
                    else
                        // 次のピースを配置
                        match model.NextPiece with
                        | Some nextPiece ->
                            let newNextPiece = spawnNewPuyoPair ()
                            {
                                model with
                                    Board = chainResult.Board
                                    CurrentPiece = Some nextPiece
                                    NextPiece = Some newNextPiece
                                    Score = model.Score + chainResult.TotalScore
                                    ChainCount = chainResult.ChainCount
                            }, scheduleNextTick ()
                        | None ->
                            {
                                model with
                                    Board = chainResult.Board
                                    CurrentPiece = None
                                    Score = model.Score + chainResult.TotalScore
                                    ChainCount = chainResult.ChainCount
                            }, scheduleNextTick ()

    | NoOp ->
        model, Cmd.none