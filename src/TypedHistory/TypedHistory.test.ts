import TypedHistory from './TypedHistory';

describe('TypedHistory', () => {
  describe('id', () => {
    it('指定したidが設定される', () => {
      const history = new TypedHistory({ id: 'foo' });
      expect(history.id).toBe('foo');
    });

    it('idを指定しない場合はundefinedになる', () => {
      const history = new TypedHistory();
      expect(history.id).toBeUndefined();
    });
  });

  describe('初期状態', () => {
    it('エントリーを指定しない場合は空になる', () => {
      const history = new TypedHistory();
      expect(history.length).toBe(0);
      expect(history.cursor).toBe(-1);
      expect(history.snapshot()).toBeUndefined();
      expect(history.canUndo()).toBe(false);
      expect(history.canRedo()).toBe(false);
    });

    it('initialEntriesを指定するとその内容で初期化される', () => {
      const history = new TypedHistory<number>({ initialEntries: [1, 2, 3] });
      expect(history.length).toBe(3);
      expect(history.cursor).toBe(2);
      expect(history.snapshot()).toBe(3);
    });
  });

  describe('push / undo / redo', () => {
    it('pushするとカーソルが末尾に進む', () => {
      const history = new TypedHistory<number>();
      history.push(1);
      history.push(2);
      expect(history.length).toBe(2);
      expect(history.cursor).toBe(1);
      expect(history.snapshot()).toBe(2);
    });

    it('undo/redoでカーソルが移動する', () => {
      const history = new TypedHistory<number>();
      history.push(1);
      history.push(2);
      history.push(3);

      expect(history.canUndo()).toBe(true);
      expect(history.undo()).toBe(2);
      expect(history.undo()).toBe(1);
      expect(history.canUndo()).toBe(false);
      expect(history.undo()).toBeUndefined();

      expect(history.canRedo()).toBe(true);
      expect(history.redo()).toBe(2);
      expect(history.redo()).toBe(3);
      expect(history.canRedo()).toBe(false);
      expect(history.redo()).toBeUndefined();
    });

    it('undo後にpushするとそれ以降の履歴が破棄される', () => {
      const history = new TypedHistory<number>();
      history.push(1);
      history.push(2);
      history.push(3);
      history.undo();
      history.undo();
      history.push(9);

      expect(history.length).toBe(2);
      expect(history.snapshot()).toBe(9);
      expect(history.canRedo()).toBe(false);
    });
  });

  describe('atBoundary', () => {
    it('デフォルト: 移動できない場合はundefinedを返す（実行できたかどうかを判別できる）', () => {
      const history = new TypedHistory<number>();
      history.push(1);

      expect(history.undo()).toBeUndefined();
      expect(history.cursor).toBe(0);

      expect(history.redo()).toBeUndefined();
      expect(history.cursor).toBe(0);
    });

    it("'current'を指定すると移動できない場合は現在の要素を返す", () => {
      const history = new TypedHistory<number>({ atBoundary: 'current' });
      history.push(1);
      history.push(2);

      // 末尾なのでredoできないが、現在の要素が返る
      expect(history.redo()).toBe(2);
      expect(history.cursor).toBe(1);

      expect(history.undo()).toBe(1);
      // 先頭なのでundoできないが、現在の要素が返る
      expect(history.undo()).toBe(1);
      expect(history.cursor).toBe(0);
    });

    it('canUndo/canRedoはatBoundaryの設定に関わらず実行可否を返す', () => {
      const history = new TypedHistory<number>({ atBoundary: 'current' });
      history.push(1);

      expect(history.canUndo()).toBe(false);
      expect(history.canRedo()).toBe(false);
    });
  });

  describe('init / clear', () => {
    it('init()に新しいエントリーを渡すと状態がリセットされる', () => {
      const history = new TypedHistory<number>({ initialEntries: [1, 2, 3] });
      history.init([9]);
      expect(history.length).toBe(1);
      expect(history.cursor).toBe(0);
      expect(history.snapshot()).toBe(9);
    });

    it('引数なしでinit()を呼ぶと空になる', () => {
      const history = new TypedHistory<number>({ initialEntries: [1, 2, 3] });
      history.init();
      expect(history.length).toBe(0);
      expect(history.cursor).toBe(-1);
    });

    it('clear()を呼ぶと空になる', () => {
      const history = new TypedHistory<number>({ initialEntries: [1, 2, 3] });
      history.clear();
      expect(history.length).toBe(0);
      expect(history.cursor).toBe(-1);
      expect(history.snapshot()).toBeUndefined();
    });
  });

  describe('maxLength', () => {
    it('初期状態を保持する分1件多く保持される', () => {
      const history = new TypedHistory<number>({ maxLength: 2 });
      for (let i = 1; i <= 5; i++) {
        history.push(i);
      }
      // maxLength(2) + 1 = 3件まで保持される
      expect(history.length).toBe(3);
      expect(history.snapshot()).toBe(5);
      expect(history.undo()).toBe(4);
      expect(history.undo()).toBe(3);
      expect(history.canUndo()).toBe(false);
    });
  });

  describe('copyStrategy', () => {
    it('deep(デフォルト): push後に元オブジェクトを変更してもエントリーに反映されない', () => {
      const history = new TypedHistory<{ value: number }>();
      const original = { value: 1 };
      history.push(original);
      original.value = 999;
      expect(history.snapshot()).toEqual({ value: 1 });
    });

    it('none: push後に元オブジェクトを変更するとエントリーにも反映される', () => {
      const history = new TypedHistory<{ value: number }>({
        copyStrategy: 'none',
      });
      const original = { value: 1 };
      history.push(original);
      original.value = 999;
      expect(history.snapshot()).toEqual({ value: 999 });
    });

    it('shallow: トップレベルはコピーされるがネストされた値は共有される', () => {
      const history = new TypedHistory<{ nested: { value: number } }>({
        copyStrategy: 'shallow',
      });
      const original = { nested: { value: 1 } };
      history.push(original);
      original.nested.value = 999;
      expect(history.snapshot()).toEqual({ nested: { value: 999 } });
    });

    it('関数を指定するとカスタムの保持方法になる', () => {
      const copyStrategy = vi.fn((entry: { value: number }) => ({
        value: entry.value * 2,
      }));
      const history = new TypedHistory<{ value: number }>({ copyStrategy });
      history.push({ value: 3 });
      expect(copyStrategy).toHaveBeenCalledWith({ value: 3 });
      expect(history.snapshot()).toEqual({ value: 6 });
    });
  });

  describe('snapshot', () => {
    it('現在のエントリーのディープコピーを返す', () => {
      const history = new TypedHistory<{ value: number }>({
        copyStrategy: 'none',
      });
      history.push({ value: 1 });
      const snapshot = history.snapshot();
      snapshot!.value = 999;
      expect(history.snapshot()).toEqual({ value: 1 });
    });
  });
});
