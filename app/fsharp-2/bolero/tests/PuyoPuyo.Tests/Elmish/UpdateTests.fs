namespace PuyoPuyo.Tests.Elmish

open Xunit
open FsUnit.Xunit
open PuyoPuyo.Elmish
open PuyoPuyo.Domain

module UpdateTests =

    [<Fact>]
    let ``MoveLeftメッセージでぷよが左に移動する`` () =
        // Arrange
        let model = Model.init ()
        let pair = PuyoPair.create 3 1 Red Green 0
        let model = { model with CurrentPiece = Some pair; Status = Playing }

        // Act
        let (newModel, _) = Update.update MoveLeft model

        // Assert
        match newModel.CurrentPiece with
        | Some newPair ->
            newPair.X |> should equal 2
        | None ->
            failwith "ぷよが存在するはずです"

    [<Fact>]
    let ``MoveRightメッセージでぷよが右に移動する`` () =
        // Arrange
        let model = Model.init ()
        let pair = PuyoPair.create 2 1 Red Green 0
        let model = { model with CurrentPiece = Some pair; Status = Playing }

        // Act
        let (newModel, _) = Update.update MoveRight model

        // Assert
        match newModel.CurrentPiece with
        | Some newPair ->
            newPair.X |> should equal 3
        | None ->
            failwith "ぷよが存在するはずです"

    [<Fact>]
    let ``左端では左に移動できない`` () =
        // Arrange
        let model = Model.init ()
        let pair = PuyoPair.create 0 1 Red Green 0
        let model = { model with CurrentPiece = Some pair; Status = Playing }

        // Act
        let (newModel, _) = Update.update MoveLeft model

        // Assert
        match newModel.CurrentPiece with
        | Some newPair ->
            newPair.X |> should equal 0  // 位置が変わらない
        | None ->
            failwith "ぷよが存在するはずです"

    [<Fact>]
    let ``ゲーム中でない場合は移動できない`` () =
        // Arrange
        let model = Model.init ()
        let pair = PuyoPair.create 2 1 Red Green 0
        let model = { model with CurrentPiece = Some pair; Status = NotStarted }

        // Act
        let (newModel, _) = Update.update MoveLeft model

        // Assert
        match newModel.CurrentPiece with
        | Some newPair ->
            newPair.X |> should equal 2  // 位置が変わらない
        | None ->
            failwith "ぷよが存在するはずです"
