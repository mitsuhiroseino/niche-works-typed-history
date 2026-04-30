import type { CursoredListConfig } from './types';

/**
 * カーソル付きのリスト
 * 下記を行う
 *
 * - エントリーの追加（カーソル以降の切り捨て・最大長の超過分削除）
 * - カーソルの前後移動
 * - エントリーの読み取り
 */
export default class CursoredList<T = unknown> {
  private _entries: T[] = [];
  private _cursor: number = -1;
  private readonly _maxLength: number;

  constructor(config: CursoredListConfig = {}) {
    const { maxLength } = config;
    this._maxLength = maxLength != null && maxLength > 0 ? maxLength : 0;
  }

  get length(): number {
    return this._entries.length;
  }

  get cursor(): number {
    return this._cursor;
  }

  get current(): T | undefined {
    return this._entries[this._cursor];
  }

  get hasPrevious(): boolean {
    return this._cursor > 0;
  }

  get hasNext(): boolean {
    return this._cursor < this._entries.length - 1;
  }

  /**
   * カーソル以降のエントリーを切り捨ててから追加する。
   * maxLength超過時は先頭から削除し、カーソルを補正する。
   */
  append(entry: T): void {
    if (this._cursor < this._entries.length - 1) {
      // 現在のカーソルよりも後ろにあるエントリーは破棄
      this._entries = this._entries.slice(0, this._cursor + 1);
    }

    // エントリーを追加
    this._entries.push(entry);

    if (this._maxLength > 0 && this._entries.length > this._maxLength) {
      // エントリー数の上限に達しているなら前の方から削除
      const excess = this._entries.length - this._maxLength;
      this._entries = this._entries.slice(excess);
      this._cursor = Math.max(0, this._cursor - excess);
    }

    // 現在のカーソル位置を設定
    this._cursor = this._entries.length - 1;
  }

  /**
   * カーソルを1つ後退させ、移動後の要素を返す。
   * 移動できない場合は現在の要素を返す
   */
  backward(): T {
    if (this.hasPrevious) {
      this._cursor--;
    }
    return this._entries[this._cursor];
  }

  /**
   * カーソルを1つ前進させ、移動後の要素を返す。
   * 移動できない場合は現在の要素を返す
   */
  forward(): T {
    if (this.hasNext) {
      this._cursor++;
    }
    return this._entries[this._cursor];
  }

  clear(): void {
    this._entries = [];
    this._cursor = -1;
  }
}
