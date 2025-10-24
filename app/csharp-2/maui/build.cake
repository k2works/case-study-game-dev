///////////////////////////////////////////////////////////////////////////////
// ARGUMENTS
///////////////////////////////////////////////////////////////////////////////

var target = Argument("target", "Default");
var configuration = Argument("configuration", "Debug");

///////////////////////////////////////////////////////////////////////////////
// SETUP / TEARDOWN
///////////////////////////////////////////////////////////////////////////////

Setup(ctx =>
{
    Information("Running tasks...");
    Information($"Target: {target}");
    Information($"Configuration: {configuration}");
});

Teardown(ctx =>
{
    Information("Finished running tasks.");
});

///////////////////////////////////////////////////////////////////////////////
// TASKS
///////////////////////////////////////////////////////////////////////////////

Task("Clean")
    .Description("クリーン（ビルド成果物を削除）")
    .Does(() =>
{
    DotNetClean("./PuyoPuyoMAUI.sln");

    var directories = new[] {
        "./PuyoPuyoMAUI/bin",
        "./PuyoPuyoMAUI/obj",
        "./PuyoPuyoMAUI.Core/bin",
        "./PuyoPuyoMAUI.Core/obj",
        "./PuyoPuyoMAUI.Tests/bin",
        "./PuyoPuyoMAUI.Tests/obj"
    };

    foreach(var dir in directories)
    {
        if (DirectoryExists(dir))
        {
            DeleteDirectory(dir, new DeleteDirectorySettings {
                Recursive = true,
                Force = true
            });
        }
    }

    Information("クリーンが完了しました");
});

Task("Restore")
    .Description("パッケージを復元")
    .Does(() =>
{
    DotNetRestore("./PuyoPuyoMAUI.sln");
    Information("パッケージの復元が完了しました");
});

Task("Build")
    .Description("プロジェクトをビルド")
    .IsDependentOn("Restore")
    .Does(() =>
{
    DotNetBuild("./PuyoPuyoMAUI.sln", new DotNetBuildSettings
    {
        Configuration = configuration,
        NoRestore = true
    });
    Information("ビルドが完了しました");
});

Task("Test")
    .Description("テストを実行")
    .IsDependentOn("Build")
    .Does(() =>
{
    DotNetTest("./PuyoPuyoMAUI.sln", new DotNetTestSettings
    {
        Configuration = configuration,
        NoBuild = true,
        NoRestore = true
    });
    Information("テストが完了しました");
});

Task("Format")
    .Description("コードを自動フォーマット")
    .Does(() =>
{
    DotNetFormat("./PuyoPuyoMAUI.sln");
    Information("フォーマットが完了しました");
});

Task("Lint")
    .Description("静的解析を実行（警告をエラーとして扱う）")
    .IsDependentOn("Restore")
    .Does(() =>
{
    DotNetBuild("./PuyoPuyoMAUI.sln", new DotNetBuildSettings
    {
        Configuration = configuration,
        NoRestore = true,
        MSBuildSettings = new DotNetMSBuildSettings()
            .WithProperty("TreatWarningsAsErrors", "true")
    });
    Information("静的解析が完了しました");
});

Task("Setup")
    .Description("初回セットアップ（復元＋ビルド＋テスト）")
    .IsDependentOn("Restore")
    .IsDependentOn("Build")
    .IsDependentOn("Test")
    .Does(() =>
{
    Information("セットアップが完了しました");
});

Task("Check")
    .Description("フォーマット＋Lint＋テスト")
    .IsDependentOn("Format")
    .IsDependentOn("Lint")
    .IsDependentOn("Test")
    .Does(() =>
{
    Information("すべてのチェックが完了しました");
});

Task("Default")
    .Description("デフォルトタスク（ビルド）")
    .IsDependentOn("Build");

///////////////////////////////////////////////////////////////////////////////
// EXECUTION
///////////////////////////////////////////////////////////////////////////////

RunTarget(target);
