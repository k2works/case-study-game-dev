# Unity デバッグ UI セットアップ手順

このドキュメントでは、Unity Editor でぷよぷよのデバッグ UI を設定する手順を説明します。

## 前提条件

- Unity 2022.3.0f1 LTS がインストールされている
- プロジェクトが Unity Hub で開ける状態になっている

## セットアップ手順

### 1. Unity Editor でプロジェクトを開く

1. Unity Hub を起動
2. プロジェクト一覧から `csharp` プロジェクトを選択して開く

### 2. 新しいシーンを作成

1. メニューから `File` > `New Scene` を選択
2. `2D` テンプレートを選択
3. `Assets/Scenes` フォルダに `GameScene` という名前で保存

### 3. Canvas を作成

1. Hierarchy ウィンドウで右クリック > `UI` > `Canvas`
2. Canvas の Inspector で以下を設定：
   - Render Mode: `Screen Space - Overlay`
   - Canvas Scaler を追加（Add Component > Canvas Scaler）
     - UI Scale Mode: `Scale With Screen Size`
     - Reference Resolution: X=800, Y=600

### 4. GameController オブジェクトを作成

1. Hierarchy で空の GameObject を作成（右クリック > `Create Empty`）
2. 名前を `GameController` に変更
3. Inspector で `Add Component` をクリック
4. `GameController` スクリプトを検索して追加

### 5. BoardView オブジェクトを作成

1. Canvas の下に空の GameObject を作成（Canvas を右クリック > `Create Empty`）
2. 名前を `BoardView` に変更
3. RectTransform を設定：
   - Anchors: Top-Left
   - Position X: 50, Y: -50
4. `BoardView` スクリプトを追加

### 6. PairView オブジェクトを作成

1. Canvas の下に空の GameObject を作成
2. 名前を `PairView` に変更
3. RectTransform を設定：
   - Anchors: Top-Left
   - Position X: 50, Y: -50（BoardView と同じ位置）
4. `PairView` スクリプトを追加

### 7. GameController の参照を設定

1. Hierarchy で `GameController` を選択
2. Inspector の `GameController` コンポーネントで：
   - `Board View` フィールドに `BoardView` オブジェクトをドラッグ&ドロップ
   - `Pair View` フィールドに `PairView` オブジェクトをドラッグ&ドロップ
   - `Fall Interval` は 1.0（デフォルト値）のままでOK

### 8. シーンを保存して実行

1. `Ctrl+S` でシーンを保存
2. Play ボタン（▶）をクリックして実行

## 操作方法

- **左右移動**: 左右矢印キー
- **回転（左）**: Z キー
- **回転（右）**: X キー
- **高速落下**: 下矢印キー

## 確認事項

実行すると以下が表示されるはずです：

- 6列×12行のグリッド（暗い灰色）
- ランダムな色のぷよペア（中央上部）
- ぷよペアは自動的に落下
- キー入力で操作可能
- ボードに配置されたぷよは固定される

## トラブルシューティング

### 何も表示されない場合

1. Canvas が正しく作成されているか確認
2. GameController の参照が正しく設定されているか確認
3. Console ウィンドウでエラーを確認

### ぷよが表示されない場合

1. PairView と BoardView が Canvas の子になっているか確認
2. RectTransform の Position が適切か確認

### 操作できない場合

1. Game ビューにフォーカスがあるか確認（クリック）
2. Console でエラーがないか確認
