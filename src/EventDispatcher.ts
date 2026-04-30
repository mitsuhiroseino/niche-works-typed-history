/**
 * イベントマップの基本型
 * キーがイベント名、値がペイロードの型
 */
export type EventMap = Record<string, Record<string, unknown>>;

export type EventInfo<
  M extends EventMap = EventMap,
  K extends keyof M = keyof M,
> = {
  /**
   * イベント名
   */
  type: K;

  /**
   * イベント発火時に設定された引数
   */
  payload: M[K];
};

/**
 * イベントハンドラー
 */
export type EventHandler<
  M extends EventMap = EventMap,
  K extends keyof M = keyof M,
> = (event: EventInfo<M, K>) => void;

export type OnHandlerOptions = {
  /**
   * イベントハンドラーのオーナー
   */
  owner?: any;
};

/**
 * ハンドラーを指定して削除する場合はhandlerを、
 * オーナーを指定して削除する場合はownerを指定する（両方の指定は不可）
 */
export type OffHandlerOptions =
  | { handler: EventHandler<any, any>; owner?: never }
  | { owner: any; handler?: never };

export type HandlerEntry = {
  handler: EventHandler<any, any>;
  options: OnHandlerOptions;
};

/**
 * イベントディスパッチャー
 */
export default class EventDispatcher<M extends EventMap = EventMap> {
  /**
   * イベントハンドラー
   */
  private _handlers: { [type: string]: HandlerEntry[] } = {};

  /**
   * イベントの抑止階層数
   */
  private _suppress: number = 0;

  private _setRegisteredHandlers(type: string, handlers: HandlerEntry[]): void {
    const key = type.toLowerCase();
    this._handlers[key] = handlers;
  }

  /**
   * 指定の種別のハンドラー配列を取得する
   */
  private _getRegisteredHandlers(type: string): HandlerEntry[] {
    const key = type.toLowerCase();
    const handlers = this._handlers[key] || [];
    this._handlers[key] = handlers;
    return handlers;
  }

  /**
   * イベントハンドラーを登録する
   * 同一ハンドラーの重複登録は無視される
   */
  on<K extends keyof M>(
    type: K,
    handler: EventHandler<M, K>,
    options?: OnHandlerOptions,
  ): void {
    const handlers = this._getRegisteredHandlers(type as string);

    // 重複登録を防ぐ
    const isDuplicate = handlers.some((info) => info.handler === handler);
    if (isDuplicate) {
      return;
    }

    const opts = { ...options };
    if (opts.owner == null) {
      opts.owner = this;
    }
    handlers.push({ handler, options: opts });
  }

  /**
   * イベントハンドラーを削除する
   * @param type - イベント名。省略した場合は全イベントが対象になる
   * @param options - handler を指定するとそのハンドラーのみ削除、owner を指定するとそのオーナーのハンドラーをすべて削除
   */
  off<K extends keyof M>(type: K, options?: OffHandlerOptions): void;
  off(options: OffHandlerOptions): void;
  off<K extends keyof M>(
    typeOrOptions: K | OffHandlerOptions,
    options?: OffHandlerOptions,
  ): void {
    if (typeof typeOrOptions === 'string') {
      // type 指定あり: 特定イベントのハンドラーを削除
      this._offByType(typeOrOptions, options ?? { owner: this });
    } else {
      // type 指定なし: 全イベントのハンドラーを削除
      for (const type of Object.keys(this._handlers)) {
        this._offByType(type, typeOrOptions as OffHandlerOptions);
      }
    }
  }

  private _offByType(type: string, options: OffHandlerOptions): void {
    const { handler, owner } = options as {
      handler?: EventHandler<any, any>;
      owner?: any;
    };
    const handlers = this._getRegisteredHandlers(type);
    this._setRegisteredHandlers(
      type,
      handlers.filter((info) => {
        if (handler) {
          return info.handler !== handler;
        } else {
          return info.options.owner !== owner;
        }
      }),
    );
  }

  /**
   * イベントを発火する
   */
  emit<K extends keyof M>(type: K, payload: M[K]): void {
    if (!this._canEmit()) {
      return;
    }
    const eventInfo: EventInfo<M, K> = { type, payload };
    // ハンドラー実行中に on/off が呼ばれても影響しないようコピーして実行
    const handlers = this._getRegisteredHandlers(type as string).concat();
    handlers.forEach(({ handler }) => {
      handler(eventInfo);
    });
  }

  /**
   * イベントの発火を抑止する
   */
  suppress(): void {
    this._suppress++;
  }

  /**
   * イベントの発火抑止を解除する
   */
  unsuppress(): void {
    this._suppress = Math.max(0, this._suppress - 1);
  }

  private _canEmit(): boolean {
    return !this._suppress;
  }

  /**
   * 全ハンドラーを削除しリソースを解放する
   */
  destructor(): void {
    this._handlers = {};
  }
}

/**
 * EventDispatcherを持つクラスのインターフェイス
 */
export interface Dispatchable<M extends EventMap = EventMap> {
  readonly events: EventDispatcher<M>;
}
