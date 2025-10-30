import { CinemaPredictor } from '../src/models/CinemaPredictor';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function main(): Promise<void> {
  console.log('=== Cinema 興行収入予測 ===\n');

  const predictor = new CinemaPredictor();
  const modelPath = path.join(projectRoot, 'models/cinema_predictor.json');

  // モデル読み込み
  try {
    console.log('📂 モデルを読み込んでいます...');
    await predictor.load(modelPath);
    console.log(`✓ モデルを読み込みました: ${modelPath}\n`);
  } catch {
    console.error('エラー: モデルファイルが見つかりません。');
    console.error('先に `npm run train:cinema` を実行してモデルを訓練してください。');
    process.exit(1);
  }

  // 予測例
  console.log('🎬 映画の興行収入を予測します\n');

  const examples = [
    {
      budget: 100,
      runtime: 120,
      description: '予算100百万円、上映時間120分の映画',
    },
    {
      budget: 150,
      runtime: 135,
      description: '予算150百万円、上映時間135分の映画',
    },
    {
      budget: 200,
      runtime: 150,
      description: '予算200百万円、上映時間150分の映画',
    },
    {
      budget: 80,
      runtime: 105,
      description: '予算80百万円、上映時間105分の映画',
    },
  ];

  examples.forEach((example, index) => {
    const features = [example.budget, example.runtime];
    const revenue = predictor.predictOne(features);

    console.log(`例 ${index + 1}: ${example.description}`);
    console.log(`  → 予測興行収入: ${revenue.toFixed(2)} 百万円\n`);
  });

  // まとめて予測
  console.log('📊 複数の映画をまとめて予測:\n');
  const batchFeatures = examples.map((ex) => [ex.budget, ex.runtime]);
  const batchRevenues = predictor.predict(batchFeatures);

  console.log('予測結果:');
  batchRevenues.forEach((revenue, index) => {
    console.log(
      `  映画${index + 1}: ${examples[index].budget}百万円, ${examples[index].runtime}分 → ${revenue.toFixed(2)}百万円`
    );
  });

  console.log('\n=== 予測完了 ===');
}

main().catch((error) => {
  console.error('エラーが発生しました:', error);
  process.exit(1);
});
