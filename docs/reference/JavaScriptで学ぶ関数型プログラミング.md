---
title: JavaScriptで学ぶ関数型プログラミング
description: 
published: true
date: 2025-07-26T04:15:25.415Z
tags: 
editor: markdown
dateCreated: 2025-07-26T04:15:25.415Z
---

## JavaScriptで学ぶ関数型プログラミング

### はじめに

関数型プログラミング（FP）は、ソフトウェアを構築するためのパラダイムであり、副作用を避け、純粋な関数と不変のデータに焦点を当てます。JavaScriptは、その柔軟性から、関数型プログラミングの概念を学ぶのに最適な言語です。この章では、JavaScriptにおける関数型プログラミングの主要な概念と、それらがどのようにコードの可読性、テスト容易性、保守性を向上させるかを探ります。

---

### 1章 関数型JavaScriptへのいざない

この章では、関数型プログラミングの基本的な考え方と、JavaScriptがどのように関数型プログラミングに適しているかを紹介します。関数を「抽象単位」および「動作単位」として捉え、データ抽象化の重要性について考察します。

**1.1 抽象単位としての関数**

関数は、特定のタスクを実行するための抽象的な単位です。これにより、複雑なロジックを小さな、管理しやすい部分に分割できます。

**例:** `parseAge` 関数は、文字列を数値に変換する処理を抽象化しています。

```javascript
function parseAge(age) {
  if (!_.isString(age)) fail("引数は文字列である必要があります");
  let a;

  note("ageを数値に変換しようとしています");

  a = parseInt(age, 10);
  if (_.isNaN(a)) {
    warn(["ageを数値に変換できませんでした", age].join(" "));
    a = 0;
  }
  return a;
}
```

**1.2 動作単位としての関数**

関数は、特定の動作をカプセル化する単位でもあります。これにより、コードの再利用性が高まります。

**例:** `nth` 関数は、配列や文字列から指定されたインデックスの要素を取得する動作を抽象化しています。

```javascript
function nth(a, index) {
  if (!_.isNumber(index)) fail("インデックスは数値である必要があります");
  if (!isIndexed(a))
    fail("インデックス指定可能ではないデータ型はサポートされていません");
  if (index < 0 || index > a.length - 1)
    fail("指定されたインデックスは範囲外です");
  return a[index];
}

function second(a) {
  return nth(a, 1);
}
```

**1.3 抽象としてのデータ**

関数型プログラミングでは、データもまた抽象化の対象です。データを特定の構造として扱い、その構造に対する操作を定義します。

**例:** `lameCSV` 関数は、CSV形式の文字列をテーブル形式のデータ構造に変換します。

```javascript
function lameCSV(str) {
  return _.reduce(
    str.split("\n"),
    (table, row) => {
      table.push(_.map(row.split(","), (c) => c.trim()));
      return table;
    },
    [],
  );
}

const peopleTable = lameCSV(
  "name,age,hair\nMerble,35,red\nBob,64,blonde",
);

function selectNames(table) {
  return _.tail(_.map(table, _.head));
}

function selectAges(table) {
  return _.tail(_.map(table, second));
}
```

**1.4 関数型テイストのJavaScript**

JavaScriptには、関数型プログラミングの概念を適用しやすい機能が多数あります。

**例:** `existy` と `truthy` 関数は、値の存在や真偽をチェックするユーティリティ関数です。

```javascript
function existy(x) {
  return x != null;
}

function truthy(x) {
  return x !== false && existy(x);
}

function doWhen(cond, action) {
  if (truthy(cond)) return action();
  else return undefined;
}

function executeIfHasField(target, name) {
  return doWhen(existy(target[name]), () => {
    const result = _.result(target, name);
    console.log(["結果は", result].join(" "));
    return result;
  });
}
```

---

### 2章 第一級関数と作用的プログラミング

この章では、JavaScriptにおける関数の第一級オブジェクトとしての性質と、作用的プログラミング（コレクション指向プログラミング）について掘り下げます。

**2.1 第一級要素としての関数**

JavaScriptでは、関数は変数に代入したり、引数として渡したり、戻り値として返したりできる「第一級」の存在です。

