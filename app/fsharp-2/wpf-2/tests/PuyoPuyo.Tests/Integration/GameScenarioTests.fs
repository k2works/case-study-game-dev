module Integration.GameScenarioTests

open System
open Xunit
open FsUnit.Xunit
open Domain.Puyo
open Domain.Board
open Domain.GameLogic
open Domain.PuyoPair
open Elmish.Model
open Elmish.Update

/// テストヘルパー: 複数のメッセージを順次実行
let private executeMessages (random: Random) (messages: Message list) (initialModel: Model) =
    messages |> List.fold (fun model msg -> updateWithRandom random msg model) initialModel

/// テストヘルパー: 指定した色のぷよペアを生成
let private createPuyoPair axis child =
    { Axis = axis
      Child = child
      AxisPosition = { X = 2; Y = 0 }
      ChildPosition = { X = 2; Y = -1 }
      Rotation = 0 }

module ``ゲーム全体のプレイシナリオ`` =
    [<Fact>]
    let ``ゲーム開始から消去までの一連の流れが正しく動作する`` () =
        // Arrange
        let random = Random(42)

        // ボードに赤いぷよを 3 つ配置（あと1つで消える状態）
        let board =
            init().Board
            |> setCellColor 2 11 Red
            |> setCellColor 2 10 Red
            |> setCellColor 2 9 Red

        let model =
            { init () with
                Board = board
                CurrentPair = Some(createPuyoPair Red Red)
                GameState = Playing }

        // Act - 左に移動してから落下させる（消去されない位置）
        let step1 = updateWithRandom random MoveLeft model

        // 元の位置に戻す
        let step2 = updateWithRandom random MoveRight step1

        // 下に落として固定（4つつながって消える）
        let rec dropUntilFixed currentModel =
            match currentModel.CurrentPair with
            | Some pair when pair.AxisPosition.Y < 8 ->
                dropUntilFixed (updateWithRandom random Tick currentModel)
            | _ -> updateWithRandom random Tick currentModel

        let finalModel = dropUntilFixed step2

        // Assert
        // ぷよが消えている
        getCellColor 2 11 finalModel.Board |> should equal Empty
        getCellColor 2 10 finalModel.Board |> should equal Empty
        getCellColor 2 9 finalModel.Board |> should equal Empty
        getCellColor 2 8 finalModel.Board |> should equal Empty

        // スコアが加算されている（5個 × 10点 = 50点 + 全消しボーナス 3600点 = 3650点）
        finalModel.Score |> should equal 3650

        // 新しいぷよが生成されている
        finalModel.CurrentPair |> should not' (equal None)

        // ゲームは続行中
        finalModel.GameState |> should equal Playing

    [<Fact>]
    let ``回転操作を含む複雑な操作シナリオ`` () =
        // Arrange
        let random = Random(42)

        let model =
            { init () with
                CurrentPair = Some(createPuyoPair Red Blue)
                GameState = Playing }

        // Act - 回転 → 右移動 → 左移動 → 落下
        let messages = [ Rotate; MoveRight; MoveLeft; MoveDown ]

        let finalModel = executeMessages random messages model

        // Assert - エラーなく操作が実行される
        finalModel.GameState |> should equal Playing

module ``連鎖反応の統合テスト`` =
    [<Fact>]
    let ``連鎖が発生することを確認`` () =
        // Arrange
        let random = Random(42)

        // 2連鎖が発生する簡単な配置
        let board =
            init().Board
            // 赤4つ（底）
            |> setCellColor 2 11 Red
            |> setCellColor 2 10 Red
            |> setCellColor 2 9 Red
            |> setCellColor 2 8 Red
            // 青4つ（上）- 赤が消えると落ちて4つつながる
            |> setCellColor 2 7 Blue
            |> setCellColor 2 6 Blue
            |> setCellColor 2 5 Blue
            |> setCellColor 3 8 Blue

        let model =
            { init () with
                Board = board
                CurrentPair =
                    Some
                        { createPuyoPair Red Red with
                            AxisPosition = { X = 2; Y = 4 }
                            ChildPosition = { X = 2; Y = 3 } }
                GameState = Playing }

        // Act
        let finalModel = updateWithRandom random Tick model

        // Assert
        // 連鎖が発生
        finalModel.Chain |> should be (greaterThan 0)

        // スコアが加算されている
        finalModel.Score |> should be (greaterThan 0)

        // ゲームは続行中
        finalModel.GameState |> should equal Playing

