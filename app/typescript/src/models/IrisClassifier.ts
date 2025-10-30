import { DataFrame } from 'data-forge';
import * as fs from 'fs';
import { DecisionTreeClassifier } from 'ml-cart';

export class IrisClassifier {
  private trained: boolean = false;
  private data?: DataFrame;
  private X_train?: number[][];
  private y_train?: number[];
  private X_test?: number[][];
  private y_test?: number[];
  private model?: DecisionTreeClassifier;
  private featureNames: string[] = [
    'sepal_length',
    'sepal_width',
    'petal_length',
    'petal_width',
  ];
  private labelMap: Map<string, number> = new Map([
    ['setosa', 0],
    ['versicolor', 1],
    ['virginica', 2],
  ]);
  private reverseLabelMap: Map<number, string> = new Map([
    [0, 'setosa'],
    [1, 'versicolor'],
    [2, 'virginica'],
  ]);

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

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private extractFeatures(data: DataFrame): number[][] {
    const rows = data.toArray();
    return rows.map((row: any) => this.featureNames.map((name) => Number(row[name])));
  }

  private extractLabels(data: DataFrame): number[] {
    const rows = data.toArray();
    return rows.map((row: any) => this.labelMap.get(row.species)!);
  }

  async train(maxDepth: number = 5): Promise<void> {
    if (!this.X_train || !this.y_train) {
      throw new Error('Data not split. Call splitData() first.');
    }

    this.model = new DecisionTreeClassifier({
      maxDepth,
    });

    this.model.train(this.X_train, this.y_train);
    this.trained = true;
  }

  predictOne(features: number[]): string {
    if (!this.trained || !this.model) {
      throw new Error('Model not trained. Call train() first.');
    }

    const prediction = this.model.predict([features])[0];
    return this.reverseLabelMap.get(prediction)!;
  }

  predict(featuresList: number[][]): string[] {
    if (!this.trained || !this.model) {
      throw new Error('Model not trained. Call train() first.');
    }

    const predictions = this.model.predict(featuresList);
    return predictions.map((p: number) => this.reverseLabelMap.get(p)!);
  }

  evaluate(): number {
    if (!this.X_test || !this.y_test || !this.trained) {
      throw new Error('Model not trained or test data not available.');
    }

    const predictions = this.model!.predict(this.X_test);
    let correct = 0;

    for (let i = 0; i < this.y_test.length; i++) {
      if (predictions[i] === this.y_test[i]) {
        correct++;
      }
    }

    return correct / this.y_test.length;
  }

  async save(filePath: string): Promise<void> {
    if (!this.trained || !this.model) {
      throw new Error('Model not trained. Cannot save.');
    }

    const modelData = {
      model: this.model.toJSON(),
      featureNames: this.featureNames,
      labelMap: Array.from(this.labelMap.entries()),
    };

    await fs.promises.writeFile(filePath, JSON.stringify(modelData, null, 2), 'utf-8');
  }

  async load(filePath: string): Promise<void> {
    const fileContent = await fs.promises.readFile(filePath, 'utf-8');
    const modelData = JSON.parse(fileContent);

    this.model = DecisionTreeClassifier.load(modelData.model);
    this.featureNames = modelData.featureNames;
    this.labelMap = new Map(modelData.labelMap);
    this.trained = true;
  }

  getDataSize(): number {
    return this.data?.count() || 0;
  }

  getFeatureNames(): string[] {
    return this.featureNames;
  }

  getTrainSize(): number {
    return this.X_train?.length || 0;
  }

  getTestSize(): number {
    return this.X_test?.length || 0;
  }

  isTrained(): boolean {
    return this.trained;
  }
}
