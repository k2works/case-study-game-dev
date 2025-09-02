# まずこれを読もうリスト

🎮 **[デモプレイ](https://case-study-game-dev-5ltf-8ddyehu9n-k2works-projects.vercel.app/)**


## 🚀 プロジェクト概要・戦略的決定

### 🎯 プロジェクトのゴール
**AI搭載ぷよぷよゲーム**の開発により、従来のゲーム実装との差別化を図り、最新のWeb技術（TensorFlow.js）を活用したユニークなゲーム体験を提供する。

### 🔥 重要な戦略的転換
- **AI機能を低優先度から高優先度に格上げ**
- **MVP直後（v1.1）でAI自動プレイ機能を投入**
- **v1.2でAI学習システムを実装し継続的性能向上を実現**

### ⚡ 技術的ハイライト
- **関数型プログラミング**: Lodash/fpによるイミュータブル設計
- **TDD + AI/ML**: VitestとProperty-Based Testing
- **ヘキサゴナルアーキテクチャ**: AI機能統合に対応したクリーンアーキテクチャ

## 🎯 Phase 1 要件・設計ドキュメント

### 📋 要件定義
- [リリース計画](./requirements/リリース計画.md) - **🔥 AI機能をMVP直後に投入する戦略的リリース計画**。v1.1でAI機能、v1.2でAI学習システムを実装。
- [仕様](./requirements/仕様.md) - システムの要件をまとめる。ユーザーの視点からシステムが何をするかを理解するために必要。
- [ユーザーストーリー](./requirements/ユーザーストーリー.md) - **🤖 エピック2「AIによるオートプレイ」を高優先度に格上げ**。AI自動プレイ・分析・戦略機能を定義。
- [ユースケース](./requirements/ユースケース.md) - システムの機能を表す。システムが何をするかを理解するのに必要。
- [テスト戦略](./requirements/テスト戦略.md) - **🧪 AI・機械学習層テストを含むTDD開発サイクル**。Vitest + React Testing Libraryでの包括的テスト戦略。
- [非機能要件](./requirements/非機能要件.md) - パフォーマンス、セキュリティ、可用性などの非機能要件を定義。
- [運用要件](./requirements/運用要件.md) - CI/CD、監視、運用手順などの運用要件を定義。
- [技術スタック](./requirements/技術スタック.md) - **🚀 TensorFlow.js統合済み技術構成**。React + TypeScript + AI/MLライブラリの統合スタック。

### 🏗️ 設計仕様
- [アーキテクチャ設計](./design/アーキテクチャ設計.md) - **⚡ ヘキサゴナルアーキテクチャ**によるシステム設計。AI機能統合に対応した全体像。
- [データモデル設計](./design/データモデル設計.md) - **🔧 関数型プログラミング対応**。イミュータブルデータ構造と純粋関数による設計。
- [ドメインモデル設計](./design/ドメインモデル設計.md) - **🎯 DDD戦術的パターン**によるドメインモデルとユビキタス言語の定義。
- [ユーザーインターフェース設計](./design/ユーザーインターフェース設計.md) - **🎨 AI思考可視化UI**を含むUI/UXデザインとレスポンシブ対応。
- [実装戦略](./design/実装戦略.md) - **⚙️ 関数型 + TDD開発フロー**。Lodash/fpを活用した段階的実装アプローチ。

### 📝 アーキテクチャ決定記録
- [ADR一覧](./adr/index.md) - **📚 13個の重要な技術・戦略決定**を記録。TensorFlow.js統合・Web Workers AI処理を含む全体戦略。（Phase 1-3で全ADR実装完了✅）

#### アーキテクチャ・設計
  - [ADR-001: アーキテクチャ選定](./adr/001-アーキテクチャ選定.md) - ヘキサゴナルアーキテクチャ採用の決定
  - [ADR-003: ドメイン駆動設計採用](./adr/003-ドメイン駆動設計採用.md) - DDD戦術的パターンの採用
  - [ADR-011: ヘキサゴナルアーキテクチャリファクタリング](./adr/011-ヘキサゴナルアーキテクチャリファクタリング.md) - アーキテクチャ完全準拠への改善

#### 技術スタック
  - [ADR-002: フロントエンド技術スタック選定](./adr/002-フロントエンド技術スタック選定.md) - React + TypeScript構成の選定
  - [ADR-012: TensorFlow.js統合](./adr/012-TensorFlow.js統合.md) - **🤖 AI思考エンジン統合決定**
  - [ADR-013: Web Workers AI処理](./adr/013-Web Workers AI処理.md) - **⚡ 非同期AI処理基盤決定**

#### 開発プロセス・手法
  - [ADR-004: TDD開発手法採用](./adr/004-TDD開発手法採用.md) - テスト駆動開発手法の採用
  - [ADR-006: 関数型プログラミング採用](./adr/006-関数型プログラミング採用.md) - 関数型プログラミングパラダイムの採用
  - [ADR-007: テストライブラリ変更](./adr/007-テストライブラリ変更.md) - **🔄 Vitest + React Testing Library採用**

#### 品質管理・アーキテクチャ検証
  - [ADR-008: サイクロマティック複雑度制限](./adr/008-サイクロマティック複雑度制限.md) - 複雑度制限による品質管理
  - [ADR-009: dependency-cruiser採用](./adr/009-dependency-cruiser採用.md) - アーキテクチャルール検証
  - [ADR-010: Codecov採用](./adr/010-Codecov採用.md) - コード品質管理サービス採用

#### インフラ・運用
  - [ADR-005: Vercelデプロイメント採用](./adr/005-Vercelデプロイメント採用.md) - Vercelホスティング戦略

## 🚀 Phase 2-3実績・完了
- [開発ドキュメント](./development) - **✅ イテレーション5完了実績**を含む開発手順とガイドライン。mayah AI評価システムの実装完了。
  - [イテレーション5完了報告書](./development/iteration-5-completion-report.md) - **🤖 mayah AI評価システム実装完了**の詳細実績
  - [イテレーション5ふりかえり](./development/iteration-5-retrospective.md) - **⚡ 3つのAI評価サービス実装**のKPT分析
  - [イテレーション4完了報告書](./development/iteration-4-completion-report.md) - **📊 AI分析・戦略機能実装完了**の詳細実績
  - [イテレーション4ふりかえり](./development/iteration-4-retrospective.md) - **🎯 mayah AI設計拡張**のKPT分析
  - [イテレーション3完了報告書](./development/iteration-3-completion-report.md) - **🤖 AI機能基盤実装完了**の詳細実績
  - [イテレーション3ふりかえり](./development/iteration-3-retrospective.md) - **⚡ TensorFlow.js・Web Workers統合**のKPT分析
  - [イテレーション2完了報告書](./development/iteration-2-completion-report.md) - **🎯 テストカバレッジ91.18%達成**の詳細実績
  - [イテレーション2ふりかえり](./development/iteration-2-retrospective.md) - **🚀 目標超過達成（91.18%）**のKPT分析
  - [イテレーション1完了報告書](./development/iteration1-completion-report.md) - 予定より3日早期完了の詳細実績
  - [イテレーション1ふりかえり](./development/iteration1-retrospective.md) - KPT方式による改善点抽出
- [運用ドキュメント](./operation) - **✅ 運用基盤構築完了**。CI/CD・品質管理・自動テスト体制確立。AI処理監視体制追加。
- [日誌](./journal) - **📊 開発履歴記録**。Phase 1-3の実装軌跡とベストプラクティス蓄積。

## 🎮 開発ロードマップ

### v1.0 (MVP) - 基本ゲーム
- ✅ **イテレーション1完了（2025-08-13）**: 基本ゲームプレイ機能
- ✅ **イテレーション2完了（2025-01-16）**: テストカバレッジ91.18%達成
- ✅ 関数型プログラミング基盤
- ✅ TDD開発サイクル確立
- ✅ 高品質コードベース確立（91.18%カバレッジ）

### v1.1 (AI機能追加) - 戦略的投入
- ✅ **🤖 AI自動プレイ機能**（基盤完成）
  * TensorFlow.js 4層ニューラルネットワーク
  * Web Workers非同期処理
  * AIControlPanel（思考速度調整）
  * AIInsights（リアルタイム可視化）
- ✅ **📊 AIパフォーマンス分析**（完成）
  * PerformanceAnalysisService実装
  * セッションデータ記録・統計収集
  * 人間プレイヤー比較機能
- ✅ **⚙️ AI戦略設定**（完成）
  * 複数AI戦略（攻撃型、防御型、連鎖重視）
  * StrategySettings UI実装
  * 戦略保存・読み込み機能

### v1.2 (mayah AI評価システム) - 完了実績 ✅
- ✅ **🧠 mayah AI 4要素評価システム完成**
  * OperationEvaluationService（511行・関数型プログラミング）
  * ChainEvaluationService（1,089行・GTR定跡・パターンマッチング）
  * StrategyEvaluationService（772行・発火判断・状況分析・リスク管理）
- ✅ **⚡ 高度技術パターン実証**（関数型・システム統合・パターンマッチング）
- ✅ **📊 品質実績**: TypeScript型カバレッジ94%、平均評価時間85ms

### v1.2.1 (AI学習システム統合) - 完了実績 ✅
- ✅ **🤖 AI学習システム11コンポーネント完全実装**
  * TensorFlowTrainer（学習エンジン）
  * LearningService（学習管理）
  * AutoLearningGameService（自動学習ゲーム統合）
  * DataCollectionService、BatchProcessingService等
- ✅ **🛠️ テスト品質向上プロセス確立**
  * 単体テストエラー4件→0件完全解決
  * システマチックなテスト修正アプローチ導入
- ✅ **📊 品質実績**: 21 SP完了、テストカバレッジ80.57%維持、テスト成功率98.3%

### v1.3-1.4 - 将来拡張（長期計画）
- 🎯 AI学習システム完全統合・最適化
- 🎨 視覚・音響効果強化
- 📱 モバイル対応・PWA
- ⚡ パフォーマンス最適化

## 🏁 Phase 3 開発実績

### イテレーション6（完了）✅ - 2025-09-02
- **🤖 AI学習システム統合完了**（11コンポーネント実装）
- **📈 Story Points 21完了**（100%達成）
- **⚡ 技術実装成果**:
  * ✅ TensorFlowTrainer（学習エンジン）実装
  * ✅ LearningService（学習管理）実装
  * ✅ AutoLearningGameService（自動学習ゲーム統合）実装
  * ✅ DataCollectionService、BatchProcessingService等学習関連サービス実装
- **🛠️ テスト品質向上**: 単体テストエラー4件→0件完全解決、体系的修正アプローチ確立
- **🎯 品質実績**: テストカバレッジ80.57%維持、テスト成功率98.3%（1,034/1,052件通過）
- **🏆 戦略的意義**: AI学習システム基盤完成により、継続的AI性能向上基盤確立
- **📊 技術成果**: AI学習データパイプライン完成、テスト品質管理プロセス標準化
- **📝 詳細**: [完了報告書](./development/イテレーション6_完了報告書.md) | [ふりかえり](./development/イテレーション6_ふりかえり_KPT.md)

### イテレーション5（完了）✅ - 2025-08-25
- **🧠 mayah AI評価システム実装完了**（操作・連鎖・戦略評価）
- **📈 Story Points 39完了**（100%達成）
- **⚡ 技術実装成果**:
  * ✅ OperationEvaluationService実装（511行・関数型プログラミング実証）
  * ✅ ChainEvaluationService実装（1,089行・GTR定跡・パターンマッチング実証）
  * ✅ StrategyEvaluationService実装（772行・発火判断・状況分析・リスク管理実証）
  * ✅ **総実装行数2,372行**・高度技術パターン採用
- **🎯 品質実績**: TypeScript型カバレッジ94%、平均評価時間85ms、重大バグ0件
- **🏆 戦略的意義**: mayah AI 4要素評価システム完成により、ぷよぷよAI分野での技術優位性確立
- **📊 技術成果**: 関数型プログラミング・システム統合設計・パターンマッチングの実証完了
- **📝 詳細**: [完了報告書](./development/iteration-5-completion-report.md) | [ふりかえり](./development/iteration-5-retrospective.md)

### イテレーション4（完了）✅ - 2025-08-19
- **AI分析・戦略機能実装完了**（v1.1 Phase2）
- **Story Points 29完了**（100%達成）
- **機能実装成果**:
  * PerformanceAnalysisService実装（AIパフォーマンス分析）
  * StrategyService拡張（複数AI戦略システム）
  * ChartDataService実装（データ可視化機能）
  * mayah AI設計拡張（4要素評価システム設計）
- **品質実績**: 602件テスト成功（97.6%）、受け入れ基準4/4達成、重大バグ0件
- **戦略的成果**: mayah AI実装設計（76 SP・15週間拡張）、長期ロードマップ策定（～v3.0）
- **詳細**: [完了報告書](./development/iteration-4-completion-report.md) | [ふりかえり](./development/iteration-4-retrospective.md)

### イテレーション3（完了）✅ - 2025-08-18 
- **AI機能基盤実装完了**（TensorFlow.js + Web Workers）
- **Story Points 21完了**（100%達成）
- **技術統合成果**: 
  * TensorFlow.js v4.22.0統合成功
  * Web Workers非同期処理実装
  * AI可視化UI完成（AIControlPanel, AIInsights）
  * EvaluationService関数型リファクタリング完了（2025-08-19追加）
- **品質実績**: 489件テスト（100%通過）、E2E 65件（100%通過）、カバレッジ80.57%
- **アーキテクチャ成果**: services/ai/ディレクトリ構造化、domain/services/ai配置、関数型パターン導入
- **詳細**: [完了報告書](./development/iteration-3-completion-report.md) | [ふりかえり](./development/iteration-3-retrospective.md)

### イテレーション2（完了）✅ - 2025-01-16
- **テストカバレッジ大幅向上**（63.91% → 91.18%）
- **目標を大幅超過達成**（目標80% → 実績91.18%）
- **domain/services**: 37.84% → 98.19%（+60.35%）
- **infrastructure/adapters**: 16.9% → 99.03%（+82.13%）
- **実装成果**: 100個のテストケース追加、3A手法採用
- **品質実績**: 403件テスト成功、テスト実行時間4.58秒
- **詳細**: [完了報告書](./development/iteration-2-completion-report.md) | [ふりかえり](./development/iteration-2-retrospective.md)

### イテレーション1（完了）✅ - 2025-08-13
- **予定より3日早期完了**（効率性127%）
- **テスト176件成功**、重大バグ0件
- **TDD + 関数型**の効果実証
- **実装成果**: ドメインモデル（Puyo, Field, Game）、基本UI、操作システム
- **品質実績**: カバレッジ73.78%、セキュリティ脆弱性0件
- **詳細**: [完了報告書](./development/iteration1-completion-report.md) | [ふりかえり](./development/iteration1-retrospective.md)

## 📚 開発プロセス実績

### アジャイル開発実践
- **XP（エクストリームプログラミング）**手法の完全実践
- **イテレーション型開発**による段階的価値提供
- **受け入れ駆動開発**による品質保証

### 技術的成果
- **ヘキサゴナルアーキテクチャ**の効果的な実装
- **関数型プログラミング**による保守性向上
- **3層テスト戦略**（単体・統合・E2E）の確立
- **継続的品質管理**の自動化体制構築
- **AI機能統合**（TensorFlow.js + Web Workers）の成功実装
- **非同期処理基盤**によるパフォーマンス向上
- **関数型リファクタリング**による評価ロジック純粋関数化
- **🧠 mayah AI評価システム完成**（2,372行・高度技術パターン実証）
- **⚡ 高性能評価基盤**（平均評価時間85ms・TypeScript型カバレッジ94%）
- **🎯 技術優位性確立**（関数型・システム統合・パターンマッチング実証完了）

### プロジェクト管理成果  
- **包括的ドキュメント体系**の確立
- **ADR（アーキテクチャ決定記録）**による透明な意思決定
- **KPTふりかえり**による継続的改善文化