module ``複数ぷよペアの順次配置`` =
    [<Fact>]
    let ``複数のぷよペアを連続で配置できる`` () =
        // Arrange
        let random = Random(123) // 固定シード

        let model =
            { init () with
                CurrentPair = Some(generatePuyoPair random)
                NextPair = Some(generatePuyoPair random)
                GameState = Playing }

        // Act - 1つ目のぷよを固定
        let rec dropToBottom (currentModel: Model) (count: int) =
            if count > 15 then
                currentModel // 無限ループ防止
            else
                match currentModel.CurrentPair with
                | Some pair when pair.AxisPosition.Y < 10 ->
                    dropToBottom (updateWithRandom random Tick currentModel) (count + 1)
                | Some _ -> updateWithRandom random Tick currentModel // 最後の1回で固定
                | None -> currentModel

        let afterFirst = dropToBottom model 0

        // 2つ目のぷよを固定（別の列に移動してから）
        let movedRight = updateWithRandom random MoveRight afterFirst
        let afterSecond = dropToBottom movedRight 0

        // Assert
        // ゲームは続行中（ゲームオーバーしていない）
        afterSecond.GameState |> should equal Playing

        // 次のぷよが準備されている
        afterSecond.CurrentPair |> should not' (equal None)
        afterSecond.NextPair |> should not' (equal None)

        // ボードにぷよが配置されている（消去されていなければ最低2個）
        let nonEmptyCount =
            [ for x in 0..5 do
                  for y in 0..11 do
                      if getCellColor x y afterSecond.Board <> Empty then
                          yield 1 ]
            |> List.length

        nonEmptyCount |> should be (greaterThanOrEqualTo 1)

module ``ゲームオーバーからの復帰`` =
    [<Fact>]
    let ``ゲームオーバーから再開して正常にプレイできる`` () =
        // Arrange
        let random = Random(42)

        // ゲームオーバー状態を作成
        let gameOverModel =
            { init () with
                Board = init().Board |> setCellColor 2 0 Red
                Score = 1000
                Chain = 5
                GameState = GameOver
                CurrentPair = None }

        // Act - ゲームを再開
        let restartedModel = updateWithRandom random RestartGame gameOverModel

        // ぷよを移動して落下させる
        let messages = [ MoveRight; MoveDown; MoveDown; MoveDown ]

        let finalModel = executeMessages random messages restartedModel

        // Assert
        // ゲーム状態がリセットされている
        restartedModel.Score |> should equal 0
        restartedModel.Chain |> should equal 0
        restartedModel.GameState |> should equal Playing

        // 操作が正常に実行できる
        finalModel.GameState |> should equal Playing

        // ぷよが存在する
        finalModel.CurrentPair |> should not' (equal None)

module ``エッジケースの統合`` =
    [<Fact>]
    let ``盤面端での回転と移動が連携して正しく動作する`` () =
        // Arrange
        let random = Random(42)

        let model =
            { init () with
                CurrentPair =
                    Some
                        { createPuyoPair Red Blue with
                            AxisPosition = { X = 0; Y = 5 }
                            ChildPosition = { X = 0; Y = 4 } }
                GameState = Playing }

        // Act - 左端で回転を試みる（壁に当たる可能性）
        let afterRotate = updateWithRandom random Rotate model

        // 右に移動
        let afterMove = updateWithRandom random MoveRight afterRotate

        // もう一度回転
        let finalModel = updateWithRandom random Rotate afterMove

        // Assert - エラーなく動作する
        finalModel.GameState |> should equal Playing
        finalModel.CurrentPair |> should not' (equal None)

    [<Fact>]
    let ``ぷよが積み上がった状態での移動と回転`` () =
        // Arrange
        let random = Random(42)

        // 左側に壁を作る
        let board =
            init().Board
            |> setCellColor 0 11 Red
            |> setCellColor 0 10 Blue
            |> setCellColor 0 9 Red
            |> setCellColor 1 11 Green

        let model =
            { init () with
                Board = board
                CurrentPair =
                    Some
                        { createPuyoPair Red Blue with
                            AxisPosition = { X = 1; Y = 8 }
                            ChildPosition = { X = 1; Y = 7 } }
                GameState = Playing }

        // Act - 左移動（壁に当たる）→ 回転 → 右移動
        let messages = [ MoveLeft; Rotate; MoveRight ]

        let finalModel = executeMessages random messages model

        // Assert - エラーなく動作
        finalModel.GameState |> should equal Playing
        finalModel.CurrentPair |> should not' (equal None)

    [<Fact>]
    let ``高速落下と通常落下を組み合わせた操作`` () =
        // Arrange
        let random = Random(42)

        let model =
            { init () with
                CurrentPair = Some(createPuyoPair Red Blue)
                GameState = Playing }

        // Act - 通常落下 → 高速落下を繰り返す
        let messages =
            [ Tick
              MoveDown
              MoveDown
              Tick
              MoveDown
              MoveDown
              MoveDown ]

        let finalModel = executeMessages random messages model

        // Assert
        // ぷよが固定されているか、まだ落下中
        finalModel.GameState |> should equal Playing

        // ボードまたはCurrentPairにぷよが存在する
        let hasPuyo =
            finalModel.CurrentPair.IsSome
            || ([ for x in 0..5 do
                     for y in 0..11 do
                         if getCellColor x y finalModel.Board <> Empty then
                             yield 1 ]
                |> List.length) > 0

        hasPuyo |> should equal true
