/**
 * 履歴毎の型定義
 */
export type HistoryTypeMap = Record<string, unknown>;

/**
 * 履歴毎の型定義から取得可能な履歴のID
 */
export type HistoryTypeId<Histories extends HistoryTypeMap> = keyof Histories;

/**
 * 履歴毎の型定義から取得可能な履歴の値
 */
export type HistoryTypeValue<
  Histories extends HistoryTypeMap = HistoryTypeMap,
> = Histories[keyof Histories];
