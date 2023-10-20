import { _str } from './_string';

/**
 * Promise result interface
 */
export interface IPromiseResult<TResult> {
	status: 'resolved'|'rejected';
	index: number;
	value?: TResult;
	reason?: any;
}

/**
 * Parallel resolve `array` values callback promises
 * - i.e. await _asyncAll<number, number>([1, 2], async (num) => num * 2) --> [{status: 'resolved', index: 0, value: 2}, {status: 'resolved', index: 1, value: 4}]
 * 
 * @param array  Entries
 * @param callback  Entry callback
 * @returns `Promise<IPromiseResult<TResult>[]>`
 */
export const _asyncAll = async<T = any, TResult = any>(array: T[], callback?: (value:T,index:number,length:number)=>Promise<TResult>): Promise<IPromiseResult<TResult>[]> => {
	return new Promise((resolve) => {
		const _buffer: IPromiseResult<TResult>[] = [];
		const _resolve = () => resolve(_buffer);
		const length = array.length;
		if (!length) return _resolve();
		let done = 0;
		const _handler: undefined|((value:T,index:number,length:number)=>Promise<TResult>) = 'function' === typeof callback ? callback : undefined;
		for (let index = 0; index < length; index ++){
			const value = array[index];
			(async()=>_handler ? _handler(value, index, length) : value)()
			.then((value: any) => {
				_buffer.push({status: 'resolved', index, value});
				return value;
			})
			.catch((reason: any) => _buffer.push({status: 'rejected', index, reason}))
			.finally(() => ++done >= length ? _resolve() : undefined);
		}
	});
};

/**
 * Get async iterable values (i.e. `for await (const value of _asyncValues(array)){...}`)
 * 
 * @param array  Values
 * @returns Async iterable object
 */
export const _asyncValues = <T = any>(array: T[]): {
	values: () => T[],
	size: () => number;
	each: (callback: (value: T, index: number, length: number, _break: ()=>void)=>Promise<any>) => Promise<void>;
	[Symbol.asyncIterator]: () => {
		next: () => Promise<{done: boolean; value: T}>;
	}
} => ({
	values: () => array,
	size: () => array.length,
	async each(callback: (value: T, index: number, length: number, _break: ()=>void)=>Promise<any>): Promise<void> {
		let self = this, cancel = false, index = -1, _break = () => {
			cancel = true;
		};
		for await (const value of self){
			index ++;
			if (cancel) break;
			await callback(value, index, self.size(), _break);
		}
	},
	[Symbol.asyncIterator](){
		let index = 0;
		const that = this;
		return {
			async next(): Promise<{done: boolean; value: T}> {
				let value: T = undefined as T, length = that.size();
				if (index >= length) return {done: true, value};
				value = await Promise.resolve(array[index]);
				index ++;
				return {done: false, value};
			},
		};
	},
});

/**
 * Delay promise
 * 
 * @param timeout  Delay milliseconds
 * @returns `Promise<number>` timeout
 */
export const _sleep = async (timeout: number): Promise<number> => {
	timeout = !isNaN(timeout) && timeout >= 0 ? timeout : 0
	return new Promise(resolve => setTimeout(() => resolve(timeout), timeout));
};

/**
 * Resolve promise callback/value
 * 
 * @param this - call context
 * @param promise - resolve ~ `()=>Promise<any>|any` callback result | `any` value
 * @param _new - whether to return new promise
 * @returns `Promise<any>` ~ `Promise.resolve` value/result
 */
export async function _resolve(this: any, promise: (()=>Promise<any>|any)|any, _new: boolean = false): Promise<any> {
	const resolved = Promise.resolve('function' !== typeof promise ? promise : (async () => promise.call(this))());
	return !_new ? resolved : new Promise((resolve: (value: any)=>void, reject: (reason: any)=>void) => resolved.then(resolve, reject));
};

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
	next?: (previous:IPendingPromise)=>Promise<any>;

	/**
	 * - cancel pending promise
	 * 
	 * @returns `void`
	 */
	abort: ()=>void;
}

