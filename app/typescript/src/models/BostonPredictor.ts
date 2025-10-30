import { DataFrame, IDataFrame } from 'data-forge';
import * as fs from 'fs';

interface StandardScaler {
  mean: number[];
  std: number[];
}

interface MultipleLinearRegression {
  weights: number[];
  bias: number;
}

/**
 * Boston 住宅価格予測モデル
 * 高度な回帰問題の実装（特徴量エンジニアリング + データ標準化）
 */
export class BostonPredictor {
  private model: MultipleLinearRegression | null = null;
  private scalerX: StandardScaler | null = null;
  private scalerY: StandardScaler | null = null;
  private trainMean: { [key: string]: number } | null = null;

  isTrained(): boolean {
    return this.model !== null;
  }

  /**
   * CSVファイルからデータを読み込む
   */
  async loadData(filePath: string): Promise<IDataFrame> {
    // ファイルの存在確認
    try {
      await fs.promises.access(filePath);
    } catch {
      throw new Error(`File not found: ${filePath}`);
    }

    // データの読み込み
    const fileContent = await fs.promises.readFile(filePath, 'utf-8');

    // CSV を手動でパース（CRLF と LF の両方に対応）
    const lines = fileContent.trim().split(/\r?\n/);
    const headers = lines[0].split(',').map((h) => h.trim());

    const rows = lines.slice(1).map((line) => {
      const values = line.split(',').map((v) => v.trim());
      const obj: any = {};
      headers.forEach((header, index) => {
        const value = values[index];
        // 空文字列を null に変換
        obj[header] = value === '' ? null : value;
      });
      return obj;
    });

    const df = new DataFrame(rows);

    // 必要な列の存在確認
    const requiredColumns = ['RM', 'LSTAT', 'PTRATIO', 'CRIME', 'PRICE'];
    const actualColumns = df.getColumnNames();
    const missingColumns = requiredColumns.filter(
      (col) => !actualColumns.includes(col)
    );

    if (missingColumns.length > 0) {
      throw new Error(`Missing columns: ${missingColumns.join(', ')}`);
    }

    return df;
  }

  /**
   * CRIME 列をダミー変数に変換
   * drop_first=true により、'low' を基準とし、
   * それ以外のカテゴリのダミー変数を作成
   */
  // @ts-expect-error - Used in tests via (predictor as any).encodeCrime()
  private encodeCrime(df: IDataFrame): IDataFrame {
    const uniqueCategories = df.getSeries('CRIME').distinct().toArray().sort();

    // 'low' を除外したカテゴリでダミー変数を作成
    const dummyCategories = uniqueCategories.filter((cat) => cat !== 'low');

    const encoded = df.select((row) => {
      const newRow: any = {};
      Object.keys(row).forEach((key) => {
        if (key !== 'CRIME') {
          newRow[key] = row[key];
        }
      });

      // 各ダミーカテゴリの列を作成
      dummyCategories.forEach((category) => {
        newRow[category] = row.CRIME === category ? 1 : 0;
      });

      return newRow;
    });

    return new DataFrame(encoded.toArray());
  }

  /**
   * 欠損値を平均値で補完
   */
  // @ts-expect-error - Used in tests via (predictor as any).fillMissingValues()
  private fillMissingValues(df: IDataFrame, fit: boolean = true): IDataFrame {
    if (fit) {
      // 訓練データの平均値を計算して保存
      const means: { [key: string]: number } = {};
      df.getColumnNames().forEach((col) => {
        const series = df.getSeries(col);
        const values = series
          .toArray()
          .filter((v) => v !== null && !isNaN(v as number));
        means[col] =
          (values.reduce((a, b) => (a as number) + (b as number), 0) as number) /
          values.length;
      });
      this.trainMean = means;
    }

    if (!this.trainMean) {
      throw new Error('train_mean not set. Call with fit=true first.');
    }

    const filled = df.select((row) => {
      const newRow: any = {};
      Object.keys(row).forEach((key) => {
        if (
          row[key] === null ||
          row[key] === undefined ||
          row[key] === '' ||
          isNaN(row[key] as number)
        ) {
          newRow[key] = this.trainMean![key];
        } else {
          newRow[key] = Number(row[key]);
        }
      });
      return newRow;
    });

    return new DataFrame(filled.toArray());
  }

