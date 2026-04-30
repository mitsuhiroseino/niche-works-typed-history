import type { TypedHistoryConfig } from '../TypedHistory';

export type CreateHistoryConfig<EntryType extends unknown = unknown> = Omit<
  TypedHistoryConfig<EntryType>,
  'id'
>;
