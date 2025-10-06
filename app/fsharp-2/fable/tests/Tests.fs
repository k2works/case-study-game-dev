// tests/Tests.fs
module PuyoPuyo.Tests

open Fable.Mocha

let allTests =
    testList "すべてのテスト" [
        PuyoPuyo.Tests.GameTests.tests
        PuyoPuyo.Tests.PlayerTests.tests
    ]

[<EntryPoint>]
let main args =
    Mocha.runTests allTests
