// build.cake

///////////////////////////////////////////////////////////////////////////////
// 引数
///////////////////////////////////////////////////////////////////////////////

var target = Argument("target", "Default");
var configuration = Argument("configuration", "Release");

///////////////////////////////////////////////////////////////////////////////
// タスク定義
///////////////////////////////////////////////////////////////////////////////

Task("Clean")
    .Does(() =>
{
    DotNetClean("./PuyoPuyo.sln");
    CleanDirectories("./src/**/bin");
    CleanDirectories("./src/**/obj");
    CleanDirectories("./tests/**/bin");
    CleanDirectories("./tests/**/obj");
});

Task("Restore")
    .IsDependentOn("Clean")
    .Does(() =>
{
    DotNetRestore("./PuyoPuyo.sln");
});

Task("Build")
    .IsDependentOn("Restore")
    .Does(() =>
{
    DotNetBuild("./PuyoPuyo.sln", new DotNetBuildSettings
    {
        Configuration = configuration,
        NoRestore = true
    });
});

Task("Test")
    .IsDependentOn("Build")
    .Does(() =>
{
    DotNetTest("./PuyoPuyo.sln", new DotNetTestSettings
    {
        Configuration = configuration,
        NoBuild = true,
        NoRestore = true
    });
});

Task("Run")
    .Does(() =>
{
    DotNetRun("./src/PuyoPuyo.WPF/PuyoPuyo.WPF.csproj");
});

Task("Coverage")
    .Description("テストカバレッジを測定")
    .IsDependentOn("Build")
    .Does(() =>
{
    DotNetTest("./PuyoPuyo.sln", new DotNetTestSettings
    {
        Configuration = configuration,
        NoBuild = true,
        NoRestore = true,
        ArgumentCustomization = args => args
            .Append("/p:CollectCoverage=true")
            .Append("/p:CoverletOutputFormat=opencover")
            .Append("/p:CoverletOutput=./coverage/")
    });

    Information("カバレッジレポート: ./tests/PuyoPuyo.Tests/coverage/coverage.opencover.xml");
});

Task("Publish")
    .Description("アプリケーションを公開")
    .IsDependentOn("Test")
    .Does(() =>
{
    var publishDir = "./publish";

    // 公開ディレクトリをクリーン
    CleanDirectory(publishDir);

    // Windows x64向けに公開
    DotNetPublish("./src/PuyoPuyo.WPF/PuyoPuyo.WPF.csproj", new DotNetPublishSettings
    {
        Configuration = configuration,
        Runtime = "win-x64",
        SelfContained = true,
        PublishSingleFile = true,
        PublishTrimmed = false,
        OutputDirectory = $"{publishDir}/win-x64"
    });

    Information($"公開完了: {publishDir}/win-x64");
});

Task("Package")
    .Description("リリースパッケージを作成")
    .IsDependentOn("Publish")
    .Does(() =>
{
    var version = "1.0.0";
    var publishDir = "./publish";
    var packageDir = "./packages";

    // パッケージディレクトリを作成
    EnsureDirectoryExists(packageDir);

    // ZIPファイルを作成
    var zipFile = $"{packageDir}/PuyoPuyo-{version}-win-x64.zip";
    Zip($"{publishDir}/win-x64", zipFile);

    Information($"パッケージ作成完了: {zipFile}");
});

Task("Format")
    .Description("コードフォーマット")
    .Does(() =>
{
    StartProcess("dotnet", new ProcessSettings
    {
        Arguments = "format PuyoPuyo.sln"
    });
});

Task("Lint")
    .Description("静的コード解析")
    .IsDependentOn("Build")
    .Does(() =>
{
    Information("静的コード解析を実行中...");
    // Microsoft.CodeAnalysis.Analyzers はビルド時に自動実行される
    Information("静的コード解析完了");
});

Task("Watch")
    .Description("ファイル変更を監視して自動テスト")
    .Does(() =>
{
    Information("ファイル監視モードを開始...");
    Information("ファイルが変更されるたびにテストが自動実行されます");
    Information("終了するには Ctrl+C を押してください");

    StartProcess("dotnet", new ProcessSettings
    {
        Arguments = "watch --project tests/PuyoPuyo.Tests/PuyoPuyo.Tests.csproj test"
    });
});

///////////////////////////////////////////////////////////////////////////////
// ターゲット
///////////////////////////////////////////////////////////////////////////////

Task("Default")
    .IsDependentOn("Test");

Task("All")
    .Description("全ての品質チェック")
    .IsDependentOn("Format")
    .IsDependentOn("Lint")
    .IsDependentOn("Test")
    .IsDependentOn("Coverage");

Task("CI")
    .Description("CI環境での完全なビルドとテスト")
    .IsDependentOn("Clean")
    .IsDependentOn("Test")
    .IsDependentOn("Coverage");

Task("Release")
    .Description("リリースビルドとパッケージング")
    .IsDependentOn("CI")
    .IsDependentOn("Package");

///////////////////////////////////////////////////////////////////////////////
// 実行
///////////////////////////////////////////////////////////////////////////////

RunTarget(target);
