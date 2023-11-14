/**
 * Promise result interface
 */
export interface IPromiseResult<TResult> {
    status: 'resolved' | 'rejected';
    index: number;
    value?: TResult;
    reason?: any;
}
/**
 * Parallel resolve list items `<T=any>[]`
 * - i.e. await _asyncAll<number, number>([1, 2], async (num) => num * 2) --> [{status: 'resolved', index: 0, value: 2}, {status: 'resolved', index: 1, value: 4}]
 *
 * @param values - queue values
 * @param callback - queue resolve value callback ~ `(value:T,index:number,length:number)=>Promise<TResult=any>`
 * @param onProgress - queue on progress callback ~ `(percent:number,total:number,complete:number,failures:number)=>void`
 * @returns `Promise<IPromiseResult<TResult>[]>`
 */
export declare const _asyncAll: <T = any, TResult = any>(values: T[], callback?: ((value: T, index: number, length: number) => Promise<TResult>) | undefined, onProgress?: ((percent: number, total: number, complete: number, failures: number) => void) | undefined) => Promise<IPromiseResult<TResult>[]>;
/**
 * Parallel resolve list items `<T=any>[]` with max simultaneous promises size limit
 *
 * @param values - queue values
 * @param size - max simultaneous promises size (default: `0` ~ unlimited)
 * @param callback - queue resolve value callback ~ `(value:T,index:number,length:number)=>Promise<TResult=any>`
 * @param onProgress - queue on progress callback ~ `(percent:number,total:number,complete:number,failures:number)=>void`
 * @returns `Promise<IPromiseResult<TResult>[]>`
 */
export declare const _asyncQueue: <T = any, TResult = any>(values: T[], size?: number, callback?: ((value: T, index: number, length: number) => Promise<TResult>) | undefined, onProgress?: ((percent: number, total: number, complete: number, failures: number) => void) | undefined) => Promise<IPromiseResult<TResult>[]>;
/**
 * Get async iterable values (i.e. `for await (const value of _asyncValues(array)){...}`)
 *
 * @param array  Values
 * @returns Async iterable object
 */
export declare const _asyncValues: <T = any>(array: T[]) => {
    values: () => T[];
    size: () => number;
    each: (callback: (value: T, index: number, length: number, _break: () => void) => Promise<any>) => Promise<void>;
    [Symbol.asyncIterator]: () => {
        next: () => Promise<{
            done: boolean;
            value: T;
        }>;
    };
};
/**
 * Delay promise
 *
 * @param timeout  Delay milliseconds
 * @returns `Promise<number>` timeout
 */
export declare const _sleep: (timeout: number) => Promise<number>;
/**
 * Resolve promise callback/value
 *
 * @param this - call context
 * @param promise - resolve ~ `()=>Promise<any>|any` callback result | `any` value
 * @param _new - whether to return new promise
 * @returns `Promise<any>` ~ `Promise.resolve` value/result
 */
export declare function _resolve(this: any, promise: (() => Promise<any> | any) | any, _new?: boolean): Promise<any>;
/**
 * Pending promise interface
 */
export interface IPendingPromise {
    /**
     * - unique promise key/name/ID
     */
    key: string;
    /**
     * - promise instance
     */
    promise: Promise<any>;
    /**
     * - promise resolved/rejected/aborted
     */
    done: boolean;
    /**
     * - promise resolved (successful) ~ `false` when pending or rejected
     */
    resolved: boolean;
    /**
     * - promise aborted
     */
    aborted: boolean;
    /**
     * - start time ~ pending promise create time (milliseconds i.e. `Date.now()`)
     */
    time_start: number;
    /**
     * - stop time ~ time resolved/rejected/aborted (milliseconds i.e. `Date.now()`)
     */
    time_stop?: number;
    /**
     * - stop time ~ time resolved/rejected (milliseconds i.e. `Date.now()`)
     */
    time_end?: number;
    /**
     * - previous chain promise (resolved)
     */
    previous?: IPendingPromise;
    /**
     * - resolve next chain promise
     *
     * @param previous - previous `IPendingPromise`
     * @returns `Promise<any>`
     */
    next?: (previous: IPendingPromise) => Promise<any>;
    /**
     * - cancel pending promise
     *
     * @returns `void`
     */
    abort: () => void;
}
/**
 * @class pending promise abort error
 */
export declare class PendingAbortError extends Error {
    name: string;
    pending: IPending;
    constructor(message: string, pending: IPending);
}
/**
 * Pending promise item interface
 */
export interface IPending {
    /**
     * - promise key ~ unique identifier (ignores/chains duplicate)
     */
    key: string;
    /**
     * - pending promise
     */
    promise: Promise<any>;
    /**
     * - resolved state ~ `0` = pending, `1` = resolved, `-1` = rejected
     */
    resolved: -1 | 0 | 1;
    /**
     * - whether to keep resolved promise in cache ~ pending promises are automatically removed from cache by default or on rejection.
     */
    keep: boolean;
    /**
     * - whether pending promise was aborted
     */
    aborted: boolean;
    /**
     * - whether pending promise was aborted
     */
    abortError?: PendingAbortError;
    /**
     * - abort pending promise ~ aborted pending promises will reject with `AbortPendingError` reason
     *
     * @param reason - specify abort reason (default: `'aborted'`)
     */
    abort: (reason?: string) => void;
}
/**
 * Pending promise interface ~ `extends Promise<any>`
 */
export interface IPendingPromise extends Promise<any> {
    pending: IPending;
}
/**
 * Pending promise task cache
 */
export declare const PENDING_CACHE: {
    [key: string]: IPending;
};
/**
 * Create/resume pending promise
 *
 * @param key - unique promise key/name/ID ~ `string` (i.e. `String(Date.now())`)
 * @param promise - promise instance creator callback ~ `()=>Promise<TResult>`
 * @param mode - new pending behavior when `key` duplicate exists:
 * - `0` = ignore (default) ~ resolve pending
 * - `1` = replace ~ replace pending promise
 * - `2` = retry ~ resolve next if pending promise rejection
 * - `3` = chain ~ resolve next after pending promise is done (resolves/rejects)
 * @param keep - whether to keep resolved promise in cache (default: `false`) ~ pending promises are automatically removed from cache by default or on rejection.
 * @returns `IPendingPromise` ~ `extends Promise<any>`
 */
export declare const _pending: (key: string, promise: () => Promise<any>, mode?: 0 | 1 | 2 | 3, keep?: boolean) => IPendingPromise;
/**
 * Abort cached pending promises
 *
 * @param remove - whether to remove aborted promise from cache (default: `false`)
 * @param key - specify cached promise key to abort (default: `all` ~ when key is `undefined`/blank)
 * @param reason - specify abort reason (default: `'aborted'`)
 * @returns `void`
 */
export declare const _pendingAbort: (remove?: boolean, key?: string, reason?: string) => void;
