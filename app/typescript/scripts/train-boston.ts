import { BostonPredictor } from '../src/models/BostonPredictor';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function main(): Promise<void> {
  console.log('=== Boston 住宅価格予測モデルの訓練 ===\n');

  const predictor = new BostonPredictor();
  const dataPath = path.join(projectRoot, 'data/boston.csv');

  // データ読み込み
  console.log('📂 データを読み込んでいます...');
  let df = await predictor.loadData(dataPath);
  console.log(`✓ データ読み込み完了: ${df.count()} 件\n`);

  // データの前処理パイプライン
  console.log('🔧 データの前処理を実行中...\n');

  // 1. CRIME 列のダミー変数化
  console.log('  1. CRIME 列をダミー変数化');
  df = (predictor as any).encodeCrime(df);

  // 2. 欠損値補完（訓練データで fit）
  console.log('  2. 欠損値を補完');
  df = (predictor as any).fillMissingValues(df, true);

  // 3. 外れ値除外
  console.log('  3. 外れ値を除外');
  df = (predictor as any).removeOutliers(df);
  console.log(`     → 除外後のデータ数: ${df.count()} 件\n`);

  // 特徴量と目的変数の分割
  const featureColumns = ['RM', 'LSTAT', 'PTRATIO'];
  let X = df.subset(featureColumns);
  const y = df.getSeries('PRICE');

  // 4. 特徴量エンジニアリング
  console.log('⚙️ 特徴量エンジニアリング実行中...');
  X = predictor.featureEngineering(X);
  console.log(`  → 特徴量数: ${X.getColumnNames().length} 個`);
  console.log(`     ${X.getColumnNames().join(', ')}\n`);

  // データを配列に変換
  const XArray = X.toArray().map((row) =>
    X.getColumnNames().map((col) => Number(row[col]))
  );
  const yArray = y.toArray().map((val) => Number(val));

  // 訓練データとテストデータに分割（80/20）
  const totalSize = XArray.length;
  const trainSize = Math.floor(totalSize * 0.8);

  const XTrain = XArray.slice(0, trainSize);
  const yTrain = yArray.slice(0, trainSize);
  const XTest = XArray.slice(trainSize);
  const yTest = yArray.slice(trainSize);

  console.log('📊 データ分割:');
  console.log(`  訓練データ: ${XTrain.length} 件`);
  console.log(`  テストデータ: ${XTest.length} 件\n`);

  // 5. データ標準化
  console.log('📐 データを標準化中...');
  const XTrainScaled = predictor.standardizeFeatures(XTrain, true);
  const yTrainScaled = predictor.standardizeTarget(yTrain, true);
  const XTestScaled = predictor.standardizeFeatures(XTest, false);
  console.log('✓ 標準化完了\n');

  // 6. モデルの訓練
  console.log('🤖 モデルを訓練中...');
  predictor.train(XTrainScaled, yTrainScaled);
  console.log('✓ 訓練完了\n');

  // 7. モデルの評価
  console.log('📈 モデルを評価中...');

  // 訓練データでの評価
  const yTrainPredScaled = predictor.predict(XTrainScaled);
  const yTrainPred = predictor.inverseTransformPrediction(yTrainPredScaled);

  const trainMean = yTrain.reduce((a, b) => a + b, 0) / yTrain.length;
  const trainSST = yTrain.reduce((sum, y) => sum + (y - trainMean) ** 2, 0);
  const trainSSR = yTrain.reduce(
    (sum, y, i) => sum + (y - yTrainPred[i]) ** 2,
    0
  );
  const trainR2 = 1 - trainSSR / trainSST;

  console.log(`  訓練データ R²: ${trainR2.toFixed(4)}`);

  // テストデータでの評価
  const yTestPredScaled = predictor.predict(XTestScaled);
  const yTestPred = predictor.inverseTransformPrediction(yTestPredScaled);

  const testMean = yTest.reduce((a, b) => a + b, 0) / yTest.length;
  const testSST = yTest.reduce((sum, y) => sum + (y - testMean) ** 2, 0);
  const testSSR = yTest.reduce((sum, y, i) => sum + (y - yTestPred[i]) ** 2, 0);
  const testR2 = 1 - testSSR / testSST;

  console.log(`  テストデータ R²: ${testR2.toFixed(4)}\n`);

  // 8. モデルとスケーラーの保存
  console.log('💾 モデルとスケーラーを保存中...');
  const modelPath = path.join(projectRoot, 'models/boston_model.json');
  const scalerXPath = path.join(projectRoot, 'models/boston_scalerX.json');
  const scalerYPath = path.join(projectRoot, 'models/boston_scalerY.json');
  const singleFilePath = path.join(projectRoot, 'models/boston_predictor.json');

  await predictor.saveModels(modelPath, scalerXPath, scalerYPath);
  await predictor.save(singleFilePath);
  console.log(`✓ モデルを保存しました:`);
  console.log(`  - ${modelPath}`);
  console.log(`  - ${scalerXPath}`);
  console.log(`  - ${scalerYPath}`);
  console.log(`  - ${singleFilePath} (単一ファイル形式)\n`);

  // 予測例の表示
  console.log('🏠 予測例:');
  console.log('─'.repeat(70));
  console.log(
    'RM      LSTAT   PTRATIO   | 実際の価格  予測価格  差分'
  );
  console.log('─'.repeat(70));

  for (let i = 0; i < Math.min(10, XTest.length); i++) {
    const features = XTest[i];
    const actual = yTest[i];
    const predicted = yTestPred[i];
    const diff = actual - predicted;

    console.log(
      `${features[0].toFixed(1).padStart(6)}  ` +
        `${features[1].toFixed(1).padStart(6)}  ` +
        `${features[2].toFixed(1).padStart(6)}    | ` +
        `$${(actual * 1000).toFixed(0).padStart(6)}  ` +
        `$${(predicted * 1000).toFixed(0).padStart(6)}  ` +
        `${diff > 0 ? '+' : ''}${(diff * 1000).toFixed(0)}`
    );
  }
  console.log('─'.repeat(70));

  console.log('\n=== 訓練完了 ===');
}

main().catch((error) => {
  console.error('エラーが発生しました:', error);
  process.exit(1);
});