**例:** `cat`, `construct`, `mapcat`, `butLast`, `interpose` といった関数は、配列操作を抽象化し、関数を第一級オブジェクトとして活用しています。

```javascript
function cat(/* いくつかの拝借 */) {
  const head = _.first(arguments);
  if (existy(head)) {
    return head.concat.apply(head, _.tail(arguments));
  } else {
    return [];
  }
}

function construct(head, tail) {
  return cat([head], _.toArray(tail));
}

function mapcat(fun, coll) {
  return cat.apply(null, _.map(coll, fun));
}

function butLast(coll) {
  return _.toArray(coll).slice(0, -1);
}

function interpose(inter, coll) {
  return butLast(
    mapcat(function (e) {
      return construct(e, [inter]);
    }, coll),
  );
}
```

**2.2 作用的プログラミング (Collection-Oriented Programming)**

作用的プログラミングは、コレクション（配列やオブジェクト）に対する操作を中心にプログラムを構築するスタイルです。Lodashのようなライブラリは、このスタイルを強力にサポートします。

**例:** `doubleAll`, `average`, `onlyEven` は、配列に対する一般的な操作を関数として定義しています。

```javascript
const nums = [1, 2, 3, 4, 5];

function doubleAll(array) {
  return _.map(array, function (n) {
    return n * 2;
  });
}

function average(array) {
  const sum = _.reduce(array, function (a, b) {
    return a + b;
  });
  return sum / _.size(array);
}

function onlyEven(array) {
  return _.filter(array, function (n) {
    return n % 2 === 0;
  });
}
```

**2.3 データ思考**

データ思考では、データを中心に設計し、そのデータに対する操作を関数として定義します。

**例:** `project`, `rename`, `as`, `restrict` は、オブジェクトの配列（テーブル）を操作するための関数です。

```javascript
function project(table, keys) {
  return _.map(table, function (obj) {
    return _.pick.apply(null, construct(obj, keys));
  });
}

function rename(obj, newNames) {
  return _.reduce(
    newNames,
    function (o, nu, old) {
      if (_.has(obj, old)) {
        o[nu] = obj[old];
        return o;
      } else return 0;
    },
    _.omit.apply(null, construct(obj, _.keys(newNames))),
  );
}

function as(table, newNames) {
  return _.map(table, function (obj) {
    return rename(obj, newNames);
  });
}

function restrict(table, pred) {
  return _.reduce(
    table,
    function (newTable, obje) {
      if (truthy(pred(obje))) return newTable;
      else return _.without(newTable, obje);
    },
    table,
  );
}
```

---

### 3章 JavaScriptにおける変数のスコープとクロージャ

この章では、JavaScriptのスコープの仕組み、特に静的スコープと動的スコープの違い、そしてクロージャの強力な機能について解説します。

**3.1 静的スコープ**

JavaScriptは静的スコープ（レキシカルスコープ）を採用しています。これは、変数のスコープがコードが書かれた場所（定義された場所）によって決定されることを意味します。

**例:** `aFun` の例では、ネストされた関数が外側のスコープの変数にアクセスできることを示しています。

```javascript
const aVariable = " 外";

function aFun() {
  const aVariable = " 内";
  return _.map([1, 2, 3], function (e) {
    const aVariable = " 最内";
    return [aVariable, e].join(' ');
  });
}
```

**3.2 クロージャ**

クロージャは、関数がその定義された環境（レキシカル環境）を記憶し、その環境内の変数にアクセスできる機能です。これにより、プライベートな状態を持つ関数を作成できます。

**例:** `makeAdder` 関数は、クロージャの典型的な例です。

```javascript
function makeAdder(CAPTURED) {
  return function (free) {
    return free + CAPTURED;
  };
}

const add10 = makeAdder(10);
// add10 は、makeAdder が呼び出されたときの CAPTURED の値（10）を記憶している
expect(add10(32)).toBe(42);
```

**例:** `pingpong` オブジェクトは、クロージャを使ってプライベートな `PRIVATE` 変数を保持しています。

