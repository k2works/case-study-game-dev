import { DataFrame, IDataFrame } from 'data-forge';
import * as fs from 'fs';
import { DecisionTreeClassifier } from 'ml-cart';

interface SurvivedClassifierOptions {
  maxDepth?: number;
}

interface AgeMapping {
  [key: string]: number;
}

/**
 * Survived 生存予測モデル
 * タイタニック号の乗客データから生存者を予測する分類モデル
 */
export class SurvivedClassifier {
  public readonly maxDepth: number;
  private model: DecisionTreeClassifier | null = null;
  private data?: DataFrame;
  private X_train?: number[][];
  private y_train?: number[];
  private X_test?: number[][];
  private y_test?: number[];
  private featureNames: string[] = ['Pclass', 'Age', 'SibSp', 'Parch', 'Fare', 'male'];

  constructor(options: SurvivedClassifierOptions = {}) {
    this.maxDepth = options.maxDepth ?? 9;

    if (this.maxDepth < 1) {
      throw new Error('max_depth must be at least 1');
    }
  }

  isTrained(): boolean {
    return this.model !== null;
  }

  /**
   * CSVファイルからデータを読み込む
   */
  async loadData(
    filePath: string,
    preprocess: boolean = true
  ): Promise<{ X: IDataFrame; y: IDataFrame }> {
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

    let df = new DataFrame(rows);

    // 必要な列の存在確認
    const requiredColumns = [
      'Pclass',
      'Age',
      'SibSp',
      'Parch',
      'Fare',
      'Sex',
      'Survived',
    ];
    const actualColumns = df.getColumnNames();
    const missingColumns = requiredColumns.filter(
      (col) => !actualColumns.includes(col)
    );

    if (missingColumns.length > 0) {
      throw new Error(`Missing columns: ${missingColumns.join(', ')}`);
    }

    // 前処理の実行（オプション）
    if (preprocess) {
      const preprocessed = this.preprocessData(df);
      df = new DataFrame(preprocessed.toArray());
    }

    // 特徴量と目的変数の分割
    let featureColumns = ['Pclass', 'Age', 'SibSp', 'Parch', 'Fare', 'male'];
    if (!preprocess) {
      featureColumns = ['Pclass', 'Age', 'SibSp', 'Parch', 'Fare', 'Sex'];
    }

    const X = df.subset(featureColumns);
    const y = df.getSeries('Survived');

    // データを保存
    this.data = df;

    return { X: X as any, y: y as any };
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
    this.y_train = this.extractLabels(trainData);
    this.X_test = this.extractFeatures(testData);
    this.y_test = this.extractLabels(testData);
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
   * ラベル（Survived）を抽出する
   */
  private extractLabels(data: DataFrame): number[] {
    const rows = data.toArray();
    return rows.map((row: any) => Number(row.Survived));
  }

  /**
   * データ前処理パイプライン
   */
  private preprocessData(df: IDataFrame): IDataFrame {
    let processed = this.preprocessAge(df);
    processed = this.encodeCategorical(processed);
    return processed;
  }

  /**
   * Age の欠損値を Pclass と Survived のグループ別中央値で補完
   */
  private preprocessAge(df: IDataFrame): IDataFrame {
    // グループ別の中央値マッピング
    const ageMapping: AgeMapping = {
      '1_0': 43,
      '1_1': 35,
      '2_0': 33,
      '2_1': 25,
      '3_0': 26,
      '3_1': 20,
    };

    // 欠損値を補完
    const processedData = df.select((row) => {
      const age = row.Age;
      if (age === null || age === undefined || age === '' || isNaN(Number(age))) {
        const key = `${row.Pclass}_${row.Survived}`;
        const medianAge = ageMapping[key];
        return { ...row, Age: medianAge };
      }
      return { ...row, Age: Number(age) };
    });

    return processedData;
  }

  /**
   * Sex をダミー変数に変換
   * drop_first=true により、male 列のみ作成（female は 0/1 で表現）
   * これにより多重共線性を回避
   */
  private encodeCategorical(df: IDataFrame): IDataFrame {
    const encoded = df.select((row) => {
      const male = row.Sex === 'male' ? 1 : 0;
      // Sex 列を除外して male 列を追加
      const result: any = {};
      Object.keys(row).forEach((key) => {
        if (key !== 'Sex') {
          result[key] = row[key];
        }
      });
      result.male = male;
      return result;
    });

    return encoded;
  }

  /**
   * モデルを訓練する
   */
  async train(): Promise<void>;
  // eslint-disable-next-line no-unused-vars
  train(x: number[][], y: number[]): void;
  async train(X?: number[][], y?: number[]): Promise<void> {
    // オーバーロードの実装
    if (X && y) {
      // 直接データを渡すケース
      this.model = new DecisionTreeClassifier({
        maxDepth: this.maxDepth,
        minNumSamples: 3,
      });

      this.model.train(X, y);
    } else {
      // loadData と splitData を使用するケース
      if (!this.X_train || !this.y_train) {
        throw new Error('Data not split. Call splitData() first.');
      }

      this.model = new DecisionTreeClassifier({
        maxDepth: this.maxDepth,
        minNumSamples: 3,
      });

      this.model.train(this.X_train, this.y_train);
    }
  }

  /**
   * 予測を実行する
   */
  predict(X: number[][]): number[] {
    if (this.model === null) {
      throw new Error('Model has not been trained yet. Call train() first.');
    }

    return this.model.predict(X);
  }

  /**
   * モデルを評価する（正解率を返す）
   */
  evaluate(): number {
    if (!this.X_test || !this.y_test || !this.model) {
      throw new Error('Model not trained or test data not available.');
    }

    const predictions = this.predict(this.X_test);
    const correct = predictions.filter((pred, i) => pred === this.y_test![i]).length;
    return correct / this.y_test.length;
  }

  /**
   * 訓練済みモデルをファイルに保存する
   */
  async save(filePath: string): Promise<void> {
    if (this.model === null) {
      throw new Error('Model has not been trained yet. Call train() first.');
    }

    const modelData = {
      maxDepth: this.maxDepth,
      model: this.model.toJSON(),
      featureNames: this.featureNames,
    };

    await fs.promises.writeFile(filePath, JSON.stringify(modelData, null, 2));
  }

  /**
   * 保存されたモデルをファイルから読み込む
   */
  async load(filePath: string): Promise<void> {
    try {
      await fs.promises.access(filePath);
    } catch {
      throw new Error(`Model file not found: ${filePath}`);
    }

    const fileContent = await fs.promises.readFile(filePath, 'utf-8');
    const modelData = JSON.parse(fileContent);

    this.model = DecisionTreeClassifier.load(modelData.model);
    this.featureNames = modelData.featureNames;
  }

  /**
   * データサイズを取得
   */
  getDataSize(): number {
    return this.data?.count() || 0;
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
}
