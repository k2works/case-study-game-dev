---
title: JavaScriptで学ぶ関数型プログラミング実践入門
description: 
published: true
date: 2025-07-26T05:06:52.223Z
tags: 
editor: markdown
dateCreated: 2025-07-26T05:06:52.223Z
---

# JavaScriptで学ぶ関数型プログラミング実践入門

### 1. はじめに
このプロジェクトのコードベースを参考に、JavaScript/TypeScriptにおける関数型プログラミングの基本的な概念と実践方法を解説します。特に、Lodash/fpのようなライブラリがどのように関数型プログラミングをサポートし、コードの可読性、保守性、テスト容易性を向上させるかを示します。

#### 関数型プログラミングとは？ なぜ今注目されているのか？
関数型プログラミング（Functional Programming, FP）は、プログラムを「関数」の組み合わせとして構築するプログラミングパラダイムです。状態の変更（ミューテーション）を避け、純粋な関数とイミュータブルなデータ構造を重視します。

近年、マルチコアプロセッサの普及や並行処理の重要性の高まりとともに、関数型プログラミングが再び注目されています。状態の変更を避けることで、並行処理における競合状態（race condition）のリスクを減らし、コードの予測可能性とテスト容易性を向上させることができます。

#### 本記事で扱う範囲
本記事では、以下の関数型プログラミングの主要な概念と、それらがどのようにプロジェクトのコードに適用されているかを解説します。

*   純粋関数 (Pure Functions)
*   イミュータビリティ (Immutability)
*   高階関数 (Higher-Order Functions)
*   カリー化 (Currying)
*   関数合成 (Function Composition) とパイプライン処理 (Pipelining)

#### 本プロジェクトにおける関数型プログラミングの採用背景（推測）
このプロジェクトのコードベース、特にテストコードにLodash/fpが多用されていることから、開発チーム内で関数型プログラミングの思想が共有され、その実践が推奨されていたと推測されます。これにより、コードの品質向上、特にテストのしやすさや保守性の面でメリットを享受しようとしたと考えられます。

### 2. 関数型プログラミングの基本概念

#### 純粋関数 (Pure Functions)
純粋関数とは、以下の2つの条件を満たす関数のことです。

1.  **同じ入力には常に同じ出力が返される（参照透過性）:** 関数は、引数以外の外部の状態に依存せず、また外部の状態を変更しません。
2.  **副作用がない:** 関数は、引数の変更、グローバル変数の変更、I/O操作（ファイルの読み書き、ネットワークリクエストなど）といった、関数の外部に影響を与える操作を行いません。

**なぜ純粋関数が重要なのか？**
*   **テスト容易性:** 副作用がなく、入力と出力が常に一対一で対応するため、テストが非常に簡単になります。
*   **並行処理:** 共有状態を変更しないため、複数の純粋関数を並行して実行しても競合状態が発生しません。
*   **推論のしやすさ:** 関数の動作が予測可能であるため、コードの理解やデバッグが容易になります。

**`src/app.ts` の `sum` 関数を例に解説**

```typescript
// src/app.ts
export function sum(a: number, b: number): number {
  return a + b;
}
```

`sum` 関数は、引数 `a` と `b` の値のみに依存し、常にその合計を返します。また、関数の外部の状態を変更することもありません。これは純粋関数の典型的な例です。

#### イミュータビリティ (Immutability)
イミュータビリティとは、「一度作成されたデータは変更できない」という特性のことです。データを変更する代わりに、変更を適用した新しいデータのコピーを作成します。

**なぜイミュータビリティが重要なのか？**
*   **状態変更の追跡:** データの変更履歴が明確になり、プログラムの状態がどのように変化したかを追跡しやすくなります。
*   **バグの削減:** 意図しない副作用や競合状態によるバグを防ぎます。
*   **並行処理の安全性:** 共有データが変更されないため、複数のスレッドやプロセスから安全にアクセスできます。

**Lodashのテストコードにおけるイミュータブルな操作の例**

`src/app.test.ts` のLodash/fpのテストでは、オブジェクト操作においてイミュータビリティが重視されています。