```javascript
const pingpong = (function () {
  let PRIVATE = 0;
  return {
    inc: function (n) {
      return PRIVATE += n;
    },
    dec: function (n) {
      return PRIVATE -= n;
    }
  };
})();

expect(pingpong.inc(10)).toBe(10); // PRIVATE は 10 になる
expect(pingpong.dec(7)).toBe(3);  // PRIVATE は 3 になる
```

---

### 4章 高階関数

高階関数は、関数を引数として受け取ったり、関数を戻り値として返したりする関数です。これにより、コードの抽象化と再利用性が大幅に向上します。

**4.1 引数として関数を取る関数**

**例:** `finder` 関数は、`valueFun` と `bestFun` という2つの関数を引数として受け取り、コレクションから最適な要素を見つけます。

```javascript
function finder(valueFun, bestFun, coll) {
  return _.reduce(coll, function (best, current) {
    const bestValue = valueFun(best);
    const currentValue = valueFun(current);
    return (bestValue === bestFun(bestValue, currentValue)) ? best : current;
  });
};

const people = [{ name: "Fred", age: 65 }, { name: "Lucy", age: 36 }];
expect(finder(plucker('age'), Math.max, people)).toStrictEqual({ name: "Fred", age: 65 });
```

**例:** `repeatedly` 関数は、指定された回数だけ関数を実行し、その結果の配列を返します。

```javascript
function repeatedly(times, fun) {
  return _.map(_.range(times), fun);
}

expect(repeatedly(3, function () { return Math.floor((Math.random() * 10) + 1); })).toHaveLength(3);
```

**4.2 他の関数を返す関数**

**例:** `always` 関数は、常に同じ値を返す新しい関数を作成します。

```javascript
function always(VALUE) {
  return function () {
    return VALUE;
  };
};

const f = always(function () { });
expect(f() === f()).toBe(true); // 常に同じ関数インスタンスを返す
```

**例:** `invoker` 関数は、オブジェクトの特定のメソッドを呼び出す新しい関数を作成します。

```javascript
function invoker(NAME, METHOD) {
  return function (target) {
    if (!existy(target)) fail("Must provide a target");

    const targetMethod = target[NAME];
    const args = _.tail(arguments);

    return doWhen((existy(targetMethod) && METHOD === targetMethod), function () {
      return targetMethod.apply(target, args);
    });
  };
};

const rev = invoker('reverse', Array.prototype.reverse);
expect(_.map([[1, 2, 3]], rev)).toStrictEqual([[3, 2, 1]]);
```

**4.3 存在しない状態に対する防御のための関数**

**例:** `fnull` 関数は、引数が `null` や `undefined` の場合にデフォルト値を使用する関数を作成します。

```javascript
function fnull(fun /*, defaults */) {
  const defaults = _.tail(arguments);

  return function (/* args */) {
    const args = _.map(arguments, function (e, i) {
      return existy(e) ? e : defaults[i];
    });

    return fun.apply(null, args);
  };
}

const nums = [1, 2, 3, null, 5];
const safeMult = fnull(function (total, n) { return total * n; }, 1, 1);
expect(_.reduce(nums, safeMult)).toBe(30); // null が 1 として扱われる
```

---

### 5章 関数を組み立てる関数

この章では、関数合成、カリー化、部分適用といったテクニックを使って、より複雑な関数を構築する方法を学びます。

**5.1 関数合成の基礎**

関数合成は、複数の関数を組み合わせて新しい関数を作成するプロセスです。ある関数の出力が次の関数の入力となります。

**例:** `dispatch` 関数は、複数の関数を順番に試行し、最初に結果を返す関数を使用します。

```javascript
function dispatch(/* 任意の数の関数 */) {
  const funs = _.toArray(arguments);
  const size = funs.length;

  return function (target /*, args */) {
    let ret;
    let args = _.last(arguments);

    for (let funIndex = 0; funIndex < size; funIndex++) {
      ret = funs[funIndex].apply(funs[funIndex], construct(target, args));
      if (existy(ret)) return ret;
    }

    return ret;
  };
}

const polyrev = dispatch(invoker('reverse', Array.prototype.reverse), stringReverse);
// polyrev は、引数が配列なら reverse を、文字列なら stringReverse を適用する
```