  /**
   * 外れ値を除外
   * インデックス 76 のデータポイントを外れ値として除外
   */
  // @ts-expect-error - Used in tests via (predictor as any).removeOutliers()
  private removeOutliers(df: IDataFrame): IDataFrame {
    const dataArray = df.toArray();

    // 配列のインデックス 76 のデータポイントを除外
    const filtered = dataArray.filter((_, index) => index !== 76);

    return new DataFrame(filtered);
  }

  /**
   * 特徴量エンジニアリング（2乗項と交互作用項の追加）
   * - 2乗項: RM2, LSTAT2, PTRATIO2
   * - 交互作用項: RM_LSTAT
   * 合計7個の特徴量を生成
   */
  featureEngineering(X: IDataFrame): IDataFrame {
    const engineered = X.select((row) => {
      return {
        ...row,
        RM2: row.RM ** 2,
        LSTAT2: row.LSTAT ** 2,
        PTRATIO2: row.PTRATIO ** 2,
        RM_LSTAT: row.RM * row.LSTAT,
      };
    });

    return new DataFrame(engineered.toArray());
  }

  /**
   * 特徴量を標準化
   */
  standardizeFeatures(X: number[][], fit: boolean = true): number[][] {
    if (fit) {
      // 各列の平均と標準偏差を計算
      const numFeatures = X[0].length;
      const means: number[] = [];
      const stds: number[] = [];

      for (let i = 0; i < numFeatures; i++) {
        const col = X.map((row) => row[i]);
        const mean = col.reduce((a, b) => a + b, 0) / col.length;
        const variance = col.reduce((a, b) => a + (b - mean) ** 2, 0) / col.length;
        const std = Math.sqrt(variance);

        means.push(mean);
        stds.push(std);
      }

      this.scalerX = { mean: means, std: stds };
    }

    if (!this.scalerX) {
      throw new Error('Scaler not fitted yet. Call with fit=true first.');
    }

    // 標準化を適用
    return X.map((row) =>
      row.map((val, i) => (val - this.scalerX!.mean[i]) / this.scalerX!.std[i])
    );
  }

  /**
   * 目的変数を標準化
   */
  standardizeTarget(y: number[], fit: boolean = true): number[] {
    if (fit) {
      const mean = y.reduce((a, b) => a + b, 0) / y.length;
      const variance = y.reduce((a, b) => a + (b - mean) ** 2, 0) / y.length;
      const std = Math.sqrt(variance);

      this.scalerY = { mean: [mean], std: [std] };
    }

    if (!this.scalerY) {
      throw new Error('Scaler not fitted yet. Call with fit=true first.');
    }

    return y.map((val) => (val - this.scalerY!.mean[0]) / this.scalerY!.std[0]);
  }

  /**
   * 予測結果を元のスケールに戻す
   */
  inverseTransformPrediction(yPred: number[]): number[] {
    if (!this.scalerY) {
      throw new Error('scaler_y not set. Train the model first.');
    }

    return yPred.map((val) => val * this.scalerY!.std[0] + this.scalerY!.mean[0]);
  }

  /**
   * モデルを訓練する（多変量線形回帰）
   * 正規方程式を使用: w = (X^T X)^(-1) X^T y
   */
  train(XTrain: number[][], yTrain: number[]): void {
    // バイアス項を追加（切片）
    const XWithBias = XTrain.map((row) => [1, ...row]);

    // 転置行列を計算
    const XT = this.transpose(XWithBias);

    // XT * X を計算
    const XTX = this.matrixMultiply(XT, XWithBias);

    // 逆行列を計算
    const XTXInv = this.inverseMatrix(XTX);

    // XT * y を計算
    const XTy = this.matrixVectorMultiply(XT, yTrain);

    // w = (XT X)^(-1) XT y
    const weights = this.matrixVectorMultiply(XTXInv, XTy);

    this.model = {
      bias: weights[0],
      weights: weights.slice(1),
    };
  }

  /**
   * 予測を実行する
   */
  predict(XTest: number[][]): number[] {
    if (!this.model) {
      throw new Error('Model has not been trained yet. Call train() first.');
    }

    return XTest.map((row) => {
      const prediction =
        this.model!.bias +
        row.reduce((sum, val, i) => sum + val * this.model!.weights[i], 0);
      return prediction;
    });
  }

