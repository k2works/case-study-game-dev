import { CinemaPredictor } from '../src/models/CinemaPredictor';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function main(): Promise<void> {
  console.log('=== Cinema 興行収入予測モデルの訓練 ===\n');

  const predictor = new CinemaPredictor();

  // データ読み込み
  console.log('📂 データを読み込んでいます...');
  await predictor.loadData(path.join(projectRoot, 'data/cinema.csv'));
  console.log(`✓ ${predictor.getDataSize()}件のデータを読み込みました\n`);

  // データ分割
  console.log('📊 データを訓練用とテスト用に分割しています...');
  predictor.splitData(0.2); // 20%をテスト用に
  console.log(`✓ 訓練データ: ${predictor.getTrainSize()}件`);
  console.log(`✓ テストデータ: ${predictor.getTestSize()}件\n`);

  // 外れ値除去
  console.log('🔍 外れ値を除去しています...');
  predictor.removeOutliers();
  console.log(`✓ 外れ値除去後の訓練データ: ${predictor.getTrainSize()}件\n`);

  // モデル訓練
  console.log('🤖 モデルを訓練しています...');
  await predictor.train();
  console.log('✓ モデル訓練が完了しました\n');

  // モデル評価
  console.log('📈 モデルを評価しています...');
  const metrics = predictor.evaluate();
  console.log('評価結果:');
  console.log(`  RMSE (Root Mean Squared Error): ${metrics.rmse.toFixed(2)} 百万円`);
  console.log(`  MAE (Mean Absolute Error):      ${metrics.mae.toFixed(2)} 百万円`);
  console.log(`  R² スコア:                       ${metrics.r2.toFixed(4)}\n`);

  // モデル保存
  const modelPath = path.join(projectRoot, 'models/cinema_predictor.json');
  console.log('💾 モデルを保存しています...');
  await predictor.save(modelPath);
  console.log(`✓ モデルを保存しました: ${modelPath}\n`);

  console.log('=== 訓練完了 ===');
}

main().catch((error) => {
  console.error('エラーが発生しました:', error);
  process.exit(1);
});
