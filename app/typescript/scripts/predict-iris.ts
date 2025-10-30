/**
 * Iris 分類モデルの予測スクリプト
 */
import { IrisClassifier } from '../src/models/IrisClassifier';
import * as path from 'path';
import { fileURLToPath } from 'url';

// スクリプトのディレクトリからプロジェクトルートへのパスを計算
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function main(): Promise<void> {
  console.log('=== Iris 分類モデルの予測 ===\n');

  // 分類器の作成
  const classifier = new IrisClassifier();

  // 訓練済みモデルの読み込み
  try {
    await classifier.load(path.join(projectRoot, 'models/iris_classifier.json'));
    console.log('✓ 訓練済みモデルを読み込みました');
  } catch {
    console.error(
      'エラー: モデルファイルが見つかりません。先に train-iris.ts を実行してください。'
    );
    process.exit(1);
  }

  // 予測サンプル
  console.log('\n=== 予測例 ===\n');

  const samples = [
    {
      name: 'サンプル 1 (Setosa)',
      features: [5.1, 3.5, 1.4, 0.2],
      description: 'がく片: 長さ 5.1cm, 幅 3.5cm / 花弁: 長さ 1.4cm, 幅 0.2cm',
    },
    {
      name: 'サンプル 2 (Versicolor)',
      features: [7.0, 3.2, 4.7, 1.4],
      description: 'がく片: 長さ 7.0cm, 幅 3.2cm / 花弁: 長さ 4.7cm, 幅 1.4cm',
    },
    {
      name: 'サンプル 3 (Virginica)',
      features: [6.3, 3.3, 6.0, 2.5],
      description: 'がく片: 長さ 6.3cm, 幅 3.3cm / 花弁: 長さ 6.0cm, 幅 2.5cm',
    },
    {
      name: 'サンプル 4 (カスタム)',
      features: [5.5, 2.8, 4.0, 1.3],
      description: 'がく片: 長さ 5.5cm, 幅 2.8cm / 花弁: 長さ 4.0cm, 幅 1.3cm',
    },
  ];

  samples.forEach((sample) => {
    const prediction = classifier.predictOne(sample.features);

    console.log(`【${sample.name}】`);
    console.log(`  ${sample.description}`);
    console.log(`  → 予測: ${prediction}`);
    console.log('');
  });

  // 一括予測
  console.log('=== 一括予測 ===\n');

  const batchFeatures = samples.map((s) => s.features);
  const predictions = classifier.predict(batchFeatures);

  console.log('特徴量リスト:');
  batchFeatures.forEach((features, i) => {
    console.log(`  ${i + 1}. [${features.map((f) => f.toFixed(1)).join(', ')}]`);
  });

  console.log('\n予測結果:');
  predictions.forEach((prediction, i) => {
    console.log(`  ${i + 1}. ${prediction}`);
  });

  console.log('\n=== 予測完了 ===');
}

main().catch((error) => {
  console.error('エラーが発生しました:', error);
  process.exit(1);
});
