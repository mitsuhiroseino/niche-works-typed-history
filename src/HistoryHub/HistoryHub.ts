import type {
  HistoryTypeId,
  HistoryTypeMap,
  HistoryTypeValue,
} from '../_types';
import TypedHistory from '../TypedHistory';
import type { CreateHistoryConfig } from './types';

/**
 * 複数のヒストリーを管理するクラス
 */
export default class HistoryHub<
  Histories extends HistoryTypeMap = HistoryTypeMap,
> {
  /**
   * 登録されているHistory
   */
  private _histories = new Map<
    string,
    TypedHistory<HistoryTypeValue<Histories>>
  >();

  /**
   * ヒストリーを登録する
   * @param typedHistory
   */
  registerHistory(
    typedHistory: TypedHistory<HistoryTypeValue<Histories>>,
  ): void {
    this._histories.set(typedHistory.id, typedHistory);
  }

  /**
   * ヒストリーを作成する
   * @param category
   * @returns
   */
  createHistory<C extends HistoryTypeId<Histories>>(
    id: C,
    config: CreateHistoryConfig<Histories[C]> = {},
  ) {
    const typedHistory = new TypedHistory<HistoryTypeValue<Histories>>({
      id: id as string,
      ...config,
    });
    this._histories.set(id as string, typedHistory);
    return typedHistory;
  }

  /**
   * ヒストリーが無い場合は作成して返す
   * @param id
   * @returns
   */
  ensureHistory<C extends HistoryTypeId<Histories>>(id: C) {
    let typedHistory = this._histories.get(id as string);
    if (!typedHistory) {
      typedHistory = this.createHistory(id);
    }
    return typedHistory;
  }

  /**
   * ヒストリーを取得する
   * @param id
   * @returns
   */
  getHistory<C extends HistoryTypeId<Histories>>(id: C) {
    return this._histories.get(id as string);
  }

  /**
   * エントリーを追加する
   * @param id
   * @param entry
   */
  push<C extends HistoryTypeId<Histories>>(id: C, entry: Histories[C]) {
    this.ensureHistory(id).push(entry);
  }

  /**
   * 全履歴の現在の状態を取得する
   * @returns
   */
  snapshot() {
    const snapshots: Record<string, unknown> = {};
    for (const entry of this._histories.entries()) {
      snapshots[entry[0]] = entry[1].spapshot();
    }
    return snapshots as Histories;
  }
}
