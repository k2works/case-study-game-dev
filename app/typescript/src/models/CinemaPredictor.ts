import { DataFrame } from 'data-forge';
import * as fs from 'fs';
import { SimpleLinearRegression } from 'ml-regression-simple-linear';

/**
 * Cinema 興行収入予測モデル
 * 線形回帰を使用して、映画の予算と上映時間から興行収入を予測する
 */
export class CinemaPredictor {
  private trained: boolean = false;
  private data?: DataFrame;
  private X_train?: number[][];
  private y_train?: number[];
  private X_test?: number[][];
  private y_test?: number[];
  private featureNames: string[] = ['budget', 'runtime'];
  private models: SimpleLinearRegression[] = [];

  /**
   * CSVファイルからデータを読み込む
   */
  async loadData(filePath: string): Promise<void> {
    const fileContent = await fs.promises.readFile(filePath, 'utf-8');

    // CSV を手動でパース（CRLF と LF の両方に対応）
    const lines = fileContent.trim().split(/\r?\n/);
    const headers = lines[0].split(',').map((h) => h.trim());

    const rows = lines.slice(1).map((line) => {
      const values = line.split(',').map((v) => v.trim());
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = values[index];
      });
      return obj;
    });

    this.data = new DataFrame(rows);
  }

  /**
   * データを訓練用とテスト用に分割する
   */
  splitData(testSize: number = 0.2): void {
    if (!this.data) {
      throw new Error('Data not loaded. Call loadData() first.');
    }

    // データを配列に変換してシャッフル
    const dataArray = this.data.toArray();
    const shuffled = this.shuffleArray(dataArray);

    // 分割ポイントを計算
    const totalSize = shuffled.length;
    const trainSize = Math.floor(totalSize * (1 - testSize));

    // 訓練データとテストデータに分割
    const trainArray = shuffled.slice(0, trainSize);
    const testArray = shuffled.slice(trainSize);

    const trainData = new DataFrame(trainArray);
    const testData = new DataFrame(testArray);

    // 特徴量とラベルを抽出
    this.X_train = this.extractFeatures(trainData);
    this.y_train = this.extractTarget(trainData);
    this.X_test = this.extractFeatures(testData);
    this.y_test = this.extractTarget(testData);
  }

  /**
   * 配列をシャッフルする（Fisher-Yates アルゴリズム）
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * 特徴量を抽出する
   */
  private extractFeatures(data: DataFrame): number[][] {
    const rows = data.toArray();
    return rows.map((row: any) => this.featureNames.map((name) => Number(row[name])));
  }

  /**
   * ターゲット（収益）を抽出する
   */
  private extractTarget(data: DataFrame): number[] {
    const rows = data.toArray();
    return rows.map((row: any) => Number(row.revenue));
  }

  /**
   * IQR法で外れ値のインデックスを検出
   * IQR = Q3 - Q1
   * 外れ値 = Q1 - 1.5*IQR より小さい、または Q3 + 1.5*IQR より大きい
   */
  detectOutliers(data: number[]): number[] {
    const sorted = [...data].sort((a, b) => a - b);
    const q1Index = Math.floor(sorted.length * 0.25);
    const q3Index = Math.floor(sorted.length * 0.75);

    const q1 = sorted[q1Index];
    const q3 = sorted[q3Index];
    const iqr = q3 - q1;

    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    const outlierIndices: number[] = [];
    data.forEach((value, index) => {
      if (value < lowerBound || value > upperBound) {
        outlierIndices.push(index);
      }
    });

    return outlierIndices;
  }

  /**
   * 訓練データから外れ値を除去
   */
  removeOutliers(): void {
    if (!this.X_train || !this.y_train) {
      throw new Error('Data not split. Call splitData() first.');
    }

    // y_train（収益）の外れ値を検出
    const outlierIndices = this.detectOutliers(this.y_train);

    // 外れ値以外のデータだけを残す
    const cleanX: number[][] = [];
    const cleanY: number[] = [];

    this.X_train.forEach((x, index) => {
      if (!outlierIndices.includes(index)) {
        cleanX.push(x);
        cleanY.push(this.y_train![index]);
      }
    });

    this.X_train = cleanX;
    this.y_train = cleanY;
  }

  /**
   * 線形回帰モデルを訓練する
   */
  async train(): Promise<void> {
    if (!this.X_train || !this.y_train) {
      throw new Error('Data not split. Call splitData() first.');
    }

    // 各特徴量に対して単純線形回帰モデルを作成
    this.models = [];

    for (let i = 0; i < this.featureNames.length; i++) {
      const x = this.X_train.map((row) => row[i]);
      const model = new SimpleLinearRegression(x, this.y_train);
      this.models.push(model);
    }

    this.trained = true;
  }

  /**
   * 単一のデータを予測する
   */
  predictOne(features: number[]): number {
    if (!this.trained || this.models.length === 0) {
      throw new Error('Model not trained. Call train() first.');
    }

    // 各モデルの予測の平均を取る（簡易的なアンサンブル）
    let sum = 0;
    for (let i = 0; i < this.models.length; i++) {
      sum += this.models[i].predict(features[i]);
    }

    return sum / this.models.length;
  }

  /**
   * 複数のデータを予測する
   */
  predict(featuresList: number[][]): number[] {
    return featuresList.map((features) => this.predictOne(features));
  }

  /**
   * モデルの性能を評価する
   */
  evaluate(): { rmse: number; mae: number; r2: number } {
    if (!this.X_test || !this.y_test || !this.trained) {
      throw new Error('Model not trained or test data not available.');
    }

    const predictions = this.predict(this.X_test);

    return {
      rmse: this.calculateRMSE(predictions, this.y_test),
      mae: this.calculateMAE(predictions, this.y_test),
      r2: this.calculateR2(predictions, this.y_test),
    };
  }

  /**
   * RMSE (Root Mean Squared Error) を計算
   * 予測誤差の二乗平均の平方根
   */
  private calculateRMSE(predictions: number[], actual: number[]): number {
    const mse =
      predictions.reduce((sum, pred, i) => {
        const error = pred - actual[i];
        return sum + error * error;
      }, 0) / predictions.length;

    return Math.sqrt(mse);
  }

  /**
   * MAE (Mean Absolute Error) を計算
   * 予測誤差の絶対値の平均
   */
  private calculateMAE(predictions: number[], actual: number[]): number {
    return (
      predictions.reduce((sum, pred, i) => {
        return sum + Math.abs(pred - actual[i]);
      }, 0) / predictions.length
    );
  }

  /**
   * R² (決定係数) を計算
   * 1に近いほど良いモデル、0に近いと予測精度が低い
   */
  private calculateR2(predictions: number[], actual: number[]): number {
    const mean = actual.reduce((sum, val) => sum + val, 0) / actual.length;

    const totalSS = actual.reduce((sum, val) => {
      const diff = val - mean;
      return sum + diff * diff;
    }, 0);

    const residualSS = predictions.reduce((sum, pred, i) => {
      const diff = pred - actual[i];
      return sum + diff * diff;
    }, 0);

    return 1 - residualSS / totalSS;
  }

  /**
   * 訓練済みモデルを保存する
   */
  async save(filePath: string): Promise<void> {
    if (!this.trained) {
      throw new Error('Model not trained. Call train() first.');
    }

    const modelData = {
      trained: this.trained,
      featureNames: this.featureNames,
      models: this.models.map((model) => ({
        slope: model.slope,
        intercept: model.intercept,
      })),
    };

    await fs.promises.writeFile(filePath, JSON.stringify(modelData, null, 2));
  }

  /**
   * 保存したモデルを読み込む
   */
  async load(filePath: string): Promise<void> {
    const fileContent = await fs.promises.readFile(filePath, 'utf-8');
    const modelData = JSON.parse(fileContent);

    this.trained = modelData.trained;
    this.featureNames = modelData.featureNames;
    this.models = modelData.models.map((data: any) => {
      // SimpleLinearRegression を再構築
      // ダミーデータで初期化してから、slope と intercept を上書き
      const model = new SimpleLinearRegression([0, 1], [0, 1]);
      (model as any).slope = data.slope;
      (model as any).intercept = data.intercept;
      return model;
    });
  }

  /**
   * データサイズを取得
   */
  getDataSize(): number {
    return this.data?.count() || 0;
  }

  /**
   * 特徴量名を取得
   */
  getFeatureNames(): string[] {
    return this.featureNames;
  }

  /**
   * 訓練データサイズを取得
   */
  getTrainSize(): number {
    return this.X_train?.length || 0;
  }

  /**
   * テストデータサイズを取得
   */
  getTestSize(): number {
    return this.X_test?.length || 0;
  }

  /**
   * モデルが訓練済みかどうか
   */
  isTrained(): boolean {
    return this.trained;
  }
}
