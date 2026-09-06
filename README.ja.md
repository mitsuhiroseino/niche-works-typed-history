# @niche-works/typed-history

`@niche-works/typed-history` は、型安全な履歴（Undo/Redo）管理に特化したニッチなライブラリです。\
任意の型のエントリーをカーソル付きのリストとして保持し、undo/redoのための最小限のAPIを提供します。

**[English README is available here](./README.md)**

## インストール

```bash
npm install @niche-works/typed-history
# または
pnpm add @niche-works/typed-history
```

## 使い方

`TypedHistory` に状態を `push` していくと、`undo` / `redo` でカーソルを前後に移動できます。

```ts
import TypedHistory from '@niche-works/typed-history';

const history = new TypedHistory<string>();

history.push('a');
history.push('b');
history.push('c');

history.canUndo(); // true
history.undo(); // 'b'
history.undo(); // 'a'
history.canUndo(); // false

history.redo(); // 'b'

// カーソルより後ろにエントリーがある状態でpushすると、以降のエントリー（この場合は'c'）は破棄される
history.push('b2'); // ['a', 'b', 'b2']
history.canRedo(); // false
```

## API

### `new TypedHistory(config?)`

| オプション        | 型                                                          | 説明                             |
| ------------------ | ----------------------------------------------------------- | -------------------------------- |
| `id?`              | `string`                                                     | 識別子                           |
| `initialEntries?`  | `EntryType[]`                                                | エントリーの初期状態             |
| `copyStrategy?`    | [`CopyStrategy`](#copystrategy-の値) (デフォルト `'deep'`)   | エントリーを保持する際のコピー方法 |
| `maxLength?`       | `number`                                                     | エントリーの最大保持数           |
| `atBoundary?`      | [`AtBoundary`](#atboundary-の値) (デフォルト `'none'`)       | `undo`/`redo`でこれ以上移動できない場合の戻り値 |

#### `CopyStrategy` の値

`push` で渡したエントリーをそのまま保持すると、後から呼び出し元でエントリーを書き換えた際に履歴側の値も変わってしまいます。それを防ぐためのコピー方法を指定します。

| 値         | 説明                                     |
| ---------- | ---------------------------------------- |
| `'deep'`   | ディープコピーして保持（デフォルト）     |
| `'shallow'`| シャローコピーして保持                   |
| `'none'`   | コピーせずそのまま保持                   |
| 関数       | `(entry: EntryType) => EntryType`。戻り値を保持 |

#### `maxLength` の挙動

指定した数を超えてエントリーが追加されると、古いエントリー（先頭側）から削除されます。\
現在の状態を含めて undo できる回数を確保するため、内部的には指定した数 + 1 件までエントリーを保持します。

#### `AtBoundary` の値

| 値          | 説明                                       |
| ----------- | ------------------------------------------ |
| `'none'`    | `undefined` を返す（デフォルト）           |
| `'current'` | 現在のエントリーをそのまま返す             |

### プロパティ

| プロパティ | 型       | 説明                                             |
| ---------- | -------- | ------------------------------------------------ |
| `id`       | `string` | コンストラクタで指定した識別子                   |
| `length`   | `number` | 保持しているエントリーの数                       |
| `cursor`   | `number` | 現在のカーソル位置（0始まり、エントリーが無い場合は`-1`） |

### メソッド

| メソッド                          | 戻り値               | 説明                                                                 |
| --------------------------------- | -------------------- | -------------------------------------------------------------------- |
| `push(entry)`                     | `void`                | エントリーを追加する。カーソルより後ろにあったエントリーは破棄される  |
| `canUndo()`                       | `boolean`             | `undo` が可能かどうか                                                 |
| `canRedo()`                       | `boolean`             | `redo` が可能かどうか                                                 |
| `undo()`                          | `EntryType \| undefined` | カーソルを1つ前に戻し、その時点のエントリーを返す。これ以上戻れない場合は`atBoundary`の設定に従う |
| `redo()`                          | `EntryType \| undefined` | カーソルを1つ先に進め、その時点のエントリーを返す。これ以上進めない場合は`atBoundary`の設定に従う |
| `snapshot()`                      | `EntryType \| undefined` | 現在のカーソル位置のエントリーをディープコピーして返す                |
| `init(entries?)`                  | `void`                | 履歴を初期化する。`entries` を渡すと、それらを先頭から順に`push`した状態になる |
| `clear()`                         | `void`                | 履歴を空にする（カーソルも`-1`にリセット）                            |

## ライセンス

MIT