```typescript
// src/app.test.ts (Lodash/fpのテストより抜粋)
describe("オブジェクトに対する操作", () => {
  const fp = require("lodash/fp");
  const dataObject = { name: "Alice", age: 20, city: "New York" };

  test("fp.set", () => {
    // fp.set は元の dataObject を変更せず、新しいオブジェクトを返す
    const newObject = fp.set("age", 30)(dataObject);
    expect(newObject).toEqual({
      name: "Alice",
      age: 30,
      city: "New York",
    });
    expect(dataObject).toEqual({ name: "Alice", age: 20, city: "New York" }); // 元のオブジェクトは変更されない
  });

  test("fp.update", () => {
    // fp.update も元の dataObject を変更せず、新しいオブジェクトを返す
    const updatedObject = fp.update("name", (name: string) => name.toUpperCase())(dataObject);
    expect(updatedObject).toEqual({
      name: "ALICE",
      age: 20,
      city: "New York",
    });
    expect(dataObject).toEqual({ name: "Alice", age: 20, city: "New York" }); // 元のオブジェクトは変更されない
  });

  test("fp.merge", () => {
    // fp.merge も元の dataObject を変更せず、新しいオブジェクトを返す
    const mergedObject = fp.merge({ city: "Los Angeles", country: "USA" })(dataObject);
    expect(mergedObject).toEqual({
      name: "Alice",
      age: 20,
      city: "New York",
      country: "USA",
    });
    expect(dataObject).toEqual({ name: "Alice", age: 20, city: "New York" }); // 元のオブジェクトは変更されない
  });
});
```

`fp.set`、`fp.update`、`fp.merge` といった関数は、元の `dataObject` を直接変更するのではなく、変更が適用された新しいオブジェクトを返しています。これにより、元のデータが保護され、予期せぬ変更によるバグを防ぐことができます。

#### 高階関数 (Higher-Order Functions)
高階関数とは、以下のいずれか、または両方を満たす関数のことです。

1.  **関数を引数として受け取る**
2.  **関数を戻り値として返す**

JavaScriptでは、`map`、`filter`、`reduce` などが代表的な高階関数です。

**Lodashのテストコードにおける高階関数の利用例**

`src/app.test.ts` のLodashのテストには、高階関数の利用例が多数含まれています。

```typescript
// src/app.test.ts (Lodashのテストより抜粋)
describe("filter/map/reduce", () => {
  const _ = require("lodash");
  const dataList = ["A", "B", "C", "D", "E"];

  test("_.filter", () => {
    // フィルタリング関数を引数として受け取る
    expect(_.filter(dataList, (data: string) => data === "C" || data === "D")).toEqual(["C", "D"]);
  });

  test("_.map", () => {
    // マッピング関数を引数として受け取る
    expect(_.map(dataList, (data: string) => "X" + data)).toEqual(["XA", "XB", "XC", "XD", "XE"]);
  });

  test("_.reduce", () => {
    // リデューサー関数と初期値を引数として受け取る
    expect(_.reduce(dataList, (acc: string, val: string) => acc + val, "X")).toBe("XABCDE");
  });
});
```

これらの例では、`_.filter`、`_.map`、`_.reduce` が、それぞれフィルタリング、マッピング、集約のロジックを関数として受け取っています。これにより、汎用的な処理ロジックを再利用し、コードの柔軟性を高めることができます。

### 3. Lodash/fp を用いた実践

#### Lodash/fp の紹介
Lodash/fpは、Lodashの関数を関数型プログラミングの原則に沿って再設計したモジュールです。主な特徴は以下の通りです。

*   **データ優先ではなく関数優先（データ最後）:** 処理対象のデータが関数の最後の引数として渡されます。これにより、関数合成が容易になります。
*   **自動カリー化:** すべての関数が自動的にカリー化されています。
*   **イミュータビリティ:** すべての関数が元のデータを変更せず、新しいデータを返します。

#### カリー化 (Currying)
カリー化とは、複数の引数を取る関数を、1つの引数だけを受け取り、残りの引数を受け取る新しい関数を返す一連の関数に変換するプロセスです。

