# ぷよぷよゲーム - Elm 実装

The Elm Architecture を使用したぷよぷよゲームの実装です。

## 特徴

- **実行時エラーなし**: Elm の強力な型システムによる保証
- **The Elm Architecture**: Model-View-Update パターンによる予測可能な状態管理
- **純粋関数型プログラミング**: 不変性と純粋関数による保守性の向上
- **優れた開発体験**: 親切なコンパイラエラーメッセージ

## プロジェクト構成

```
app/elm/
├── src/
│   ├── Main.elm                # エントリーポイント
│   ├── Types.elm               # 型定義
│   ├── Board.elm               # ボード管理
│   ├── Puyo.elm                # ぷよ管理
│   ├── GameLogic.elm           # ゲームロジック
│   ├── View/
│   │   ├── Board.elm           # ボード描画
│   │   └── GameInfo.elm        # ゲーム情報表示
│   └── Update/
│       └── Messages.elm        # メッセージ定義
├── public/
│   └── index.html              # HTML エントリーポイント
├── dist/
│   └── main.js                 # ビルド済み JavaScript
└── elm.json                    # Elm プロジェクト設定
```

## セットアップ

### 前提条件

- Node.js（npm が使用可能）
- Elm 0.19.1 以降

### インストール

```bash
# Elm ツールのインストール（初回のみ）
npm install -g elm elm-test elm-format

# プロジェクトのセットアップ
cd app/elm
elm install
npm install
```

## ビルドと実行

### 開発ビルド

```bash
npm run build
```

### 最適化ビルド

```bash
npm run build:opt
```

### 開発サーバー起動

```bash
npm run dev
```

ブラウザで `http://localhost:8080` を開いてゲームをプレイできます。

## ゲーム仕様

- **ボードサイズ**: 8×12 マス（幅 8、高さ 12）
- **ぷよの色**: 5 色（赤、緑、青、黄、紫）
- **消去ルール**: 同色 4 つ以上の接続で消去
- **連鎖システム**: 消去後の落下により新たな接続が形成される
- **スコアリング**: 基本スコア + 連鎖ボーナス + 全消しボーナス

## 操作方法

- `←` `→` : 左右移動
- `↓` : 高速落下
- `↑` : 回転
- `スペース` : ハードドロップ

## 技術スタック

- **Elm 0.19.1**: 純粋関数型言語
- **elm/browser**: ブラウザアプリケーション
- **elm/html**: HTML 生成
- **elm/time**: タイマー処理
- **elm/random**: ランダム生成

## 開発プロセス

このプロジェクトは TDD（テスト駆動開発）に基づいて開発されました：

1. Phase 1: ドメインモデル（型定義、ボード、組ぷよ）
2. Phase 2: ゲームロジック（移動、重力、消去システム）
3. Phase 3: The Elm Architecture 統合（Model、Update）
4. Phase 4: View レイヤー（ボード描画、ゲーム情報表示）
5. Phase 5: インタラクション（キーボード入力）

## The Elm Architecture

このプロジェクトは The Elm Architecture（TEA）パターンに従っています：

- **Model**: アプリケーションの状態
- **Update**: メッセージに応じて状態を更新
- **View**: 状態を HTML に変換
- **Subscriptions**: 時間やキーボードなどの外部イベント

## ライセンス

MIT
