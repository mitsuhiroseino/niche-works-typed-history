export type TypedHistoryConfig<EntryType extends unknown = unknown> = {
  /**
   * 識別子
   */
  id?: string;

  /**
   * エントリーの初期状態
   */
  initialEntries?: EntryType[];

  /**
   * エントリーを保持する際のコピー方法
   *
   * - 'deep': ディープコピーして保持
   * - 'shallow': シャローコピーして保持
   * - 'none': そのまま保持
   * - 関数: 関数の戻り値を保持
   */
  copyStrategy?:
    | 'deep'
    | 'shallow'
    | 'none'
    | ((entry: EntryType) => EntryType);

  /**
   * エントリーの最大保持数
   */
  maxLength?: number;
};