/**
 * @class pending promise abort error
 */
export class PendingAbortError extends Error {
	name: string = 'PendingAbortError';
	pending: IPending;
	constructor(message: string, pending: IPending){
		super(message);
		this.pending = pending;
	}
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
	resolved: -1|0|1;

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
	abort: (reason?:string)=>void;
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
export const PENDING_CACHE: {[key: string]: IPending} = {};

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
export const _pending = (key: string, promise: ()=>Promise<any>, mode: 0|1|2|3 = 0, keep: boolean = false): IPendingPromise => {
	if (!(key = _str(key, true))) throw new TypeError('Invalid pending `key` value.');
	if ('function' !== typeof promise) throw new TypeError('Invalid pending `promise` callback function.');
	let _pending_resolve: ((value:any)=>void)|undefined = undefined; 
	let _pending_reject: ((reason:any, abort?:boolean)=>void)|undefined = undefined; 
	let pending: IPending = PENDING_CACHE[key];
	const current = pending && pending.promise instanceof Promise && pending.resolved > -1 ? pending.promise : undefined;
	if (!current || mode){
		const next_promise = (!current || mode === 1) ? _resolve(promise) : _resolve(current, true)
		.then(async (value: any) => mode === 2 ? value : _resolve(promise))
		.catch(async () => _resolve(promise));
		pending = PENDING_CACHE[key] = {
			key,
			promise: next_promise,
			resolved: 0,
			keep,
			aborted: false,
			abortError: undefined,
			abort: function(reason?: string): void {
				const that = this;
				if (!('function' === typeof _pending_reject && !that.resolved && !that.aborted)) return;
				_pending_reject(that.abortError = new PendingAbortError(_str(reason, true) || 'aborted', that), that.aborted = true);
			},
		};
	}
	else {
		pending.abortError = undefined;
		pending.aborted = false;
	}
	let resolved: -1|0|1 = 0;
	const pending_promise: IPendingPromise = new Promise((resolve: (value: any)=>void, reject: (reason: any)=>void) => {
		_pending_resolve = (value: any): void => {
			if (!resolved){
				resolved = 1;
				resolve(value);
			}
			// else console.debug('--- pending resolve - ignored:', {key, value, resolved}); //TODO: remove debug log
			pending.resolved = 1;
			if (PENDING_CACHE[key] === pending && !pending.keep) delete PENDING_CACHE[key];
		};
		_pending_reject = (reason: any, abort: boolean = false): void => {
			if (!resolved){
				resolved = -1;
				reject(reason);
			}
			// else console.debug('--- pending reject - ignored:', {key, reason, resolved}); //TODO: remove debug log
			if (abort) return;
			pending.resolved = -1;
			if (PENDING_CACHE[key] === pending) delete PENDING_CACHE[key];
		};
		const _reject = (reason: any): void => void ('function' === typeof _pending_reject ? _pending_reject(reason) : null);
		pending.promise.then(_pending_resolve, _reject);
	}) as any;
	pending_promise.pending = pending;
	return pending_promise;
}

/**
 * Abort cached pending promises
 * 
 * @param remove - whether to remove aborted promise from cache (default: `false`)
 * @param key - specify cached promise key to abort (default: `all` ~ when key is `undefined`/blank)
 * @param reason - specify abort reason (default: `'aborted'`)
 * @returns `void`
 */
export const _pendingAbort = (remove: boolean = false, key?: string, reason?: string): void => {
	if (key = _str(key, true)){
		const pending = PENDING_CACHE[key];
		if ('function' === typeof pending?.abort) pending.abort(reason);
		if (remove && pending?.key) delete PENDING_CACHE[pending.key];
	}
	else {
		for (const pending of Object.values(PENDING_CACHE)){
			if ('function' === typeof pending?.abort) pending.abort(reason);
			if (remove && pending?.key) delete PENDING_CACHE[pending.key];
		}
	}
};