**5.2 カリー化**

カリー化は、複数の引数を取る関数を、1つの引数を取る関数を連続して返す関数に変換するテクニックです。

**例:** `curry2` 関数は、2つの引数を取る関数をカリー化します。

```javascript
function curry2(fun) {
  return function (secondArg) {
    return function (firstArg) {
      return fun(firstArg, secondArg);
    };
  };
}

function div(n, d) { return n / d; }
const div10 = curry2(div)(10); // div10 は、d が 10 に固定された div 関数
expect(div10(50)).toBe(5); // 50 / 10 = 5
```

**5.3 部分適用**

部分適用は、関数と一部の引数を受け取り、残りの引数を待つ新しい関数を返すテクニックです。

**例:** `partial1` 関数は、最初の引数を部分適用します。

```javascript
function partial1(fun, arg1) {
  return function (/* args */) {
    const args = construct(arg1, arguments);
    return fun.apply(fun, args);
  };
}

const over10Part = partial1(div, 10); // over10Part は、n が 10 に固定された div 関数
expect(over10Part(2)).toBe(5); // 10 / 2 = 5
```

**例:** `condition1` と `partial1` を組み合わせた事前条件のチェック。

```javascript
const zero = validator("0ではいけません", function (n) { return 0 === n; });
const number = validator("引数は数値である必要があります", _.isNumber);

const sqrPre = condition1(
  validator("0ではいけません", complement(zero)),
  validator("引数は数値である必要があります", _.isNumber)
);

function uncheckedSqr(n) { return n * n; }
const checkedSqr = partial1(sqrPre, uncheckedSqr);

expect(checkedSqr(10)).toBe(100);
expect(() => checkedSqr(0)).toThrow("0ではいけません");
expect(() => checkedSqr('')).toThrow("引数は数値である必要があります");
```

---

### 6章 再帰

再帰は、関数が自分自身を呼び出すプログラミングテクニックです。関数型プログラミングでは、ループの代わりに再帰がよく使われます。

**6.1 自身を呼ぶ関数**

**例:** `myLength` 関数は、配列の長さを再帰的に計算します。

```javascript
function myLength(ary) {
  if (_.isEmpty(ary)) return 0;
  return 1 + myLength(_.tail(ary));
}

expect(myLength(_.range(10))).toBe(10);
```

**例:** `nexts` 関数は、グラフ構造において特定のノードから到達可能な次のノードを再帰的に見つけます。

```javascript
const influences = [
  ['Lisp', 'Smalltalk'],
  ['Lisp', 'Scheme'],
  ['Smalltalk', 'Self'],
  ['Scheme', 'JavaScript'],
  ['Scheme', 'Lua'],
  ['Self', 'Lua'],
  ['Self', 'JavaScript']
];

function nexts(graph, node) {
  if (_.isEmpty(graph)) return [];
  const pair = _.head(graph);
  const from = _.head(pair);
  const to = second(pair);
  const more = _.tail(graph);

  if (_.isEqual(node, from)) return construct(to, nexts(more, node));
  else
    return nexts(more, node);
}

expect(nexts(influences, 'Lisp')).toStrictEqual(['Smalltalk', 'Scheme']);
```

**6.2 末尾再帰**

末尾再帰は、再帰呼び出しが関数の最後の操作である場合に発生します。これにより、スタックオーバーフローを防ぐことができます。

**例:** `tcLength` は末尾再帰の例です。

```javascript
function tcLength(ary, n) {
  const l = n ? n : 0;
  if (_.isEmpty(ary)) return l;
  else return tcLength(_.tail(ary), l + 1);
}

expect(tcLength(_.range(1000))).toBe(1000);
```

**6.3 相互再帰関数**

相互再帰は、2つ以上の関数が互いに呼び出し合う形式の再帰です。

**例:** `evenSteven` と `oddJohn` は、数値が偶数か奇数かを判断するために相互に呼び出し合います。

