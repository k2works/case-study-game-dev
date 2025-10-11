open System.IO
open System.Text.RegularExpressions

let filePath =
    @"C:\Users\PC202411-1\RiderProjects\case-study-game-dev\app\fsharp-3\bolero\tests\PuyoPuyo.Tests\Domain\盤面テスト.fs"

let mutable content = File.ReadAllText(filePath)

// セル設定とセル取得の呼び出しを測定単位型に変換
// パターン: 盤面.セル設定 盤 数字 数字 -> 盤面.セル設定 盤 数字<列> 数字<行>
let pattern1 = @"盤面\.セル設定\s+(\S+)\s+(\d+)\s+(\d+)"
let replacement1 = "盤面.セル設定 $1 $2<列> $3<行>"
content <- Regex.Replace(content, pattern1, replacement1)

// パターン: 盤面.セル取得 盤 数字 数字 -> 盤面.セル取得 盤 数字<列> 数字<行>
let pattern2 = @"盤面\.セル取得\s+(\S+)\s+(\d+)\s+(\d+)"
let replacement2 = "盤面.セル取得 $1 $2<列> $3<行>"
content <- Regex.Replace(content, pattern2, replacement2)

// ぷよ消去のリストのタプルを測定単位型に変換
// パターン: (数字, 数字) -> (数字<列>, 数字<行>)
let pattern3 = @"\((\d+),\s*(\d+)\)"
let replacement3 = "($1<列>, $2<行>)"
content <- Regex.Replace(content, pattern3, replacement3)

// forループの範囲も修正が必要
// for 行 in 0 .. _盤面.行数 - 1 -> for 行 in 0 .. (int _盤面.行数) - 1
let pattern4 = @"for\s+行\s+in\s+0\s+\.\.\s+_盤面\.行数\s+-\s+1"
let replacement4 = "for 行 in 0 .. (int _盤面.行数) - 1"
content <- Regex.Replace(content, pattern4, replacement4)

let pattern5 = @"for\s+列\s+in\s+0\s+\.\.\s+_盤面\.列数\s+-\s+1"
let replacement5 = "for 列 in 0 .. (int _盤面.列数) - 1"
content <- Regex.Replace(content, pattern5, replacement5)

// 最後のforループ（統合テスト）も修正
content <- Regex.Replace(content, @"for\s+行\s+in\s+0\.\.(\d+)", "for 行 in 0..$1")
content <- Regex.Replace(content, @"for\s+列\s+in\s+0\.\.(\d+)", "for 列 in 0..$1")

// セル取得の部分で変数を使っている場合を修正（変数名だけの場合）
// 盤面.セル取得 _盤面 列 行 の形式はそのまま（列と行が測定単位型の変数の場合）
// しかし数値リテラルの場合は測定単位が必要

File.WriteAllText(filePath, content)
printfn "File updated successfully!"
