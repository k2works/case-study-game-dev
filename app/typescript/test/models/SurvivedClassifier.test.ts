import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SurvivedClassifier } from '../../src/models/SurvivedClassifier';
import { DataFrame } from 'data-forge';
import * as fs from 'fs';

describe('SurvivedClassifier', () => {
  let classifier: SurvivedClassifier;
  const testDataPath = 'data/survived.csv';
  const testModelPath = 'models/test_survived_classifier.json';

  beforeEach(() => {
    classifier = new SurvivedClassifier();
  });

  afterEach(async () => {
    // テスト用モデルファイルを削除
    if (fs.existsSync(testModelPath)) {
      await fs.promises.unlink(testModelPath);
    }
  });

  describe('初期化', () => {
    it('デフォルトパラメータで初期化できる', () => {
      expect(classifier).toBeInstanceOf(SurvivedClassifier);
      expect(classifier.maxDepth).toBe(9);
      expect(classifier.isTrained()).toBe(false);
    });

    it('カスタムパラメータで初期化できる', () => {
      const customClassifier = new SurvivedClassifier({ maxDepth: 5 });
      expect(customClassifier.maxDepth).toBe(5);
    });

    it('max_depth が 1 未満の場合エラー', () => {
      expect(() => {
        new SurvivedClassifier({ maxDepth: 0 });
      }).toThrow('max_depth must be at least 1');
    });
  });

  describe('データ読み込み', () => {
    it('CSV ファイルが正常に読み込める', async () => {
      const { X, y } = await classifier.loadData(testDataPath, false);

      expect(X.count()).toBeGreaterThan(0);
      expect(y.count()).toBeGreaterThan(0);
      expect(X.getColumnNames()).not.toContain('Survived');
    });

    it('ファイルが存在しない場合エラー', async () => {
      await expect(classifier.loadData('nonexistent.csv')).rejects.toThrow();
    });
  });

  describe('Age 欠損値補完', () => {
    it('欠損値がない場合は変更なし', () => {
      const df = new DataFrame([
        { Pclass: 1, Age: 22.0, Survived: 0 },
        { Pclass: 2, Age: 38.0, Survived: 1 },
        { Pclass: 3, Age: 26.0, Survived: 0 },
      ]);

      const processed = (classifier as any).preprocessAge(df);
      const ages = processed.getSeries('Age').toArray();

      expect(ages).toEqual([22.0, 38.0, 26.0]);
    });

    it('全グループの年齢補完が正しい', () => {
      const df = new DataFrame([
        { Pclass: 1, Age: null, Survived: 0 },
        { Pclass: 1, Age: null, Survived: 1 },
        { Pclass: 2, Age: null, Survived: 0 },
        { Pclass: 2, Age: null, Survived: 1 },
        { Pclass: 3, Age: null, Survived: 0 },
        { Pclass: 3, Age: null, Survived: 1 },
      ]);

      const processed = (classifier as any).preprocessAge(df);
      const ages = processed.getSeries('Age').toArray();

      expect(ages).toEqual([43, 35, 33, 25, 26, 20]);
    });

    it('一部のみ欠損値がある場合', () => {
      const df = new DataFrame([
        { Pclass: 1, Age: null, Survived: 0 },
        { Pclass: 1, Age: 30.0, Survived: 1 },
        { Pclass: 2, Age: 25.0, Survived: 0 },
        { Pclass: 2, Age: null, Survived: 1 },
      ]);

      const processed = (classifier as any).preprocessAge(df);
      const ages = processed.getSeries('Age').toArray();

      expect(ages[0]).toBe(43); // 補完
      expect(ages[1]).toBe(30.0); // 元のまま
      expect(ages[2]).toBe(25.0); // 元のまま
      expect(ages[3]).toBe(25); // 補完
    });
  });

  describe('カテゴリカル変数エンコーディング', () => {
    it('Sex 列が male 列に変換される', () => {
      const df = new DataFrame([
        { Pclass: 1, Sex: 'male', Survived: 0 },
        { Pclass: 2, Sex: 'female', Survived: 1 },
        { Pclass: 3, Sex: 'male', Survived: 0 },
      ]);

      const encoded = (classifier as any).encodeCategorical(df);

      expect(encoded.getColumnNames()).toContain('male');
      expect(encoded.getColumnNames()).not.toContain('Sex');
    });

    it('male 列の値が正しい', () => {
      const df = new DataFrame([
        { Sex: 'male' },
        { Sex: 'female' },
        { Sex: 'male' },
        { Sex: 'female' },
      ]);

      const encoded = (classifier as any).encodeCategorical(df);
      const maleValues = encoded.getSeries('male').toArray();

      expect(maleValues).toEqual([1, 0, 1, 0]);
    });

    it('他の列は保持される', () => {
      const df = new DataFrame([
        { Pclass: 1, Age: 22.0, Sex: 'male', Survived: 0 },
        { Pclass: 2, Age: 38.0, Sex: 'female', Survived: 1 },
      ]);

      const encoded = (classifier as any).encodeCategorical(df);

      expect(encoded.getColumnNames()).toContain('Pclass');
      expect(encoded.getColumnNames()).toContain('Age');
      expect(encoded.getColumnNames()).toContain('Survived');
      expect(encoded.getSeries('Pclass').toArray()).toEqual([1, 2]);
      expect(encoded.getSeries('Age').toArray()).toEqual([22.0, 38.0]);
    });
  });

  describe('モデル訓練', () => {
    it('モデルが訓練される', () => {
      const X = [
        [1, 22.0, 1, 0, 7.25, 1],
        [2, 38.0, 1, 0, 71.28, 0],
        [3, 26.0, 0, 0, 7.92, 1],
      ];
      const y = [0, 1, 0];

      classifier.train(X, y);

      expect(classifier.isTrained()).toBe(true);
    });

    it('max_depth パラメータが適用される', () => {
      const customClassifier = new SurvivedClassifier({ maxDepth: 5 });
      const X = [
        [1, 22.0, 1, 0, 7.25, 1],
        [2, 38.0, 1, 0, 71.28, 0],
        [3, 26.0, 0, 0, 7.92, 1],
      ];
      const y = [0, 1, 0];

      customClassifier.train(X, y);

      expect(customClassifier.maxDepth).toBe(5);
      expect(customClassifier.isTrained()).toBe(true);
    });
  });

  describe('予測', () => {
    beforeEach(() => {
      const X = [
        [1, 22.0, 1, 0, 7.25, 1],
        [2, 38.0, 1, 0, 71.28, 0],
        [3, 26.0, 0, 0, 7.92, 1],
        [1, 35.0, 0, 0, 53.1, 0],
      ];
      const y = [0, 1, 0, 1];

      classifier.train(X, y);
    });

    it('単一のデータを予測できる', () => {
      const prediction = classifier.predict([[1, 30.0, 0, 0, 50.0, 0]]);

      expect(prediction).toHaveLength(1);
      expect(prediction[0]).toBeOneOf([0, 1]);
    });

    it('複数のデータを一度に予測できる', () => {
      const predictions = classifier.predict([
        [1, 30.0, 0, 0, 50.0, 0],
        [3, 25.0, 0, 0, 8.0, 1],
      ]);

      expect(predictions).toHaveLength(2);
      expect(predictions[0]).toBeOneOf([0, 1]);
      expect(predictions[1]).toBeOneOf([0, 1]);
    });

    it('訓練されていない状態で予測するとエラー', () => {
      const untrainedClassifier = new SurvivedClassifier();
      const X = [[1, 22.0, 1, 0, 7.25, 1]];

      expect(() => {
        untrainedClassifier.predict(X);
      }).toThrow('Model has not been trained yet');
    });
  });

  describe('評価', () => {
    it('モデルの正解率を計算できる', async () => {
      await classifier.loadData(testDataPath);

      classifier.splitData(0.2);
      await classifier.train();

      const accuracy = classifier.evaluate();

      expect(accuracy).toBeGreaterThanOrEqual(0.6); // 60%以上の正解率を期待
      expect(accuracy).toBeLessThanOrEqual(1.0);
    });
  });

  describe('保存と読み込み', () => {
    it('訓練済みモデルを保存できる', async () => {
      await classifier.loadData(testDataPath);
      classifier.splitData(0.2);
      await classifier.train();

      await classifier.save(testModelPath);

      expect(fs.existsSync(testModelPath)).toBe(true);
    });

    it('保存したモデルを読み込める', async () => {
      // まずモデルを訓練して保存
      await classifier.loadData(testDataPath);
      classifier.splitData(0.2);
      await classifier.train();
      await classifier.save(testModelPath);

      // 新しいインスタンスで読み込み
      const newClassifier = new SurvivedClassifier();
      await newClassifier.load(testModelPath);

      expect(newClassifier.isTrained()).toBe(true);

      const prediction = newClassifier.predict([[1, 30.0, 0, 0, 50.0, 0]]);
      expect(prediction).toHaveLength(1);
    });
  });
});
