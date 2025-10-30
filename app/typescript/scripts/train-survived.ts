import { SurvivedClassifier } from '../src/models/SurvivedClassifier';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function main(): Promise<void> {
  console.log('=== Survived 生存予測モデルの訓練 ===\n');

  const classifier = new SurvivedClassifier({ maxDepth: 9 });

  // データ読み込みと前処理
  console.log('📂 データを読み込んでいます...');
  await classifier.loadData(path.join(projectRoot, 'data/survived.csv'), true);
  console.log(`✓ ${classifier.getDataSize()}件のデータを読み込みました`);
  console.log('✓ 欠損値補完とカテゴリカル変数エンコーディングを実行しました\n');

  // データ分割
  console.log('📊 データを訓練用とテスト用に分割しています...');
  classifier.splitData(0.2); // 20%をテスト用に
  console.log(`✓ 訓練データ: ${classifier.getTrainSize()}件`);
  console.log(`✓ テストデータ: ${classifier.getTestSize()}件\n`);

  // モデル訓練
  console.log('🤖 モデルを訓練しています...');
  await classifier.train();
  console.log('✓ モデル訓練が完了しました\n');

  // モデル評価
  console.log('📈 モデルを評価しています...');
  const accuracy = classifier.evaluate();
  console.log(`正解率（Accuracy）: ${(accuracy * 100).toFixed(2)}%\n`);

  // モデル保存
  const modelPath = path.join(projectRoot, 'models/survived_classifier.json');
  console.log('💾 モデルを保存しています...');
  await classifier.save(modelPath);
  console.log(`✓ モデルを保存しました: ${modelPath}\n`);

  console.log('=== 訓練完了 ===');
}

main().catch((error) => {
  console.error('エラーが発生しました:', error);
  process.exit(1);
});
