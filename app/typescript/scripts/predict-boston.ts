import { BostonPredictor } from '../src/models/BostonPredictor';
import { DataFrame } from 'data-forge';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function main(): Promise<void> {
  console.log('=== Boston 住宅価格予測 ===\n');

  const predictor = new BostonPredictor();
  const modelPath = path.join(projectRoot, 'models/boston_model.json');
  const scalerXPath = path.join(projectRoot, 'models/boston_scalerX.json');
  const scalerYPath = path.join(projectRoot, 'models/boston_scalerY.json');

  // モデル読み込み
  try {
    console.log('📂 モデルを読み込んでいます...');
    await predictor.loadModels(modelPath, scalerXPath, scalerYPath);
    console.log(`✓ モデルを読み込みました\n`);
  } catch {
    console.error('エラー: モデルファイルが見つかりません。');
    console.error('先に `npm run train:boston` を実行してモデルを訓練してください。');
    process.exit(1);
  }

  // 予測例
  console.log('🏠 ボストンの住宅価格を予測します\n');

  const examples = [
    {
      rm: 6.5,
      lstat: 5.0,
      ptratio: 15.0,
      description: '平均的な住宅（部屋数6.5、低所得者率5%、生徒数15）',
    },
    {
      rm: 7.5,
      lstat: 3.0,
      ptratio: 14.0,
      description: '高級住宅（部屋数7.5、低所得者率3%、生徒数14）',
    },
    {
      rm: 5.5,
      lstat: 15.0,
      ptratio: 18.0,
      description: '低価格住宅（部屋数5.5、低所得者率15%、生徒数18）',
    },
    {
      rm: 8.0,
      lstat: 2.0,
      ptratio: 13.0,
      description: '最高級住宅（部屋数8.0、低所得者率2%、生徒数13）',
    },
    {
      rm: 5.0,
      lstat: 20.0,
      ptratio: 20.0,
      description: '最低価格住宅（部屋数5.0、低所得者率20%、生徒数20）',
    },
  ];

  console.log('─'.repeat(70));
  console.log('No.  説明                                             | 予測価格');
  console.log('─'.repeat(70));

  examples.forEach((example, index) => {
    // 特徴量エンジニアリング（2乗項と交互作用項を追加）
    const X = new DataFrame([
      {
        RM: example.rm,
        LSTAT: example.lstat,
        PTRATIO: example.ptratio,
      },
    ]);

    const XEngineered = predictor.featureEngineering(X);
    const features = XEngineered.getColumnNames().map(
      (col) => XEngineered.first()[col]
    );

    // 標準化
    const XScaled = predictor.standardizeFeatures([features], false);

    // 予測（標準化されたスケールで）
    const predictionScaled = predictor.predict(XScaled)[0];

    // 元のスケールに戻す
    const prediction = predictor.inverseTransformPrediction([predictionScaled])[0];

    // 結果表示（$1000単位 → ドル表示）
    const priceInDollars = prediction * 1000;

    console.log(
      `${(index + 1).toString().padStart(3)}  ` +
        `${example.description.padEnd(50)} | ` +
        `$${priceInDollars.toFixed(0).padStart(7)}`
    );
  });

  console.log('─'.repeat(70));

  // まとめて予測
  console.log('\n📊 複数の住宅をまとめて予測:\n');

  const batchExamples = examples.map((ex) => {
    const X = new DataFrame([
      {
        RM: ex.rm,
        LSTAT: ex.lstat,
        PTRATIO: ex.ptratio,
      },
    ]);
    const XEngineered = predictor.featureEngineering(X);
    return XEngineered.getColumnNames().map((col) => XEngineered.first()[col]);
  });

  const batchScaled = predictor.standardizeFeatures(batchExamples, false);
  const batchPredictionsScaled = predictor.predict(batchScaled);
  const batchPredictions =
    predictor.inverseTransformPrediction(batchPredictionsScaled);

  console.log('予測結果:');
  batchPredictions.forEach((pred, index) => {
    const priceInDollars = pred * 1000;
    console.log(
      `  住宅${index + 1}: ${examples[index].rm}部屋, ` +
        `低所得者率${examples[index].lstat}%, ` +
        `生徒数${examples[index].ptratio} → ` +
        `$${priceInDollars.toFixed(0)}`
    );
  });

  // 特徴量の影響分析
  console.log('\n📈 特徴量の影響分析:\n');

  // RM（部屋数）の影響
  console.log('部屋数（RM）の影響:');
  const rmValues = [5.0, 6.0, 7.0, 8.0];
  rmValues.forEach((rm) => {
    const X = new DataFrame([
      {
        RM: rm,
        LSTAT: 10.0,
        PTRATIO: 15.0,
      },
    ]);
    const XEngineered = predictor.featureEngineering(X);
    const features = XEngineered.getColumnNames().map(
      (col) => XEngineered.first()[col]
    );
    const XScaled = predictor.standardizeFeatures([features], false);
    const predScaled = predictor.predict(XScaled)[0];
    const pred = predictor.inverseTransformPrediction([predScaled])[0];
    console.log(`  RM=${rm.toFixed(1)} → $${(pred * 1000).toFixed(0)}`);
  });

  // LSTAT（低所得者率）の影響
  console.log('\n低所得者率（LSTAT）の影響:');
  const lstatValues = [2.0, 5.0, 10.0, 20.0];
  lstatValues.forEach((lstat) => {
    const X = new DataFrame([
      {
        RM: 6.5,
        LSTAT: lstat,
        PTRATIO: 15.0,
      },
    ]);
    const XEngineered = predictor.featureEngineering(X);
    const features = XEngineered.getColumnNames().map(
      (col) => XEngineered.first()[col]
    );
    const XScaled = predictor.standardizeFeatures([features], false);
    const predScaled = predictor.predict(XScaled)[0];
    const pred = predictor.inverseTransformPrediction([predScaled])[0];
    console.log(`  LSTAT=${lstat.toFixed(1)}% → $${(pred * 1000).toFixed(0)}`);
  });

  console.log('\n=== 予測完了 ===');
}

main().catch((error) => {
  console.error('エラーが発生しました:', error);
  process.exit(1);
});