```javascript
function evenSteven(n) {
  if (n === 0) return true;
  else return oddJohn(Math.abs(n) - 1);
}

function oddJohn(n) {
  if (n === 0) return false;
  else
    return evenSteven(Math.abs(n) - 1);
}

expect(evenSteven(3)).toBe(false);
expect(oddJohn(3)).toBe(true);
```

**6.4 再帰を使った深いコピー**

**例:** `deepClone` 関数は、オブジェクトを再帰的に深くコピーします。

```javascript
function deepClone(obj) {
  if (!existy(obj) || !_.isObject(obj)) return obj;

  const temp = new obj.constructor();
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) temp[key] = deepClone(obj[key]);
  }

  return temp;
}

const x = [{ a: [1, 2, 3], b: 42 }, { c: { d: [] } }];
const y = deepClone(x);
expect(x === y).toBe(false); // 参照が異なる
expect(x[0] === y[0]).toBe(false); // ネストされたオブジェクトも参照が異なる
```

---

### 7章 純粋性、不変性、変更ポリシー

この章では、関数型プログラミングの核となる概念である純粋性、不変性、そして変更をどのように管理するかについて深く掘り下げます。

**7.1 純粋性**

純粋関数は、同じ入力に対して常に同じ出力を返し、副作用を持ちません。これにより、コードの予測可能性とテスト容易性が向上します。

**例:** `randString` 関数は、純粋関数と不純な関数（`rand`）を分離する良い例です。

```javascript
const rand = partial1(_.random, 1); // 1から始まる乱数を生成

function randString(len) {
  const ascii = repeatedly(len, function () {
    return rand(26); // 1から26の乱数
  });

  return _.map(ascii, function (n) {
    return n.toString(36); // 数値をアルファベットに変換
  }).join('');
}

// generateString は純粋関数
function generateString(charGen, len) {
  return repeatedly(len, charGen).join('');
}

// generateRandomCharacter は不純な関数（乱数に依存）
function generateRandomCharacter() {
  return _.random(26).toString(36);
}

// generateString(generateRandomCharacter, 10) は不純な結果を生成する
// generateString(always('a'), 10) は純粋な結果 'aaaaaaaaaa' を生成する
```

**7.2 不変性**

不変性とは、データが作成された後に変更されないことを意味します。これにより、予期せぬ副作用を防ぎ、コードの追跡を容易にします。

**例:** `Object.freeze()` はオブジェクトの変更を防ぎます。

```javascript
const a = [1, 2, 3];
Object.freeze(a);
// a[1] = 42; // TypeError: Cannot assign to read only property '1' of object '[object Array]'
```

**例:** `deepFreeze` 関数は、オブジェクトとそのすべてのネストされたプロパティを再帰的にフリーズします。

```javascript
function deepFreeze(obj) {
  if (!Object.isFrozen(obj)) {
    Object.freeze(obj);
  }

  for (let key in obj) {
    if (!obj.hasOwnProperty(key) || !_.isObject(obj[key])) continue;
    deepFreeze(obj[key]);
  }
}

const x = [{ a: [1, 2, 3], b: 42 }, { c: { d: [] } }];
deeplFreeze(x);
// x[1]['c']['d'] = 100000; // TypeError: Cannot assign to read only property 'd' of object '[object Object]'
```

**例:** `Point` クラスは、不変なオブジェクトの例です。`withX` や `withY` メソッドは、新しい `Point` オブジェクトを返します。

```javascript
function Point(x, y) {
  this._x = x;
  this._y = y;
}

Point.prototype = {
  withX: function (x) {
    return new Point(x, this._y);
  },

  withY: function (y) {
    return new Point(this._x, y);
  }
};

const p = new Point(0, 1);
const p2 = p.withX(1000); // p は変更されない
expect(p._x).toBe(0);
expect(p2._x).toBe(1000);
```

**7.3 変更コントロールのポリシー**

関数型プログラミングでは、変更を完全に避けるのではなく、変更を厳密にコントロールするポリシーを採用します。

**例:** `Container` クラスは、内部の値をカプセル化し、`update` メソッドを通じてのみ変更を許可します。

