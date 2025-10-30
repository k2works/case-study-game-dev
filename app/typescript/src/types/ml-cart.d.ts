declare module 'ml-cart' {
  export interface DecisionTreeOptions {
    maxDepth?: number;
    minNumSamples?: number;
    gainFunction?: string;
  }

  export class DecisionTreeClassifier {
    constructor(options?: DecisionTreeOptions);
    train(features: number[][], labels: number[]): void;
    predict(features: number[][]): number[];
    toJSON(): any;
    static load(model: any): DecisionTreeClassifier;
  }

  export class DecisionTreeRegression {
    constructor(options?: DecisionTreeOptions);
    train(features: number[][], labels: number[]): void;
    predict(features: number[][]): number[];
    toJSON(): any;
    static load(model: any): DecisionTreeRegression;
  }
}
