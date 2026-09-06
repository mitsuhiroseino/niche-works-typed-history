# @niche-works/typed-history

`@niche-works/typed-history` is a niche library specialized in type-safe history (undo/redo) management.\
It keeps entries of any type as a cursored list and provides a minimal API for undo/redo.

**[日本語のREADMEはこちら](./README.ja.md)**

## Installation

```bash
npm install @niche-works/typed-history
# or
pnpm add @niche-works/typed-history
```

## Usage

`push` state onto `TypedHistory`, then move the cursor back and forth with `undo` / `redo`.

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

// Pushing while there are entries ahead of the cursor discards them (here, 'c')
history.push('b2'); // ['a', 'b', 'b2']
history.canRedo(); // false
```

## API

### `new TypedHistory(config?)`

| Option             | Type                                                         | Description                                        |
| ------------------- | -------------------------------------------------------------- | --------------------------------------------------- |
| `id?`               | `string`                                                        | Identifier                                           |
| `initialEntries?`   | `EntryType[]`                                                   | Initial entries                                      |
| `copyStrategy?`     | [`CopyStrategy`](#copystrategy-values) (default `'deep'`)      | How entries are copied when kept                     |
| `maxLength?`        | `number`                                                        | Maximum number of entries to keep                    |
| `atBoundary?`       | [`AtBoundary`](#atboundary-values) (default `'none'`)           | What `undo`/`redo` return when they can't move further |

#### `CopyStrategy` values

Keeping the entry passed to `push` as-is means later mutations by the caller would also change the stored value. Use this option to prevent that.

| Value       | Description                                       |
| ----------- | -------------------------------------------------- |
| `'deep'`    | Keep a deep copy (default)                          |
| `'shallow'` | Keep a shallow copy                                 |
| `'none'`    | Keep the value as-is, without copying               |
| Function    | `(entry: EntryType) => EntryType`. Keeps the return value |

#### `maxLength` behavior

Once the number of entries exceeds the specified limit, the oldest entries (at the front) are dropped.\
Internally, one extra entry beyond the specified number is kept, to preserve a state you can still undo to.

#### `AtBoundary` values

| Value       | Description                                  |
| ----------- | ---------------------------------------------- |
| `'none'`    | Returns `undefined` (default)                  |
| `'current'` | Returns the current entry as-is                |

### Properties

| Property  | Type     | Description                                                    |
| --------- | -------- | ---------------------------------------------------------------- |
| `id`      | `string` | The identifier passed to the constructor                         |
| `length`  | `number` | The number of entries currently kept                             |
| `cursor`  | `number` | The current cursor position (0-based, `-1` when there are no entries) |

### Methods

| Method              | Return value             | Description                                                                        |
| -------------------- | -------------------------- | ------------------------------------------------------------------------------------ |
| `push(entry)`        | `void`                     | Adds an entry. Any entries ahead of the cursor are discarded                         |
| `canUndo()`          | `boolean`                  | Whether `undo` is possible                                                           |
| `canRedo()`          | `boolean`                  | Whether `redo` is possible                                                           |
| `undo()`             | `EntryType \| undefined`   | Moves the cursor back by one and returns the entry at that point. If it can't move further back, follows the `atBoundary` setting |
| `redo()`             | `EntryType \| undefined`   | Moves the cursor forward by one and returns the entry at that point. If it can't move further forward, follows the `atBoundary` setting |
| `snapshot()`         | `EntryType \| undefined`   | Returns a deep copy of the entry at the current cursor position                      |
| `init(entries?)`     | `void`                     | Initializes the history. If `entries` is given, it becomes the result of `push`ing them in order |
| `clear()`            | `void`                     | Empties the history (also resets the cursor to `-1`)                                 |

## License

MIT
