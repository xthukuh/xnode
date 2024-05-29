import { _clone } from './_clone';
import { _posInt } from './_number';
import { _arrayList } from './_objects';
import { _errorText, _str } from './_string';

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
 * Parallel resolve list items `<T=any>[]`
 * 
 * @example
 * await _asyncAll<number, number>([1, 2], async (num) => num * 2) //[{status:'resolved',index:0,value:2},{status:'resolved',index:1,value:4}]
 * await _asyncAll([() => Promise.resolve(1), 2], async (num) => num * 2) //[{status:'resolved',index:0,value:2},{status:'resolved',index:1,value:4}]
 * await _asyncAll([async () => Promise.resolve(2), 4]) //[{status:'resolved',index:0,value:2},{status:'resolved',index:1,value:4}]
 * 
 * @param items - queue list _**(supports promise or callback values)**_
 * @param callback - resolve queue item callback ~ supports parameters:
 * - `item:T` ~ next queue item
 * - `index:number` ~ next queue item index
 * - `length:number` ~ queued items count
 * - _**callback result is added to the `IPromiseResult[]` with same `index`**_
 * 
 * @param onProgress - queue on progress callback ~ supports parameters:
 * - `percent:number` ~ queue processed items percentage (`integer 0 - 100`)
 * - `total:number` ~ queued items count
 * - `complete:number` ~ queue resolved items count
 * - `failures:number` ~ queue rejected items count
 * - _**returns void**_
 * 
 * @returns `Promise<IPromiseResult<TResult>[]>`
 */
export const _asyncAll = async<T = any, TResult = any>(
	items: (T|Promise<T>|(()=>T|Promise<T>))[],
	callback?: (item:T,index:number,length:number)=>Promise<TResult>,
	onProgress?: (percent:number,total:number,complete:number,failures:number)=>void
): Promise<IPromiseResult<TResult>[]> => {
	return new Promise((resolve) => {
		
		//-- queue arguments
		const _callback: undefined|((item:T,index:number,length:number)=>Promise<TResult>) = 'function' === typeof callback ? callback : undefined;
		const _onProgress: undefined|((percent:number,total:number,complete:number,failures:number)=>void) = 'function' === typeof onProgress ? onProgress : undefined;

		//-- queue promise
		let complete = 0, failures = 0;
		interface IQueueItem {index: number; value: T;}
		const queue: IQueueItem[] = _arrayList(items).map((value, index) => ({index, value}));
		const length = queue.length;
		const results: IPromiseResult<TResult>[] = [];
		const _resolve = (): void => void setTimeout(() => resolve(results), 0);

		//-- queue size check
		if (!length){
			if (_onProgress) _onProgress(100, length, complete, failures);
			return _resolve();
		}
		else if (_onProgress) _onProgress(0, length, complete, failures);

		//fn => helper > pending promise complete
		const _done = (failed: boolean = false): void => {
			complete ++;
			if (failed) failures ++;

			//-- progress update (on different thread)
			if (_onProgress){
				const percent: number = Math.min(Math.floor(complete/length * 100), 100);
				try {
					_onProgress(percent, length, complete, failures);
				}
				catch (err: any){
					console.warn(`[IGNORED] _asyncAll > onProgress callback exception; ${_errorText(err)}`);
				}
			}

			//-- check finished
			if (complete >= length) _resolve();
		};

		//-- queue all pending promises
		queue.forEach((next: IQueueItem): void => {
			(async () => {
				let {value: item, index} = next;
				if ('function' === typeof item) item = item();
				if (item instanceof Promise) item = await item;
				return _callback ? _callback(item, index, length) : item;
			})()
			.then((value: any) => {
				results[next.index] = {status: 'resolved', index: next.index, value};
				return _done();
			})
			.catch((reason: any) => {
				results[next.index] = {status: 'rejected', index: next.index, reason};
				return _done(true);
			});
		});
	});
};

