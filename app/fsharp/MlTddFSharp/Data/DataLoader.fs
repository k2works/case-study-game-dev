namespace MlTddFSharp.Data

open System
open System.IO
open Deedle

type DataLoader() =
    /// CSV ファイルを読み込む（例外を投げる）
    member this.LoadCsv(filePath: string) =
        if String.IsNullOrEmpty(filePath) then
            invalidArg "filePath" "ファイルパスが空です"

        if not (File.Exists(filePath)) then
            raise (FileNotFoundException($"ファイルが見つかりません: {filePath}"))

        Frame.ReadCsv(filePath)

    /// CSV ファイルを安全に読み込む（Result 型を返す）
    member this.TryLoadCsv(filePath: string) =
        try
            if String.IsNullOrEmpty(filePath) then
                Result.Error "ファイルパスが空です"
            elif not (File.Exists(filePath)) then
                Result.Error $"ファイルが見つかりません: {filePath}"
            else
                let frame = Frame.ReadCsv(filePath)
                Result.Ok frame
        with ex ->
            Result.Error $"ファイル読み込みエラー: {ex.Message}"
