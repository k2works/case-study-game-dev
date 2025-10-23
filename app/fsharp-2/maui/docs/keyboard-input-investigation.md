# キーボード入力対応の調査結果

## 日付
2025-10-23

## 調査目的
デスクトップ版（Windows/MacCatalyst）でキーボード操作（矢印キー）によるぷよの移動を実装する

## 調査結果

### 試したアプローチ

#### 1. KeyboardAccelerator（.NET MAUI標準機能）
**結果**: 失敗

**理由**:
- KeyboardAcceleratorはContentPageレベルで設定可能だが、Fabulousの宣言的UIモデルとの統合が困難
- `.onCreated()` や `.reference()` などのライフサイクルメソッドがFabulous.MauiControlsでサポートされていない
- `Page.KeyboardAccelerators`コレクションへのアクセスがFabulousのウィジェットシステムから直接できない

**エラー例**:
```
error FS0039: 型 'WidgetBuilder<_,_>' は、フィールド、コンストラクター、またはメンバー 'onCreated' を定義していません。
error FS0039: 型 'ContentPage' は、フィールド、コンストラクター、またはメンバー 'KeyboardAccelerators' を定義していません。
```

#### 2. Fabulous Subscription
**結果**: 失敗

**理由**:
- `Program.withSubscription`の型シグネチャが期待する形式と異なる
- `KeyboardAccelerator`を動的に設定するためにはApplication.Current.MainPageへのアクセスが必要だが、MainPageプロパティは非推奨（Deprecated）
- Subscriptionの返り値として`IDisposable`が必要だが、型の不一致エラーが発生

**エラー例**:
```
warning FS0044: This property has been deprecated. For single-window applications, use Windows[0].Page.
error FS0001: この式に必要な型は 'Cmd<Msg>' ですが、ここでは次の型が指定されています '(Msg -> unit) -> System.IDisposable'
```

### 技術的な制約

1. **Fabulous.MauiControlsのドキュメント不足**
   - 公式ドキュメント（docs.fabulous.dev）にキーボード入力の実装例なし
   - GitHubのサンプルにもキーボード対応の例が見当たらない

2. **MVUアーキテクチャとの統合の難しさ**
   - Fabulousは宣言的UIを採用しており、命令的なイベント処理との統合が困難
   - ネイティブのMAUIコントロールに直接アクセスする方法が限定的

3. **プラットフォーム固有の制約**
   - KeyboardAcceleratorはWindows/MacCatalystのみサポート
   - Androidでは別のアプローチが必要

### 実装可能な代替案

#### A. MessagingCenter + プラットフォーム固有コード
**複雑度**: 中〜高

**概要**:
- `Platforms/Windows/App.fs`でWindowのKeyDownイベントをハンドル
- MessagingCenterでFabulous MVUにメッセージを送信
- プラットフォーム間のメッセージングが必要

**メリット**:
- ネイティブのイベント処理を利用可能
- プラットフォーム固有の最適化が可能

**デメリット**:
- コード量が多い
- プラットフォーム間の一貫性維持が必要
- デバッグが複雑

#### B. 現状のボタン操作を維持（採用）
**複雑度**: なし（実装済み）

**概要**:
- デスクトップでもボタンクリックで操作
- 左右矢印ボタンでぷよを移動

**メリット**:
- 実装済みで動作確認済み
- すべてのプラットフォームで一貫した操作
- シンプルで保守しやすい
- モバイル版との操作性の統一

**デメリット**:
- デスクトップでのキーボード操作ができない

#### C. カスタムハンドラーの実装
**複雑度**: 高

**概要**:
- .NET MAUIのカスタムハンドラーを作成
- プラットフォーム固有のキーボード処理を実装

**メリット**:
- 完全なコントロール
- パフォーマンス最適化が可能

**デメリット**:
- 実装とテストに時間がかかる
- 各プラットフォームごとの実装が必要
- .NET MAUIの深い知識が必要

## 結論

**採用した方針**: B（現状のボタン操作を維持）

**理由**:
1. コストパフォーマンス: 既に実装済みで追加コストなし
2. 一貫性: モバイルとデスクトップで同じ操作性
3. 保守性: シンプルなコードで将来の変更が容易
4. ユーザビリティ: ボタン操作でも十分快適に遊べる

## 将来の検討事項

### Fabulousコミュニティへの問い合わせ
- Discord: https://discord.gg/bpTJMbSSYK
- GitHub Discussions: https://github.com/fabulous-dev/Fabulous.MauiControls/discussions

### 追跡する技術動向
- Fabulous.MauiControlsの新バージョンでのキーボード対応サポート
- .NET MAUI 9.x以降でのKeyboardAccelerator機能拡張
- Fabulousコミュニティからのベストプラクティスの共有

## 参考資料

1. [.NET MAUI Keyboard Accelerators](https://learn.microsoft.com/en-us/dotnet/maui/user-interface/keyboard-accelerators)
2. [Fabulous Documentation](https://docs.fabulous.dev/)
3. [Fabulous.MauiControls GitHub](https://github.com/fabulous-dev/Fabulous.MauiControls)
4. [Stack Overflow: F# Fabulous external event subscription](https://stackoverflow.com/questions/59328062/f-fabulous-xamarin-external-event-subscription)
