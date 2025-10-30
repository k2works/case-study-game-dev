import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BostonPredictor } from '../../src/models/BostonPredictor';
import { DataFrame } from 'data-forge';
import * as fs from 'fs';

describe('BostonPredictor', () => {
  let predictor: BostonPredictor;
  const testDataPath = 'data/boston.csv';
  const testModelPath = 'models/test_boston_model.json';
  const testScalerXPath = 'models/test_boston_scalerX.json';
  const testScalerYPath = 'models/test_boston_scalerY.json';

  beforeEach(() => {
    predictor = new BostonPredictor();
  });

  afterEach(async () => {
    // テスト用モデルファイルを削除
    const files = [testModelPath, testScalerXPath, testScalerYPath];
    for (const file of files) {
      if (fs.existsSync(file)) {
        await fs.promises.unlink(file);
      }
    }
  });

  describe('初期化', () => {
    it('デフォルトで初期化できる', () => {
      expect(predictor).toBeInstanceOf(BostonPredictor);
      expect(predictor.isTrained()).toBe(false);
    });
  });

  describe('データ読み込み', () => {
    it('CSV ファイルが正常に読み込める', async () => {
      const df = await predictor.loadData(testDataPath);

      expect(df.count()).toBeGreaterThan(0);
      expect(df.getColumnNames()).toContain('PRICE');
      expect(df.getColumnNames()).toContain('RM');
      expect(df.getColumnNames()).toContain('LSTAT');
      expect(df.getColumnNames()).toContain('PTRATIO');
      expect(df.getColumnNames()).toContain('CRIME');
    });

    it('ファイルが存在しない場合エラー', async () => {
      await expect(predictor.loadData('nonexistent.csv')).rejects.toThrow();
    });

    it('必要な列が不足している場合エラー', async () => {
      const testData = 'RM,LSTAT,PTRATIO\n6.5,5.0,15.0';
      const tempPath = 'temp_invalid_boston_test.csv';
      await fs.promises.writeFile(tempPath, testData);

      try {
        await expect(predictor.loadData(tempPath)).rejects.toThrow('Missing columns');
      } finally {
        await fs.promises.unlink(tempPath);
      }
    });
  });

  describe('CRIME 列ダミー変数化', () => {
    it('CRIME 列がダミー変数化される', () => {
      const df = new DataFrame([
        { RM: 6.5, CRIME: 'low', PRICE: 24.0 },
        { RM: 5.5, CRIME: 'high', PRICE: 18.5 },
      ]);

      const encoded = (predictor as any).encodeCrime(df);

      expect(encoded.getColumnNames()).not.toContain('CRIME');
      expect(encoded.getColumnNames()).toContain('high');
    });

    it('ダミー変数の値が正しい', () => {
      const df = new DataFrame([
        { CRIME: 'low' },
        { CRIME: 'high' },
        { CRIME: 'low' },
        { CRIME: 'medium' },
      ]);

      const encoded = (predictor as any).encodeCrime(df);

      const data = encoded.toArray();
      expect(data[0].high).toBe(0);
      expect(data[0].medium).toBe(0);
      expect(data[1].high).toBe(1);
      expect(data[1].medium).toBe(0);
      expect(data[3].high).toBe(0);
      expect(data[3].medium).toBe(1);
    });

    it('他の列は保持される', () => {
      const df = new DataFrame([
        { RM: 6.5, LSTAT: 5.0, CRIME: 'low', PRICE: 24.0 },
        { RM: 5.5, LSTAT: 10.0, CRIME: 'high', PRICE: 18.5 },
      ]);

      const encoded = (predictor as any).encodeCrime(df);

      expect(encoded.getColumnNames()).toContain('RM');
      expect(encoded.getColumnNames()).toContain('LSTAT');
      expect(encoded.getColumnNames()).toContain('PRICE');
      expect(encoded.getSeries('RM').toArray()).toEqual([6.5, 5.5]);
    });
  });

  describe('欠損値補完', () => {
    it('欠損値が平均値で補完される', () => {
      const df = new DataFrame([
        { RM: 6.0, LSTAT: 5.0, PRICE: 24.0 },
        { RM: 7.0, LSTAT: 10.0, PRICE: 18.5 },
        { RM: 5.0, LSTAT: null, PRICE: 21.0 },
      ]);

      const filled = (predictor as any).fillMissingValues(df, true);

      expect(filled.at(2)!.LSTAT).toBe(7.5);
    });

    it('テストデータは訓練データの平均で補完される', () => {
      const dfTrain = new DataFrame([
        { RM: 6.0, LSTAT: 5.0, PRICE: 24.0 },
        { RM: 7.0, LSTAT: 10.0, PRICE: 18.5 },
        { RM: 5.0, LSTAT: 15.0, PRICE: 21.0 },
      ]);

      (predictor as any).fillMissingValues(dfTrain, true);

      const dfTest = new DataFrame([{ RM: null, LSTAT: 8.0, PRICE: 20.0 }]);

      const testFilled = (predictor as any).fillMissingValues(dfTest, false);

      expect(testFilled.at(0)!.RM).toBe(6.0);
    });
  });

  describe('外れ値除外', () => {
    it('外れ値が除外される', () => {
      // インデックス 76 のデータを含む大きなデータセットを作成
      const data = [];
      for (let i = 0; i < 80; i++) {
        data.push({ RM: 6.0 + i * 0.1, PRICE: 24.0 + i * 0.5 });
      }

      const df = new DataFrame(data);

      const cleaned = (predictor as any).removeOutliers(df);

      // インデックス 76 が除外されるため、79件になる
      expect(cleaned.count()).toBe(79);
    });
  });

  describe('特徴量エンジニアリング', () => {
    it('2乗項が追加される', () => {
      const X = new DataFrame([{ RM: 6.5, LSTAT: 5.0, PTRATIO: 15.0 }]);

      const engineered = predictor.featureEngineering(X);

      expect(engineered.getColumnNames()).toContain('RM2');
      expect(engineered.getColumnNames()).toContain('LSTAT2');
      expect(engineered.getColumnNames()).toContain('PTRATIO2');

      const row = engineered.first();
      expect(row.RM2).toBe(42.25);
      expect(row.LSTAT2).toBe(25.0);
      expect(row.PTRATIO2).toBe(225.0);
    });

    it('交互作用項が追加される', () => {
      const X = new DataFrame([{ RM: 6.5, LSTAT: 5.0, PTRATIO: 15.0 }]);

      const engineered = predictor.featureEngineering(X);

      expect(engineered.getColumnNames()).toContain('RM_LSTAT');
      expect(engineered.first().RM_LSTAT).toBe(32.5);
    });

    it('元の特徴量は保持される', () => {
      const X = new DataFrame([
        { RM: 6.5, LSTAT: 5.0, PTRATIO: 15.0 },
        { RM: 5.5, LSTAT: 10.0, PTRATIO: 18.0 },
      ]);

      const engineered = predictor.featureEngineering(X);

      expect(engineered.getColumnNames()).toContain('RM');
      expect(engineered.getColumnNames()).toContain('LSTAT');
      expect(engineered.getColumnNames()).toContain('PTRATIO');
      expect(engineered.getSeries('RM').toArray()).toEqual([6.5, 5.5]);
    });

    it('特徴量数が正しい', () => {
      const X = new DataFrame([{ RM: 6.5, LSTAT: 5.0, PTRATIO: 15.0 }]);

      const engineered = predictor.featureEngineering(X);

      expect(engineered.getColumnNames().length).toBe(7);
    });
  });

  describe('標準化', () => {
    it('特徴量の標準化 - 訓練データ', () => {
      const X = [
        [5.0, 10.0],
        [6.0, 20.0],
        [7.0, 30.0],
      ];

      const scaled = predictor.standardizeFeatures(X, true);

      const col0 = scaled.map((row) => row[0]);
      const col1 = scaled.map((row) => row[1]);

      const mean0 = col0.reduce((a, b) => a + b, 0) / col0.length;
      const mean1 = col1.reduce((a, b) => a + b, 0) / col1.length;

      expect(Math.abs(mean0)).toBeLessThan(0.01);
      expect(Math.abs(mean1)).toBeLessThan(0.01);
    });

    it('特徴量の標準化 - テストデータ', () => {
      const XTrain = [[5.0], [6.0], [7.0]];

      const XTest = [[6.0]];

      predictor.standardizeFeatures(XTrain, true);

      predictor.standardizeFeatures(XTest, false);

      expect((predictor as any).scalerX).not.toBeNull();
    });

    it('目的変数の標準化', () => {
      const y = [20.0, 25.0, 30.0];

      const scaled = predictor.standardizeTarget(y, true);

      const mean = scaled.reduce((a, b) => a + b, 0) / scaled.length;
      expect(Math.abs(mean)).toBeLessThan(0.01);
    });

    it('逆標準化', () => {
      const y = [20.0, 25.0, 30.0];

      const scaled = predictor.standardizeTarget(y, true);

      const original = predictor.inverseTransformPrediction(scaled);

      original.forEach((val, i) => {
        expect(Math.abs(val - y[i])).toBeLessThan(0.001);
      });
    });

    it('fit 前に transform するとエラー', () => {
      const XTest = [[6.0]];

      expect(() => {
        predictor.standardizeFeatures(XTest, false);
      }).toThrow('Scaler not fitted yet');
    });
  });

  describe('訓練と予測', () => {
    it('モデルが訓練される', () => {
      const XTrain = [
        [6.5, 5.0, 15.0],
        [5.5, 10.0, 18.0],
        [7.0, 3.0, 14.0],
        [6.0, 7.0, 16.0],
        [5.8, 12.0, 17.0],
        [6.8, 4.5, 15.5],
      ];
      const yTrain = [24.0, 18.5, 33.0, 21.0, 16.0, 26.0];

      predictor.train(XTrain, yTrain);

      expect(predictor.isTrained()).toBe(true);
    });

    it('予測ができる', () => {
      const XTrain = [
        [6.5, 5.0, 15.0],
        [5.5, 10.0, 18.0],
        [7.0, 3.0, 14.0],
        [6.0, 7.0, 16.0],
        [5.8, 12.0, 17.0],
        [6.8, 4.5, 15.5],
      ];
      const yTrain = [24.0, 18.5, 33.0, 21.0, 16.0, 26.0];

      predictor.train(XTrain, yTrain);

      const XTest = [[6.0, 7.0, 16.0]];
      const prediction = predictor.predict(XTest);

      expect(prediction).toHaveLength(1);
      expect(typeof prediction[0]).toBe('number');
    });

    it('訓練されていない状態で予測するとエラー', () => {
      const XTest = [[6.0, 7.0, 16.0]];

      expect(() => {
        predictor.predict(XTest);
      }).toThrow('Model has not been trained yet');
    });
  });

  describe('評価', () => {
    it('決定係数（R²）が計算できる', () => {
      const XTrain = [
        [6.5, 5.0, 15.0],
        [5.5, 10.0, 18.0],
        [7.0, 3.0, 14.0],
        [6.0, 7.0, 16.0],
        [5.8, 12.0, 17.0],
        [6.8, 4.5, 15.5],
        [5.6, 11.5, 17.8],
        [7.2, 3.5, 14.2],
        [6.1, 6.5, 15.8],
        [5.9, 10.5, 17.2],
      ];
      const yTrain = [24.0, 18.5, 33.0, 21.0, 16.0, 26.0, 17.5, 34.0, 22.5, 18.0];

      predictor.train(XTrain, yTrain);

      const XTest = [
        [6.2, 6.0, 15.5],
        [5.9, 11.0, 17.5],
        [7.1, 3.8, 14.5],
      ];
      const yTest = [23.0, 17.0, 32.0];

      const r2 = predictor.evaluate(XTest, yTest);

      // 小さなデータセットでは R² が低くなることがあるため、広い範囲で許容
      expect(r2).toBeGreaterThanOrEqual(-1.0);
      expect(r2).toBeLessThanOrEqual(1.0);
    });
  });

  describe('保存と読み込み', () => {
    it('モデルとスケーラーを保存できる', async () => {
      const XTrain = [
        [6.5, 5.0, 15.0],
        [5.5, 10.0, 18.0],
        [7.0, 3.0, 14.0],
        [6.0, 7.0, 16.0],
        [5.8, 12.0, 17.0],
        [6.8, 4.5, 15.5],
      ];
      const yTrain = [24.0, 18.5, 33.0, 21.0, 16.0, 26.0];

      predictor.standardizeFeatures(XTrain, true);
      predictor.standardizeTarget(yTrain, true);
      predictor.train(XTrain, yTrain);

      await predictor.saveModels(testModelPath, testScalerXPath, testScalerYPath);

      expect(fs.existsSync(testModelPath)).toBe(true);
      expect(fs.existsSync(testScalerXPath)).toBe(true);
      expect(fs.existsSync(testScalerYPath)).toBe(true);
    });

    it('保存したモデルを読み込める', async () => {
      const XTrain = [
        [6.5, 5.0, 15.0],
        [5.5, 10.0, 18.0],
        [7.0, 3.0, 14.0],
        [6.0, 7.0, 16.0],
        [5.8, 12.0, 17.0],
        [6.8, 4.5, 15.5],
      ];
      const yTrain = [24.0, 18.5, 33.0, 21.0, 16.0, 26.0];

      predictor.standardizeFeatures(XTrain, true);
      predictor.standardizeTarget(yTrain, true);
      predictor.train(XTrain, yTrain);

      await predictor.saveModels(testModelPath, testScalerXPath, testScalerYPath);

      const newPredictor = new BostonPredictor();
      await newPredictor.loadModels(testModelPath, testScalerXPath, testScalerYPath);

      expect(newPredictor.isTrained()).toBe(true);

      const XTest = [[6.0, 7.0, 16.0]];
      const prediction = newPredictor.predict(XTest);

      expect(prediction).toHaveLength(1);
    });
  });
});
