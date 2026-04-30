export type TypedHistoryConfig<EntryType extends unknown = unknown> = {
  id?: string;
  initialEntries?: EntryType[];
  copyStrategy?: 'deep' | 'shallow' | 'none';
  maxLength?: number;
};
