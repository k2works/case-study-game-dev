module Tests

open System
open Xunit
open FsUnit.Xunit

// イテレーション1: ゲーム開始の実装

module ``ゲーム初期化`` =
    [<Fact>]
    let ``初期化時にボードが空である`` () =
        // Arrange & Act
        let model = Game.init ()

        // Assert
        model.Board |> should equal (Array2D.create 6 12 Game.Empty)

    [<Fact>]
    let ``初期化時にスコアが0である`` () =
        // Arrange & Act
        let model = Game.init ()

        // Assert
        model.Score |> should equal 0

    [<Fact>]
    let ``初期化時にゲーム状態がPlaying`` () =
        // Arrange & Act
        let model = Game.init ()

        // Assert
        model.GameState |> should equal Game.Playing

module ``ぷよペア生成`` =
    [<Fact>]
    let ``generatePuyoPairは2つのぷよを含むペアを生成する`` () =
        // Arrange
        let random = System.Random(42)

        // Act
        let pair = Game.generatePuyoPair random

        // Assert
        pair.Axis |> should not' (equal Game.Empty)
        pair.Child |> should not' (equal Game.Empty)

    [<Fact>]
    let ``generatePuyoPairは初期位置を設定する`` () =
        // Arrange
        let random = System.Random(42)

        // Act
        let pair = Game.generatePuyoPair random

        // Assert
        pair.AxisPosition.X |> should equal 2
        pair.AxisPosition.Y |> should equal 0
        pair.ChildPosition.X |> should equal 2
        pair.ChildPosition.Y |> should equal -1

    [<Fact>]
    let ``generatePuyoPairは回転方向を0に設定する`` () =
        // Arrange
        let random = System.Random(42)

        // Act
        let pair = Game.generatePuyoPair random

        // Assert
        pair.Rotation |> should equal 0

module ``ゲームループ`` =
    [<Fact>]
    let ``StartGameメッセージで新しいぷよペアが生成される`` () =
        // Arrange
        let model = Game.init ()
        let random = System.Random(42)

        // Act
        let newModel = Game.updateWithRandom random Game.StartGame model

        // Assert
        newModel.CurrentPair |> should not' (equal None)

    [<Fact>]
    let ``Tickメッセージでゲーム状態が更新される`` () =
        // Arrange
        let random = System.Random(42)
        let model = { Game.init () with CurrentPair = Some(Game.generatePuyoPair random) }

        // Act
        let newModel = Game.updateWithRandom random Game.Tick model

        // Assert
        // Tick処理が実行されること（現時点では状態が保持されることを確認）
        newModel.GameState |> should equal Game.Playing

module ``ぷよ表示`` =
    [<Fact>]
    let ``getCellColorは指定位置のぷよ色を返す`` () =
        // Arrange
        let model = Game.init ()
        let model = { model with Board = Array2D.create 6 12 Game.Empty }
        // ボードの(1, 2)に赤いぷよを配置
        model.Board.[1, 2] <- Game.Red

        // Act
        let color = Game.getCellColor 1 2 model

        // Assert
        color |> should equal Game.Red

    [<Fact>]
    let ``getCellColorは空のセルでEmptyを返す`` () =
        // Arrange
        let model = Game.init ()

        // Act
        let color = Game.getCellColor 0 0 model

        // Assert
        color |> should equal Game.Empty

    [<Fact>]
    let ``getCurrentPairPuyosはぷよペアの位置と色を返す`` () =
        // Arrange
        let random = System.Random(42)
        let model = Game.init ()
        let model = { model with CurrentPair = Some(Game.generatePuyoPair random) }

        // Act
        let puyos = Game.getCurrentPairPuyos model

        // Assert
        puyos |> List.length |> should equal 2
