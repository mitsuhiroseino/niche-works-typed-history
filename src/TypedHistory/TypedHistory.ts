import { cloneDeep, cloneShallow, identity } from '@niche-works/utils';
import { klona } from 'klona/full';
import CursoredList from '../CursoredList';
import type { TypedHistoryConfig } from './types';

const COPY_STRATEGY = {
  deep: cloneDeep,
  shallow: cloneShallow,
  none: identity,
} as const;

/**
 * 履歴を管理するためのクラス
 */
export default class TypedHistory<EntryType = unknown> {
  /**
   * ID
   */
  readonly id: string;

  /**
   * エントリー
   */
  private _entries: CursoredList<EntryType>;

  /**
   * 最大エントリー数
   */
  private _maxLength: number;

  /**
   * 前処理
   */
  private _preprocess: (entry: EntryType) => EntryType;

  constructor(config: TypedHistoryConfig<EntryType> = {}) {
    const { id, copyStrategy, initialEntries, maxLength } = config;
    this.id = id;
    this._preprocess = COPY_STRATEGY[copyStrategy || 'deep'];
    // カーソル0番目を「初期状態」として確保するため+1する
    this._maxLength = maxLength && maxLength > 0 ? maxLength + 1 : 0;
    this.init(initialEntries);
  }

  init(entries?: EntryType[]) {
    this.clear();
    if (entries?.length) {
      for (const entry of entries) {
        this.push(entry);
      }
    }
  }

  clear() {
    this._entries = new CursoredList({ maxLength: this._maxLength });
  }

  get length() {
    return this._entries.length;
  }

  get cursor() {
    return this._entries.cursor;
  }

  push(entry: EntryType) {
    this._entries.append(this._preprocess(entry));
  }

  canRedo(): boolean {
    return this._entries.hasNext;
  }

  canUndo(): boolean {
    return this._entries.hasPrevious;
  }

  redo(): EntryType | undefined {
    if (this.canRedo()) {
      const entry = this._entries.forward();
      return entry;
    }
  }

  undo(): EntryType | undefined {
    if (this.canUndo()) {
      const entry = this._entries.backward();
      return entry;
    }
  }

  spapshot(): EntryType | undefined {
    return klona(this._entries.current);
  }
}