**Lodash/fp のテストコードにおけるカリー化された関数の利用例**

```typescript
// src/app.test.ts (Lodash/fpのテストより抜粋)
describe("Lodash/fpの基本的な使い方", () => {
  const fp = require("lodash/fp");

  test("fp.range", () => {
    // fp.range(0)(10) は fp.range(0, 10) と同じ意味
    expect(fp.range(0)(10)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  test("fp.filter", () => {
    // フィルタリング関数を先に渡し、後からデータリストを渡す
    const dataList = [1, 2, 3, 4, 5];
    expect(fp.filter((data: number) => data % 2 === 0)(dataList)).toEqual([
      2, 4,
    ]);
  });

  test("fp.map", () => {
    // マッピング関数を先に渡し、後からデータリストを渡す
    const dataList = [1, 2, 3, 4, 5];
    expect(fp.map((data: number) => data * 2)(dataList)).toEqual([
      2, 4, 6, 8, 10,
    ]);
  });
});
```

`fp.range(0)(10)` のように、`fp.range` は最初の引数 `0` を受け取ると、残りの引数 `10` を待つ新しい関数を返します。これにより、部分適用（partial application）が容易になり、再利用可能な関数をより柔軟に作成できます。

#### 関数合成 (Function Composition) とパイプライン処理 (Pipelining)
関数合成とは、複数の関数を組み合わせて新しい関数を作成することです。パイプライン処理は、データが複数の関数を順番に通過するような処理の流れを指します。

Lodash/fpは、`fp.flow` や `fp.pipe` といった関数を提供し、関数合成をサポートします。これにより、一連の処理をより宣言的かつ読みやすく記述できます。

**テストコードから読み取れる関数合成の考え方**

Lodash/fpのテストコードには直接 `fp.flow` や `fp.pipe` の使用例はありませんが、カリー化された関数を組み合わせることで、関数合成の準備ができています。

例えば、偶数をフィルタリングして2倍にする処理を考えます。

```typescript
// テストコードには直接ないが、概念を示す例
const fp = require("lodash/fp");

// 偶数のみフィルタリングする関数
const filterEven = fp.filter((n: number) => n % 2 === 0);

// 各要素を2倍にする関数
const double = fp.map((n: number) => n * 2);

// これらを合成して新しい関数を作成
const processNumbers = fp.flow(
  filterEven, // 最初にフィルタリング
  double      // 次に2倍
);

const data = [1, 2, 3, 4, 5];
const result = processNumbers(data); // [4, 8]
```

`fp.flow` は、`filterEven` と `double` という2つの関数を合成し、新しい関数 `processNumbers` を作成します。この `processNumbers` 関数にデータを渡すと、データは `filterEven` を通過し、その結果が `double` に渡され、最終的な結果が得られます。これにより、処理の流れが明確になり、中間変数を減らすことができます。

### 4. プロジェクトにおける関数型プログラミングの適用例

#### `src/app.ts` の `rle` 関数の実装と、そのテストコードにおける関数型的なアプローチの可能性

`src/app.ts` に実装されている `rle` (Run-Length Encoding) 関数は、現在のところ命令型スタイルで記述されています。

```typescript
// src/app.ts (元の rle 関数)
export function rle(input: string): string {
  if (input === "") {
    return "";
  }

  let result = "";
  let count = 1;

  for (let i = 0; i < input.length; i++) {
    if (i + 1 < input.length && input[i] === input[i + 1]) {
      count++;
    } else {
      result += input[i] + count;
      count = 1;
    }
  }

  return result;
}
```

この関数を関数型プログラミングの原則に沿ってリファクタリングすると、`reduce` を使用してイミュータブルな状態遷移を表現できます。

```typescript
// 関数型スタイルでの rle 関数のリファクタリング案
export function rleFunctional(input: string): string {
  if (input === "") {
    return "";
  }

  const chars = input.split('');

  const { result, lastChar, count } = chars.reduce((acc, currentChar, index) => {
    if (index === 0) { // 最初の文字の初期化
      return { result: '', lastChar: currentChar, count: 1 };
    }

    if (currentChar === acc.lastChar) {
      return { ...acc, count: acc.count + 1 };
    } else {
      const newResult = acc.result + acc.lastChar + acc.count;
      return { result: newResult, lastChar: currentChar, count: 1 };
    }
  }, { result: '', lastChar: '', count: 0 }); // reduceの初期値はダミー

  return result + lastChar + count; // 最後のグループを追加
}
```