```javascript
function Container(init) {
  this._value = init;
}

Container.prototype = {
  update: function (fn) {
    const arg = _.tail(arguments);
    const oldValue = this._value;
    this._value = fn.apply(this, construct(oldValue, arg));
    return this._value;
  }
};

const aNumber = new Container(42);
aNumber.update(function (n) { return n + 1; }); // _value が 43 になる
expect(aNumber._value).toBe(43);
```

---

### 8章 フローベースプログラミング

フローベースプログラミングは、データの流れと変換に焦点を当てたプログラミングスタイルです。パイプラインやチェーンといった概念が中心となります。

**8.1 チェーン**

チェーンは、一連の操作を連続して適用するパターンです。

**例:** Lodashの `_.chain` は、オブジェクトをラップし、メソッドを連続して呼び出すことを可能にします。

```javascript
_.chain([1, 2, 3, 200])
  .filter(function (num) { return num % 2 == 0; }) // [2, 200]
  .map(function (num) { return num * num; }) // [4, 40000]
  .value(); // 最終的な値を取得
```

**例:** `LazyChain` は、遅延評価を行うカスタムチェーンの実装です。

```javascript
function LazyChain(obj) {
  this._calls = [];
  this._target = obj;
}

LazyChain.prototype.invoke = function (methodName, ...args) {
  this._calls.push(function (target) {
    const meth = target[methodName];
    if (typeof meth === 'function') {
      return meth.apply(target, args);
    }
  });
  return this;
};

LazyChain.prototype.force = function () {
  return _.reduce(this._calls, function (target, thunk) {
    return thunk(target);
  }, this._target);
}

const result = new LazyChain([2, 1, 3])
  .invoke('concat', [8, 5, 7, 6])
  .invoke('sort')
  .invoke('join', ',')
  .force(); // force が呼び出されるまで処理は実行されない
expect(result).toBe("1,2,3,5,6,7,8");
```

**8.2 パイプライン**

パイプラインは、関数合成の一種で、ある関数の出力が次の関数の入力となるように関数を連結します。

**例:** `pipeline` 関数は、複数の関数を順番に適用します。

```javascript
function pipeline(seed /*, args */) {
  return _.reduce(
    _.tail(arguments),
    function (l, r) { return r(l); },
    seed
  );
}

function fifth(a) {
  return pipeline(a
    , _.tail
    , _.tail
    , _.tail
    , _.tail
    , _.head);
}

expect(fifth([1, 2, 3, 4, 5])).toBe(5);
```

**8.3 データフロー対コントロールフロー（制御構造）**

関数型プログラミングでは、命令的な制御フロー（`if/else`, `for` ループなど）よりも、データの変換とフローに焦点を当てます。

**例:** `actions` 関数は、一連のアクション（関数）を順番に実行し、状態を更新しながら結果を収集します。

```javascript
function actions(acts, done) {
  return function (seed) {
    const init = { values: [], state: seed };

    const intermediate = _.reduce(acts, function (stateObj, action) {
      const result = action(stateObj.state);
      const values = cat(stateObj.values, [result.answer]);
      return { values: values, state: result.state };
    }, init);

    const keep = _.filter(intermediate.values, existy);
    return done(keep, intermediate.state);
  };
}

function mSqr() {
  return function (state) {
    const ans = sqr(state);
    return { answer: ans, state: ans };
  };
}

const doubleSquare = actions(
  [mSqr(), mSqr()],
  function (values) {
    return values;
  }
);

expect(doubleSquare(10)).toStrictEqual([100, 10000]);
```

---

### 9章 クラスを使わないプログラミング

この章では、JavaScriptでクラスを使わずにオブジェクト指向的な概念（カプセル化、継承、ポリモーフィズム）を実現する方法、特にMixinパターンとデータ指向プログラミングについて探ります。

**9.1 データ指向**

データ指向プログラミングでは、データを中心に設計し、データに対する操作を関数として定義します。

**例:** `lazyChain` は、クラスを使わずにチェーン可能なオブジェクトを作成する例です。

