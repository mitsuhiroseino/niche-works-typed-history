import CursoredList from './CursoredList';

describe('CursoredList', () => {
  it('初期状態', () => {
    const list = new CursoredList<number>();
    expect(list.length).toBe(0);
    expect(list.cursor).toBe(-1);
    expect(list.current).toBeUndefined();
    expect(list.hasPrevious).toBe(false);
    expect(list.hasNext).toBe(false);
  });

  describe('append', () => {
    it('追加するたびにカーソルが末尾に移動する', () => {
      const list = new CursoredList<number>();
      list.append(1);
      expect(list.length).toBe(1);
      expect(list.cursor).toBe(0);
      expect(list.current).toBe(1);

      list.append(2);
      expect(list.length).toBe(2);
      expect(list.cursor).toBe(1);
      expect(list.current).toBe(2);
    });

    it('カーソルより後ろのエントリーは破棄される', () => {
      const list = new CursoredList<number>();
      list.append(1);
      list.append(2);
      list.append(3);
      list.backward();
      list.backward();
      expect(list.current).toBe(1);

      list.append(4);
      expect(list.length).toBe(2);
      expect(list.cursor).toBe(1);
      expect(list.current).toBe(4);
      // 戻れる位置は1のみ
      expect(list.backward()).toBe(1);
      expect(list.hasNext).toBe(true);
      expect(list.forward()).toBe(4);
    });

    it('maxLengthを超えると先頭から削除されカーソルが補正される', () => {
      const list = new CursoredList<number>({ maxLength: 3 });
      list.append(1);
      list.append(2);
      list.append(3);
      expect(list.length).toBe(3);
      expect(list.cursor).toBe(2);

      list.append(4);
      expect(list.length).toBe(3);
      expect(list.cursor).toBe(2);
      expect(list.current).toBe(4);
      // 先頭の1は削除されているので、戻れるのは2, 3まで
      list.backward();
      list.backward();
      expect(list.current).toBe(2);
      expect(list.hasPrevious).toBe(false);
    });

    it('maxLengthが0以下の場合は無制限', () => {
      const list = new CursoredList<number>({ maxLength: 0 });
      for (let i = 0; i < 10; i++) {
        list.append(i);
      }
      expect(list.length).toBe(10);
    });
  });

  describe('backward / forward', () => {
    it('前後に移動できる', () => {
      const list = new CursoredList<number>();
      list.append(1);
      list.append(2);
      list.append(3);

      expect(list.hasPrevious).toBe(true);
      expect(list.hasNext).toBe(false);

      expect(list.backward()).toBe(2);
      expect(list.cursor).toBe(1);
      expect(list.hasNext).toBe(true);

      expect(list.backward()).toBe(1);
      expect(list.cursor).toBe(0);
      expect(list.hasPrevious).toBe(false);

      expect(list.forward()).toBe(2);
      expect(list.forward()).toBe(3);
      expect(list.hasNext).toBe(false);
    });

    it('移動できない場合は現在の要素を返す', () => {
      const list = new CursoredList<number>();
      list.append(1);

      expect(list.backward()).toBe(1);
      expect(list.cursor).toBe(0);

      expect(list.forward()).toBe(1);
      expect(list.cursor).toBe(0);
    });

    it('空の場合はundefinedを返す', () => {
      const list = new CursoredList<number>();
      expect(list.backward()).toBeUndefined();
      expect(list.forward()).toBeUndefined();
    });
  });

  describe('atBoundary', () => {
    it("'current'(デフォルト): 移動できない場合は現在の要素を返す", () => {
      const list = new CursoredList<number>({ atBoundary: 'current' });
      list.append(1);

      expect(list.backward()).toBe(1);
      expect(list.cursor).toBe(0);
      expect(list.forward()).toBe(1);
      expect(list.cursor).toBe(0);
    });

    it("'none': 移動できない場合はundefinedを返し、カーソルは動かない", () => {
      const list = new CursoredList<number>({ atBoundary: 'none' });
      list.append(1);
      list.append(2);

      expect(list.forward()).toBeUndefined();
      expect(list.cursor).toBe(1);
      expect(list.current).toBe(2);

      expect(list.backward()).toBe(1);
      expect(list.backward()).toBeUndefined();
      expect(list.cursor).toBe(0);
      expect(list.current).toBe(1);
    });
  });

  describe('clear', () => {
    it('エントリーとカーソルをリセットする', () => {
      const list = new CursoredList<number>();
      list.append(1);
      list.append(2);

      list.clear();
      expect(list.length).toBe(0);
      expect(list.cursor).toBe(-1);
      expect(list.current).toBeUndefined();
    });
  });
});