このリファクタリング案では、可変変数を使用せず、`reduce` の各ステップで新しいオブジェクトを返すことでイミュータビリティを保っています。これにより、関数の動作がより予測可能になり、テストやデバッグが容易になります。

#### `src/app.test.ts` にあるLodash/fpのテストが、実際のアプリケーションコードでどのように活用できるか

`src/app.test.ts` に含まれるLodash/fpのテストは、単なるテストケースとしてだけでなく、関数型プログラミングのパターン集としても機能します。これらのテストで示されているイミュータブルなデータ操作、カリー化された関数の利用、高階関数によるデータ変換のパターンは、実際のアプリケーションコードで以下のように活用できます。

*   **データ変換パイプライン:** 複数のデータ変換処理を `fp.flow` や `fp.pipe` を使って合成し、読みやすく、再利用可能なパイプラインを構築できます。
*   **状態管理:** アプリケーションの状態をイミュータブルなオブジェクトとして扱い、`fp.set`, `fp.update`, `fp.merge` などの関数を使って状態を更新することで、状態変更の追跡を容易にし、バグを減らすことができます。
*   **汎用ユーティリティ関数の作成:** カリー化された関数を活用して、特定の引数が固定された汎用的なユーティリティ関数を簡単に作成し、コードの重複を避けることができます。

### 5. 関数型プログラミングのメリットと課題

#### メリット
*   **コードの可読性と保守性の向上:** 純粋関数とイミュータビリティにより、関数の動作が予測可能になり、コードの理解と変更が容易になります。
*   **テスト容易性:** 副作用がないため、関数を単体でテストしやすくなります。
*   **並行処理の安全性:** 共有状態の変更を避けるため、並行処理における競合状態のリスクが低減します。
*   **再利用性:** 汎用的な高階関数やカリー化された関数は、さまざまな状況で再利用できます。

#### 課題
*   **学習コスト:** 命令型プログラミングに慣れている開発者にとっては、概念の理解や思考様式の転換に時間がかかる場合があります。
*   **パフォーマンス（場合による）:** イミュータブルな操作では、データのコピーが頻繁に発生するため、大規模なデータセットを扱う場合にパフォーマンスのオーバーヘッドが生じる可能性があります。ただし、現代のJavaScriptエンジンやライブラリは最適化されており、ほとんどのケースでは問題になりません。
*   **既存のパラダイムからの移行:** 既存の命令型コードベースに関数型プログラミングを導入する場合、段階的な移行計画とチーム全体の理解が必要です。

### 6. まとめと今後の展望

#### 本記事の要約
本記事では、プロジェクトのコードベースを参考に、JavaScript/TypeScriptにおける関数型プログラミングの主要な概念（純粋関数、イミュータビリティ、高階関数、カリー化、関数合成）と、Lodash/fpのようなライブラリを用いた実践方法を解説しました。特に、テストコードからこれらの概念がどのように読み取れるか、そして実際のアプリケーションコードでどのように活用できるかを示しました。

#### 関数型プログラミングを学ぶためのリソース
*   Lodash/fpの公式ドキュメント
*   Ramda.js（Lodash/fpと同様の関数型ユーティリティライブラリ）
*   関数型プログラミングに関する書籍やオンラインコース

#### プロジェクトにおけるさらなる関数型プログラミングの適用可能性
このプロジェクトでは、Lodash/fpのテストコードを通じて関数型プログラミングの概念が導入されていますが、実際のアプリケーションコード全体に関数型プログラミングの原則をより深く適用することで、さらなるコード品質の向上が期待できます。例えば、状態管理ライブラリ（Reduxなど）と組み合わせることで、アプリケーション全体の状態遷移をより予測可能に管理できるようになります。
