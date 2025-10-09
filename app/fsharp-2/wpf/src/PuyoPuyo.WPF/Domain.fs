namespace PuyoPuyo

open Elmish

/// <summary>
/// Domain module
/// </summary>
module Domain =
    /// <summary>
    /// Model
    /// </summary>
    type Model = { Message: string }

    /// <summary>
    /// Message
    /// </summary>
    type Message = unit

    /// <summary>
    /// Initialize the model
    /// </summary>
    let init () = { Message = "ぷよぷよゲーム" }

    /// <summary>
    /// Update the model
    /// </summary>
    let update msg model = model