```javascript
function lazyChain(obj) {
  const calls = [];

  return {
    invoke: function (methodName /*, args */) {
      const args = _.tail(arguments);
      calls.push(function (target) {
        const meth = target[methodName];
        return meth.apply(target, args);
      });
      return this;
    },
    force: function () {
      return _.reduce(calls, function (ret, thunk) {
        return thunk(ret);
      }, obj);
    }
  };
}

const result = lazyChain([2, 1, 3])
  .invoke('concat', [7, 7, 8, 9, 0])
  .invoke('sort')
  .force();
expect(result).toStrictEqual([0, 1, 2, 3, 7, 7, 8, 9]);
```

**9.2 Mixin**

Mixinは、オブジェクトに機能を追加するためのパターンです。これにより、継承階層を深くすることなく、コードの再利用性を高めることができます。

**例:** `HoleMixin`, `ValidateMixin`, `ObserverMixin`, `SwapMinx`, `SnapshotMixin`, `CASMixin` は、`Container` や `Hole` オブジェクトに様々な機能を追加するためのMixinです。

```javascript
// Container の基本定義
function Container(val) {
  this._value = val;
  this.init(val);
}
Container.prototype.init = _.identity;

// HoleMixin: 値の設定機能
const HoleMixin = {
  setValue: function (newValue) {
    const oldVal = this._value;
    this.validate(newValue); // ValidateMixin の機能
    this._value = newValue;
    this.notify(oldVal, newValue); // ObserverMixin の機能
    return this._value;
  }
};

// ValidateMixin: バリデーション機能
const ValidateMixin = {
  addValidator: function (fun) {
    this._validator = fun;
  },
  init: function (val) {
    this.validate(val);
  },
  validate: function (val) {
    if (existy(this._validator) && !this._validator(val))
      fail("不正な値を設定しようとしました：" + polyToString(val));
  }
};

// ObserverMixin: 値の変更を監視する機能
const ObserverMixin = (function () {
  let _watcher = [];
  return {
    watch: function (fun) {
      _watcher.push(fun);
      return _.size(_watcher);
    },
    notify: function (oldVal, newVal) {
      _.each(_watcher, function (watcher) {
        watcher.call(this, oldVal, newVal);
      });
      return _.size(_watcher);
    }
  }
})();

// Hole は Container をベースに Mixin を混ぜ込む
const Hole = function (val) {
  Container.call(this, val);
}
_.extend(Hole.prototype, HoleMixin, ValidateMixin, ObserverMixin);

// 使用例
let h = new Hole(42);
h.addValidator(isEven); // 偶数のみ許可
expect(h.setValue(108)).toBe(108); // 成功
expect(() => h.setValue(9)).toThrow("不正な値を設定しようとしました：9"); // エラー
```

**9.3 メソッドは低レイヤーでの操作**

関数型プログラミングでは、オブジェクトのメソッドは、より高レベルの関数型操作の基盤となる低レベルの操作として扱われることがあります。

**例:** `hole` や `cas` のようなファクトリ関数は、Mixinを使って構築されたオブジェクトを生成し、そのオブジェクトに対する操作を関数として提供します。

```javascript
function hole(val /*, validator */) {
  const h = new Hole(val);
  const v = _.toArray(arguments)[1];

  if (v) h.addValidator(v);
  h.setValue(val); // 初期値のバリデーションと通知
  return h;
}

const x = hole(42);
const swap = invoker('swap', Hole.prototype.swap); // メソッドを関数として取得
expect(swap(x, sqr)).toBe(1764);
```

---

### 結論

JavaScriptにおける関数型プログラミングは、コードの品質、保守性、およびスケーラビリティを向上させる強力なパラダイムです。純粋関数、不変性、第一級関数、高階関数、関数合成といった概念を理解し、適用することで、より堅牢で予測可能なアプリケーションを構築できます。

最初は慣れないかもしれませんが、これらの原則を実践することで、よりクリーンで、テストしやすく、理解しやすいJavaScriptコードを書くことができるようになるでしょう。ぜひ、ご自身のプロジェクトで関数型プログラミングの探求を続けてみてください。
