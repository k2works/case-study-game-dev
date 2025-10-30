import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { IrisClassifier } from '../../src/models/IrisClassifier';
import * as fs from 'fs';

describe('IrisClassifier', () => {
  let classifier: IrisClassifier;
  const testDataPath = 'data/iris.csv';
  const testModelPath = 'models/test_iris_classifier.json';

  beforeEach(() => {
    classifier = new IrisClassifier();
  });

  afterEach(async () => {
    // テスト用モデルファイルを削除
    if (fs.existsSync(testModelPath)) {
      await fs.promises.unlink(testModelPath);
    }
  });

  describe('初期化', () => {
    it('クラスのインスタンスを作成できる', () => {
      expect(classifier).toBeInstanceOf(IrisClassifier);
    });

    it('初期状態では訓練されていない', () => {
      expect(classifier.isTrained()).toBe(false);
    });
  });

  describe('データ読み込み', () => {
    it('CSVファイルからデータを読み込める', async () => {
      await classifier.loadData(testDataPath);

      expect(classifier.getDataSize()).toBeGreaterThan(0);
      expect(classifier.getFeatureNames()).toEqual([
        'sepal_length',
        'sepal_width',
        'petal_length',
        'petal_width',
      ]);
    });

    it('データを訓練用とテスト用に分割できる', async () => {
      await classifier.loadData(testDataPath);
      classifier.splitData(0.2); // 20%をテスト用に

      const trainSize = classifier.getTrainSize();
      const testSize = classifier.getTestSize();

      expect(trainSize).toBeGreaterThan(0);
      expect(testSize).toBeGreaterThan(0);
      expect(trainSize + testSize).toBe(classifier.getDataSize());
    });
  });

  describe('モデル訓練', () => {
    it('モデルを訓練できる', async () => {
      await classifier.loadData(testDataPath);
      classifier.splitData(0.2);

      await classifier.train();

      expect(classifier.isTrained()).toBe(true);
    });
  });

  describe('予測', () => {
    beforeEach(async () => {
      await classifier.loadData(testDataPath);
      classifier.splitData(0.2);
      await classifier.train();
    });

    it('単一のデータを予測できる', () => {
      const prediction = classifier.predictOne([5.1, 3.5, 1.4, 0.2]);

      expect(prediction).toBe('setosa');
    });

    it('複数のデータを一度に予測できる', () => {
      const predictions = classifier.predict([
        [5.1, 3.5, 1.4, 0.2],
        [7.0, 3.2, 4.7, 1.4],
      ]);

      expect(predictions).toHaveLength(2);
      expect(predictions[0]).toBe('setosa');
    });
  });

  describe('評価', () => {
    it('モデルの正解率を計算できる', async () => {
      await classifier.loadData(testDataPath);
      classifier.splitData(0.2);
      await classifier.train();

      const accuracy = classifier.evaluate();

      expect(accuracy).toBeGreaterThanOrEqual(0.8); // 80%以上の正解率を期待
      expect(accuracy).toBeLessThanOrEqual(1.0);
    });
  });

  describe('保存と読み込み', () => {
    it('訓練済みモデルを保存できる', async () => {
      await classifier.loadData(testDataPath);
      classifier.splitData(0.2);
      await classifier.train();

      await classifier.save(testModelPath);

      // ファイルが存在することを確認
      expect(fs.existsSync(testModelPath)).toBe(true);
    });

    it('保存したモデルを読み込める', async () => {
      // まずモデルを訓練して保存
      await classifier.loadData(testDataPath);
      classifier.splitData(0.2);
      await classifier.train();
      await classifier.save(testModelPath);

      // 新しいインスタンスで読み込み
      const newClassifier = new IrisClassifier();
      await newClassifier.load(testModelPath);

      expect(newClassifier.isTrained()).toBe(true);

      const prediction = newClassifier.predictOne([5.1, 3.5, 1.4, 0.2]);
      expect(prediction).toBe('setosa');
    });
  });
});
