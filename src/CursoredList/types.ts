export type CursoredListConfig = {
  /**
   * エントリーの最大保持数
   */
  maxLength?: number;

  /**
   * カーソルが移動できなかった場合の戻り値
   *
   * - 'current': 現在の要素を返す（デフォルト）
   * - 'none': undefinedを返す
   */
  atBoundary?: AtBoundary;
};

/**
 * カーソルが移動できなかった場合の戻り値
 *
 * - 'current': 現在の要素を返す
 * - 'none': undefinedを返す
 */
export type AtBoundary = 'current' | 'none';
