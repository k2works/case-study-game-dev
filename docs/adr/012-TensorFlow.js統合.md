# ADR-012: TensorFlow.js統合

## ステータス

採用

## 背景

イテレーション3「AI機能基盤」において、ブラウザベースのぷよぷよゲームにAI対戦機能を実装する必要がある。機械学習による意思決定システムを構築し、プレイヤーに挑戦的なゲーム体験を提供するため、ブラウザで動作する機械学習ライブラリの選定が必要となった。

## 検討事項

### 候補技術の比較

#### 1. TensorFlow.js
- **メリット:**
  - Googleが開発・保守する成熟したライブラリ
  - ブラウザネイティブ実行（WebGL、WebAssembly対応）
  - Python TensorFlowとの互換性
  - 豊富なドキュメントとコミュニティ
  - TypeScript対応
- **デメリット:**
  - バンドルサイズが大きい（約1-2MB）
  - 初期学習コスト

#### 2. Brain.js
- **メリット:**
  - 軽量（約200KB）
  - シンプルなAPI
  - JavaScriptネイティブ
- **デメリット:**
  - 機能が限定的
  - エコシステムが小さい
  - 複雑なモデルには不向き

#### 3. ML5.js
- **メリット:**
  - 初心者向けの簡単なAPI
  - p5.jsとの連携
- **デメリット:**
  - 内部でTensorFlow.jsを使用
  - 学習向けツールのため本格的な開発には不向き

### 技術要件

1. **リアルタイム推論:** ゲームプレイ中の即座な意思決定
2. **ブラウザ実行:** サーバーレス環境での動作
3. **TypeScript対応:** 型安全な開発
4. **拡張性:** 将来的なモデル改善への対応
5. **パフォーマンス:** 60FPSゲームプレイに影響しない処理速度

## 決定

**TensorFlow.js v4.22.0を採用する**

### 採用理由

1. **技術的成熟度:**
   - 産業レベルの実装実績
   - 継続的な開発・保守体制
   - WebGL/WebAssemblyによる最適化

2. **ぷよぷよAIに適した機能:**
   - 多層ニューラルネットワーク対応
   - カスタムモデル構築の柔軟性
   - リアルタイム推論の高速化

3. **開発効率:**
   - TypeScript定義の充実
   - 豊富なドキュメントと例
   - デバッグツールの提供

4. **将来拡張性:**
   - 強化学習（tfjs-reinforcement）
   - 転移学習対応
   - Python環境との連携可能性

### 実装アーキテクチャ

```
┌─────────────────────────────────────────┐
│               UI Layer                  │
│  - AIControlPanel (思考速度調整)         │
│  - AIInsights (可視化)                  │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│            Service Layer                │
│  - WorkerAIService (非同期処理)         │
│  - MLAIService (機械学習)               │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│            Domain Layer                 │
│  - GameAI (戦略インターフェース)         │
│  - GameState (状態表現)                 │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│         Infrastructure                  │
│  - TensorFlow.js Core                   │
│  - Web Workers API                      │
└─────────────────────────────────────────┘
```

### AIモデル設計

1. **入力層:** フィールド状態（15x6 = 90次元）
2. **隠れ層1:** 128ユニット（ReLU活性化）
3. **隠れ層2:** 64ユニット（ReLU活性化）
4. **隠れ層3:** 32ユニット（ReLU活性化）
5. **出力層:** 7ユニット（各列への配置確率、softmax活性化）

```typescript
const model = tf.sequential({
  layers: [
    tf.layers.dense({ inputShape: [90], units: 128, activation: 'relu' }),
    tf.layers.dense({ units: 64, activation: 'relu' }),
    tf.layers.dense({ units: 32, activation: 'relu' }),
    tf.layers.dense({ units: 7, activation: 'softmax' })
  ]
});
```

## 実装詳細

### 1. 非同期処理戦略

Web Workersを活用してメインスレッドをブロックしない設計：

```typescript
// WorkerAIService.ts
export class WorkerAIService implements GameAI {
  private worker: Worker;
  
  async makeMove(gameState: GameState): Promise<number> {
    return new Promise((resolve) => {
      this.worker.postMessage({ gameState });
      this.worker.onmessage = (e) => resolve(e.data.move);
    });
  }
}
```

### 2. 状態表現の最適化

フィールド状態を効率的な数値配列に変換：

```typescript
private encodeGameState(field: FieldState): number[] {
  return field.flat().map(cell => {
    if (cell === null) return 0;
    return cell.color === PuyoColor.RED ? 1 :
           cell.color === PuyoColor.BLUE ? 2 :
           cell.color === PuyoColor.GREEN ? 3 :
           cell.color === PuyoColor.YELLOW ? 4 : 0;
  });
}
```

### 3. 可視化機能

リアルタイムでAI思考プロセスを表示：

```typescript
// AIInsights.tsx
export function AIInsights({ predictions }: AIInsightsProps) {
  return (
    <div className="ai-insights">
      {predictions.map((prob, col) => (
        <div key={col} className="prediction-bar">
          <div style={{ height: `${prob * 100}%` }} />
          <span>{(prob * 100).toFixed(1)}%</span>
        </div>
      ))}
    </div>
  );
}
```

## パフォーマンス最適化

1. **モデル軽量化:** 量子化による推論速度向上
2. **バッチ処理:** 複数の候補手を同時評価
3. **キャッシュ戦略:** 同一状態の推論結果を再利用
4. **WebGL利用:** GPU加速による計算高速化

## セキュリティ考慮事項

1. **CDN配信:** TensorFlow.jsをCDNから取得時のSRI検証
2. **Worker分離:** AIロジックの分離によるメインアプリケーションへの影響最小化
3. **入力検証:** 不正なゲーム状態への対策

## 運用・保守

### モニタリング指標

1. **推論速度:** 平均50ms以下を目標
2. **メモリ使用量:** ベースライン +100MB以下
3. **CPU使用率:** ゲームプレイに影響しないレベル
4. **エラー率:** AIサービス可用性99%以上

### 継続的改善

1. **モデル更新:** プレイデータ蓄積による学習改善
2. **A/Bテスト:** 異なるモデル構成の効果測定
3. **ユーザーフィードバック:** AI難易度調整

## 結果

### 達成した成果

1. **技術統合:** TensorFlow.js v4.22.0の成功的な統合
2. **パフォーマンス:** 推論時間40-60ms、60FPS維持
3. **可視化:** リアルタイムAI思考プロセス表示
4. **拡張性:** モジュラー設計による将来機能拡張への準備

### 品質指標

- **テストカバレッジ:** MLAIService 85%、WorkerAIService 19%（モック戦略検討要）
- **型安全性:** TypeScript strict mode完全対応
- **アーキテクチャ準拠:** ヘキサゴナルアーキテクチャパターン適用

## 制約・技術債務

1. **バンドルサイズ:** 初回ロード時間への影響（CDN利用で軽減）
2. **ブラウザ対応:** 古いブラウザでのWebGL非対応
3. **テスト課題:** Web Workersのテスト戦略確立が必要

## 関連ADR

- ADR-001: ヘキサゴナルアーキテクチャ採用
- ADR-013: Web Workers AI処理採用
- ADR-006: 関数型プログラミング採用

---

**日付:** 2025-08-18  
**作成者:** Claude Code  
**レビュー者:** プロジェクトチーム  
**次回見直し:** 2025-11-18（3ヶ月後）