import { describe, it, expect, beforeEach } from 'vitest';
import { IrisDomain, CinemaDomain, SurvivedDomain, BostonDomain } from '../src/domain';

describe('Domain Layer', () => {
  describe('IrisDomain', () => {
    let domain: IrisDomain;

    beforeEach(() => {
      domain = new IrisDomain('models/iris_classifier.json');
    });

    it('モデルを読み込める', async () => {
      await expect(domain.loadModel()).resolves.not.toThrow();
    });

    it('予測を実行できる', async () => {
      await domain.loadModel();
      const features = [[5.1, 3.5, 1.4, 0.2]];
      const predictions = domain.predict(features);

      expect(predictions).toHaveLength(1);
      expect(['setosa', 'versicolor', 'virginica']).toContain(predictions[0]);
    });

    it('モデルが読み込まれていない場合エラーを返す', () => {
      const features = [[5.1, 3.5, 1.4, 0.2]];
      expect(() => domain.predict(features)).toThrow('Model not loaded');
    });
  });

  describe('CinemaDomain', () => {
    let domain: CinemaDomain;

    beforeEach(() => {
      domain = new CinemaDomain('models/cinema_predictor.json');
    });

    it('モデルを読み込める', async () => {
      await expect(domain.loadModel()).resolves.not.toThrow();
    });

    it('予測を実行できる', async () => {
      await domain.loadModel();
      const features = [[500, 300, 70, 1]];
      const predictions = domain.predict(features);

      expect(predictions).toHaveLength(1);
      expect(predictions[0]).toBeGreaterThan(0);
    });

    it('モデルが読み込まれていない場合エラーを返す', () => {
      const features = [[500, 300, 70, 1]];
      expect(() => domain.predict(features)).toThrow('Model not loaded');
    });
  });

  describe('SurvivedDomain', () => {
    let domain: SurvivedDomain;

    beforeEach(() => {
      domain = new SurvivedDomain('models/survived_classifier.json');
    });

    it('モデルを読み込める', async () => {
      await expect(domain.loadModel()).resolves.not.toThrow();
    });

    it('予測を実行できる', async () => {
      await domain.loadModel();
      // [Pclass, Age, male] の順
      const features = [[3, 22, 1]];
      const predictions = domain.predict(features);

      expect(predictions).toHaveLength(1);
      expect([0, 1]).toContain(predictions[0]);
    });

    it('モデルが読み込まれていない場合エラーを返す', () => {
      const features = [[3, 22, 1]];
      expect(() => domain.predict(features)).toThrow('Model not loaded');
    });
  });

  // TODO: BostonPredictor に save/load メソッドを追加後に有効化
  describe.skip('BostonDomain', () => {
    let domain: BostonDomain;

    beforeEach(() => {
      domain = new BostonDomain('models/boston_predictor.json');
    });

    it('モデルを読み込める', async () => {
      await expect(domain.loadModel()).resolves.not.toThrow();
    });

    it('予測を実行できる', async () => {
      await domain.loadModel();
      // Boston モデルは特徴量エンジニアリング後の形式
      // [RM, LSTAT, PTRATIO, RM2, LSTAT2, PTRATIO2, RM_LSTAT]
      const rm = 6.5,
        lstat = 4.98,
        ptratio = 15.3;
      const features = [
        [rm, lstat, ptratio, rm ** 2, lstat ** 2, ptratio ** 2, rm * lstat],
      ];
      const predictions = domain.predict(features);

      expect(predictions).toHaveLength(1);
      expect(predictions[0]).toBeGreaterThan(0);
    });

    it('モデルが読み込まれていない場合エラーを返す', () => {
      const rm = 6.5,
        lstat = 4.98,
        ptratio = 15.3;
      const features = [
        [rm, lstat, ptratio, rm ** 2, lstat ** 2, ptratio ** 2, rm * lstat],
      ];
      expect(() => domain.predict(features)).toThrow('Model not loaded');
    });
  });
});
