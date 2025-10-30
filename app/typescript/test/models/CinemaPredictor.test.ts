import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CinemaPredictor } from '../../src/models/CinemaPredictor';
import * as fs from 'fs';

describe('CinemaPredictor', () => {
  let predictor: CinemaPredictor;
  const testDataPath = 'data/cinema.csv';
  const testModelPath = 'models/test_cinema_predictor.json';

  beforeEach(() => {
    predictor = new CinemaPredictor();
  });

  afterEach(async () => {
    // テスト用モデルファイルを削除
    if (fs.existsSync(testModelPath)) {
      await fs.promises.unlink(testModelPath);
    }
  });

  describe('初期化', () => {
    it('クラスのインスタンスを作成できる', () => {
      expect(predictor).toBeInstanceOf(CinemaPredictor);
    });

    it('初期状態では訓練されていない', () => {
      expect(predictor.isTrained()).toBe(false);
    });
  });

  describe('データ読み込み', () => {
    it('CSVファイルからデータを読み込める', async () => {
      await predictor.loadData(testDataPath);

      expect(predictor.getDataSize()).toBeGreaterThan(0);
      expect(predictor.getFeatureNames()).toEqual(['budget', 'runtime']);
    });

    it('データを訓練用とテスト用に分割できる', async () => {
      await predictor.loadData(testDataPath);
      predictor.splitData(0.2); // 20%をテスト用に

      const trainSize = predictor.getTrainSize();
      const testSize = predictor.getTestSize();

      expect(trainSize).toBeGreaterThan(0);
      expect(testSize).toBeGreaterThan(0);
      expect(trainSize + testSize).toBe(predictor.getDataSize());
    });
  });

  describe('外れ値処理', () => {
    it('IQR法で外れ値を検出できる', () => {
      const data = [1, 2, 3, 4, 5, 100]; // 100が外れ値
      const outlierIndices = predictor.detectOutliers(data);

      expect(outlierIndices).toContain(5); // インデックス5が外れ値
    });

    it('外れ値を除去できる', async () => {
      await predictor.loadData(testDataPath);
      predictor.splitData(0.2);

      const originalSize = predictor.getTrainSize();
      predictor.removeOutliers();
      const cleanedSize = predictor.getTrainSize();

      // 外れ値が除去されているはず
      expect(cleanedSize).toBeLessThanOrEqual(originalSize);
    });
  });

  describe('モデル訓練', () => {
    it('線形回帰モデルを訓練できる', async () => {
      await predictor.loadData(testDataPath);
      predictor.splitData(0.2);
      predictor.removeOutliers();

      await predictor.train();

      expect(predictor.isTrained()).toBe(true);
    });
  });

  describe('予測', () => {
    beforeEach(async () => {
      await predictor.loadData(testDataPath);
      predictor.splitData(0.2);
      predictor.removeOutliers();
      await predictor.train();
    });

    it('単一のデータを予測できる', () => {
      const prediction = predictor.predictOne([150, 120]);

      expect(prediction).toBeGreaterThan(0);
      expect(typeof prediction).toBe('number');
    });

    it('複数のデータを一度に予測できる', () => {
      const predictions = predictor.predict([
        [150, 120],
        [200, 150],
      ]);

      expect(predictions).toHaveLength(2);
      expect(predictions[0]).toBeGreaterThan(0);
      expect(predictions[1]).toBeGreaterThan(0);
    });
  });

  describe('評価', () => {
    it('モデルの性能を評価できる', async () => {
      await predictor.loadData(testDataPath);
      predictor.splitData(0.2);
      predictor.removeOutliers();
      await predictor.train();

      const metrics = predictor.evaluate();

      expect(metrics.rmse).toBeGreaterThan(0);
      expect(metrics.mae).toBeGreaterThan(0);
      expect(metrics.r2).toBeGreaterThanOrEqual(0);
      expect(metrics.r2).toBeLessThanOrEqual(1);
    });
  });

  describe('保存と読み込み', () => {
    it('訓練済みモデルを保存できる', async () => {
      await predictor.loadData(testDataPath);
      predictor.splitData(0.2);
      predictor.removeOutliers();
      await predictor.train();

      await predictor.save(testModelPath);

      // ファイルが存在することを確認
      expect(fs.existsSync(testModelPath)).toBe(true);
    });

    it('保存したモデルを読み込める', async () => {
      // まずモデルを訓練して保存
      await predictor.loadData(testDataPath);
      predictor.splitData(0.2);
      predictor.removeOutliers();
      await predictor.train();
      await predictor.save(testModelPath);

      // 新しいインスタンスで読み込み
      const newPredictor = new CinemaPredictor();
      await newPredictor.load(testModelPath);

      expect(newPredictor.isTrained()).toBe(true);

      const prediction = newPredictor.predictOne([150, 120]);
      expect(prediction).toBeGreaterThan(0);
    });
  });
});
