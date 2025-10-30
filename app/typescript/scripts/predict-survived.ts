import { SurvivedClassifier } from '../src/models/SurvivedClassifier';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function main(): Promise<void> {
  console.log('=== Survived 生存予測 ===\n');

  const classifier = new SurvivedClassifier();
  const modelPath = path.join(projectRoot, 'models/survived_classifier.json');

  // モデル読み込み
  try {
    console.log('📂 モデルを読み込んでいます...');
    await classifier.load(modelPath);
    console.log(`✓ モデルを読み込みました: ${modelPath}\n`);
  } catch {
    console.error('エラー: モデルファイルが見つかりません。');
    console.error('先に `npm run train:survived` を実行してモデルを訓練してください。');
    process.exit(1);
  }

  // 予測例
  console.log('⛴️ タイタニック号の乗客の生存を予測します\n');

  const examples = [
    {
      pclass: 1,
      age: 38.0,
      sibsp: 1,
      parch: 0,
      fare: 71.28,
      sex: 'female',
      description: '1等客室、38歳女性、配偶者と同乗',
    },
    {
      pclass: 3,
      age: 22.0,
      sibsp: 1,
      parch: 0,
      fare: 7.25,
      sex: 'male',
      description: '3等客室、22歳男性、兄弟と同乗',
    },
    {
      pclass: 2,
      age: 28.0,
      sibsp: 0,
      parch: 0,
      fare: 13.0,
      sex: 'female',
      description: '2等客室、28歳女性、単独',
    },
    {
      pclass: 3,
      age: 35.0,
      sibsp: 0,
      parch: 0,
      fare: 7.75,
      sex: 'male',
      description: '3等客室、35歳男性、単独',
    },
    {
      pclass: 1,
      age: 54.0,
      sibsp: 0,
      parch: 0,
      fare: 51.86,
      sex: 'male',
      description: '1等客室、54歳男性、単独',
    },
  ];

  examples.forEach((example, index) => {
    // male ダミー変数: male=1, female=0
    const male = example.sex === 'male' ? 1 : 0;
    const features = [example.pclass, example.age, example.sibsp, example.parch, example.fare, male];
    const prediction = classifier.predict([features])[0];
    const survived = prediction === 1 ? '生存' : '死亡';

    console.log(`例 ${index + 1}: ${example.description}`);
    console.log(`  → 予測: ${survived} (Survived=${prediction})\n`);
  });

  // まとめて予測
  console.log('📊 複数の乗客をまとめて予測:\n');
  const batchFeatures = examples.map((ex) => {
    const male = ex.sex === 'male' ? 1 : 0;
    return [ex.pclass, ex.age, ex.sibsp, ex.parch, ex.fare, male];
  });
  const batchPredictions = classifier.predict(batchFeatures);

  console.log('予測結果:');
  batchPredictions.forEach((pred, index) => {
    const survived = pred === 1 ? '生存' : '死亡';
    const sexJa = examples[index].sex === 'male' ? '男性' : '女性';
    console.log(
      `  乗客${index + 1}: ${examples[index].pclass}等, ${examples[index].age}歳${sexJa} → ${survived}`
    );
  });

  console.log('\n=== 予測完了 ===');
}

main().catch((error) => {
  console.error('エラーが発生しました:', error);
  process.exit(1);
});
