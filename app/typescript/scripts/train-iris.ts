/**
 * Iris 分類モデルの訓練スクリプト
 */
import { IrisClassifier } from '../src/models/IrisClassifier';
import * as path from 'path';
import { fileURLToPath } from 'url';

// スクリプトのディレクトリからプロジェクトルートへのパスを計算
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function main(): Promise<void> {
  console.log('=== Iris 分類モデルの訓練 ===\n');

  // 分類器の作成
  const classifier = new IrisClassifier();
  console.log('✓ IrisClassifier を作成しました');

  // データの読み込み
  await classifier.loadData(path.join(projectRoot, 'data/iris.csv'));
  console.log(`✓ データを読み込みました: ${classifier.getDataSize()} サンプル`);

  // 訓練データとテストデータに分割
  classifier.splitData(0.2);
  console.log(
    `✓ データを分割しました: 訓練データ ${classifier.getTrainSize()} サンプル, テストデータ ${classifier.getTestSize()} サンプル`
  );

  // モデルの訓練
  await classifier.train(5);
  console.log('✓ モデルの訓練が完了しました');

  // モデルの評価
  const accuracy = classifier.evaluate();
  console.log('\n=== モデルの評価 ===');
  console.log(`正解率（Accuracy）: ${(accuracy * 100).toFixed(2)}%`);

  // モデルの保存
  await classifier.save(path.join(projectRoot, 'models/iris_classifier.json'));
  console.log('\n✓ モデルを models/iris_classifier.json に保存しました');

  // 予測例
  console.log('\n=== 予測例 ===');

  const samples = [
    { features: [5.1, 3.5, 1.4, 0.2], expected: 'setosa' },
    { features: [7.0, 3.2, 4.7, 1.4], expected: 'versicolor' },
    { features: [6.3, 3.3, 6.0, 2.5], expected: 'virginica' },
  ];

  samples.forEach((sample, i) => {
    const prediction = classifier.predictOne(sample.features);
    const result = prediction === sample.expected ? '✓' : '✗';

    console.log(`\nサンプル ${i + 1}: ${result}`);
    console.log(`  特徴量: [${sample.features.map((f) => f.toFixed(1)).join(', ')}]`);
    console.log(`  予測: ${prediction}`);
    console.log(`  期待: ${sample.expected}`);
  });

  console.log('\n=== 訓練完了 ===');
}

main().catch((error) => {
  console.error('エラーが発生しました:', error);
  process.exit(1);
});