  /**
   * モデルを評価する（決定係数 R² を返す）
   */
  evaluate(XTest: number[][], yTest: number[]): number {
    if (!this.model) {
      throw new Error('Model has not been trained yet. Call train() first.');
    }

    const predictions = this.predict(XTest);

    // 平均値
    const yMean = yTest.reduce((a, b) => a + b, 0) / yTest.length;

    // 総平方和 (SST)
    const sst = yTest.reduce((sum, y) => sum + (y - yMean) ** 2, 0);

    // 残差平方和 (SSR)
    const ssr = yTest.reduce((sum, y, i) => sum + (y - predictions[i]) ** 2, 0);

    // 決定係数 R²
    const r2 = 1 - ssr / sst;

    return r2;
  }

  /**
   * モデルとスケーラーを保存
   */
  async saveModels(
    modelPath: string,
    scalerXPath: string,
    scalerYPath: string
  ): Promise<void> {
    if (!this.model || !this.scalerX || !this.scalerY) {
      throw new Error('Model or scalers have not been trained yet.');
    }

    const modelData = JSON.stringify(this.model, null, 2);
    const scalerXData = JSON.stringify(this.scalerX, null, 2);
    const scalerYData = JSON.stringify(this.scalerY, null, 2);

    await fs.promises.writeFile(modelPath, modelData);
    await fs.promises.writeFile(scalerXPath, scalerXData);
    await fs.promises.writeFile(scalerYPath, scalerYData);
  }

  /**
   * モデルとスケーラーを読み込み
   */
  async loadModels(
    modelPath: string,
    scalerXPath: string,
    scalerYPath: string
  ): Promise<void> {
    for (const path of [modelPath, scalerXPath, scalerYPath]) {
      try {
        await fs.promises.access(path);
      } catch {
        throw new Error(`File not found: ${path}`);
      }
    }

    const modelData = await fs.promises.readFile(modelPath, 'utf-8');
    const scalerXData = await fs.promises.readFile(scalerXPath, 'utf-8');
    const scalerYData = await fs.promises.readFile(scalerYPath, 'utf-8');

    this.model = JSON.parse(modelData);
    this.scalerX = JSON.parse(scalerXData);
    this.scalerY = JSON.parse(scalerYData);
  }

  // 行列演算のヘルパーメソッド

  private transpose(matrix: number[][]): number[][] {
    return matrix[0].map((_, colIndex) => matrix.map((row) => row[colIndex]));
  }

  private matrixMultiply(A: number[][], B: number[][]): number[][] {
    const result: number[][] = [];
    for (let i = 0; i < A.length; i++) {
      result[i] = [];
      for (let j = 0; j < B[0].length; j++) {
        let sum = 0;
        for (let k = 0; k < A[0].length; k++) {
          sum += A[i][k] * B[k][j];
        }
        result[i][j] = sum;
      }
    }
    return result;
  }

  private matrixVectorMultiply(A: number[][], v: number[]): number[] {
    return A.map((row) => row.reduce((sum, val, i) => sum + val * v[i], 0));
  }

  private inverseMatrix(matrix: number[][]): number[][] {
    // ガウスの消去法による逆行列計算（部分ピボット選択付き）
    const n = matrix.length;
    const augmented: number[][] = matrix.map((row, i) => [
      ...row,
      ...Array(n)
        .fill(0)
        .map((_, j) => (i === j ? 1 : 0)),
    ]);

    // 前進消去（部分ピボット選択）
    for (let i = 0; i < n; i++) {
      // ピボット選択：列iで最大の絶対値を持つ行を探す
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
          maxRow = k;
        }
      }

      // 行を交換
      if (maxRow !== i) {
        [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
      }

      // ピボットが0に近い場合、行列は特異行列
      if (Math.abs(augmented[i][i]) < 1e-10) {
        throw new Error('Matrix is singular or nearly singular');
      }

      // ピボット行を正規化
      const pivot = augmented[i][i];
      for (let j = 0; j < 2 * n; j++) {
        augmented[i][j] /= pivot;
      }

      // 他の行から引く
      for (let k = 0; k < n; k++) {
        if (k !== i) {
          const factor = augmented[k][i];
          for (let j = 0; j < 2 * n; j++) {
            augmented[k][j] -= factor * augmented[i][j];
          }
        }
      }
    }

    // 逆行列部分を抽出
    return augmented.map((row) => row.slice(n));
  }
}
