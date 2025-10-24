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

Task("Coverage")
    .Description("テストカバレッジを計測")
    .IsDependentOn("Build")
    .Does(() =>
{
    var coverageDirectory = Directory("./coverage");
    var coverageFile = coverageDirectory + File("coverage.cobertura.xml");

    // カバレッジディレクトリをクリーン
    if (DirectoryExists(coverageDirectory))
    {
        DeleteDirectory(coverageDirectory, new DeleteDirectorySettings {
            Recursive = true,
            Force = true
        });
    }

    CreateDirectory(coverageDirectory);

    // カバレッジ付きでテストを実行
    DotNetTest("./PuyoPuyoMAUI.sln", new DotNetTestSettings
    {
        Configuration = configuration,
        NoBuild = true,
        NoRestore = true,
        ArgumentCustomization = args => args
            .Append("/p:CollectCoverage=true")
            .Append("/p:CoverletOutputFormat=cobertura")
            .Append($"/p:CoverletOutput={MakeAbsolute(coverageDirectory)}/")
            .Append("/p:ExcludeByFile=\"**/Platforms/**/*\"")
    });

    Information($"カバレッジファイル: {coverageFile}");
    Information("テストカバレッジの計測が完了しました");
});

Task("Coverage-Report")
    .Description("テストカバレッジのHTMLレポートを生成")
    .IsDependentOn("Coverage")
    .Does(() =>
{
    var coverageDirectory = Directory("./coverage");
    var coverageFile = coverageDirectory + File("coverage.cobertura.xml");
    var reportDirectory = coverageDirectory + Directory("report");

    // ReportGenerator をインストール（グローバルツール）
    try
    {
        StartProcess("dotnet", new ProcessSettings {
            Arguments = new ProcessArgumentBuilder()
                .Append("tool")
                .Append("install")
                .Append("-g")
                .Append("dotnet-reportgenerator-globaltool")
        });
    }
    catch
    {
        Information("ReportGenerator already installed");
    }

    // レポート生成
    StartProcess("reportgenerator", new ProcessSettings {
        Arguments = new ProcessArgumentBuilder()
            .AppendQuoted($"-reports:{coverageFile}")
            .AppendQuoted($"-targetdir:{reportDirectory}")
            .Append("-reporttypes:Html")
    });

    Information($"カバレッジレポート: {reportDirectory}/index.html");
    Information("HTMLレポートの生成が完了しました");
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