/**
 * Parallel resolve list items `<T=any>[]` with max simultaneous promises size limit
 * 
 * @param values - queue values
 * @param size - max simultaneous promises size (default: `0` ~ unlimited)
 * @param callback - queue resolve value callback ~ `(value:T,index:number,length:number)=>Promise<TResult=any>`
 * @param onProgress - queue on progress callback ~ `(percent:number,total:number,complete:number,failures:number)=>void`
 * @returns `Promise<IPromiseResult<TResult>[]>`
 */
export const _asyncQueue = async <T = any, TResult = any>(values: T[], size: number = 0, callback?: (value:T,index:number,length:number)=>Promise<TResult>, onProgress?: (percent:number,total:number,complete:number,failures:number)=>void): Promise<IPromiseResult<TResult>[]> => {
	return new Promise((resolve: (results:IPromiseResult<TResult>[])=>void): void => {
		
		//-- queue arguments
		size = _posInt(size) ?? 0;
		const _callback: undefined|((value:T,index:number,length:number)=>Promise<TResult>) = 'function' === typeof callback ? callback : undefined;
		const _onProgress: undefined|((percent:number,total:number,complete:number,failures:number)=>void) = 'function' === typeof onProgress ? onProgress : undefined;
		
		//-- queue promise
		interface IQueueItem {index: number; value: T;}
		const queue: IQueueItem[] = _arrayList(values).map((value, index) => ({index, value}));
		const length = queue.length;
		let pending = 0, complete = 0, failures = 0;

		//-- queue results
		const results: IPromiseResult<TResult>[] = [];
		const _resolve = (): void => void setTimeout(() => resolve(results), 0);
		
		//-- queue size check
		if (!length){
			if (_onProgress) _onProgress(100, length, complete, failures);
			return _resolve();
		}
		else if (_onProgress) _onProgress(0, length, complete, failures);

		//fn => helper > queue next timeout multiple calls throttle (50ms)
		let next_timeout: any = undefined;
		const _queue_next = (): void => {
			clearTimeout(next_timeout);
			next_timeout = setTimeout(() => _next(), next_timeout ? 50 : 0);
		};

		//>> queue next start
		_queue_next();

		//fn => helper > queue next
		function _next(): void {
			
			//-- pending limit > ignore ~ simultaneous size limit
			if (size && (pending + 1) > size) return;
			
			//-- next queue item > ignore ~ empty queue
			const next: IQueueItem|undefined = queue.shift();
			if (!next) return;

			//-- pending increment
			pending ++;

			//fn => helper > pending promise complete
			const _done = (failed: boolean = false): void => {
				
				//-- decrement pending > increment complete/failures
				pending --;
				complete ++;
				if (failed) failures ++;

				//-- progress update (on different thread)
				if (_onProgress){
					const percent: number = Math.min(Math.floor(complete/length * 100), 100);
					try {
						_onProgress(percent, length, complete, failures);
					}
					catch (err: any){
						console.warn(`[IGNORED] _asyncBatch > onProgress callback exception; ${_errorText(err)}`);
					}
				}
				
				//<< queue complete/next
				if (complete >= length) return _resolve();
				return _queue_next();
			};

			//-- pending promise
			(async()=>_callback ? _callback(next.value, next.index, length) : next.value)()
			.then((result: any): void => {
				results[next.index] = {status: 'resolved', index: next.index, value: result};
				_done();
			})
			.catch((reason: any): void => {
				results[next.index] = {status: 'rejected', index: next.index, reason};
				_done(true);
			});

			//<< queue next (add)
			_queue_next();
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
			pending.resolved = 1;
			if (PENDING_CACHE[key] === pending && !pending.keep) delete PENDING_CACHE[key];
		};
		_pending_reject = (reason: any, abort: boolean = false): void => {
			if (!resolved){
				resolved = -1;
				reject(reason);
			}
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