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
export const _asyncAll = async<T extends any, TResult extends any>(array: T[], callback?: (value: T, index: number, length: number) => Promise<TResult>): Promise<IPromiseResult<TResult>[]> => {
	return new Promise((resolve) => {
		const _buffer: IPromiseResult<TResult>[] = [];
		const _resolve = () => resolve(_buffer);
		const len = array.length;
		if (!len) return _resolve();
		let done = 0;
		array.forEach((v, i) => {
			(async()=>Promise.resolve(callback ? callback(v, i, len) : v) as Promise<TResult>)()
			.then(value => _buffer.push({status: 'resolved', index: i, value}))
			.catch(reason => _buffer.push({status: 'rejected', index: i, reason}))
			.finally(() => ++done === len ? _resolve() : undefined);
		});
	});
};

/**
 * Get async iterable values (i.e. `for await (const value of _asyncValues(array)){...}`)
 * 
 * @param array  Values
 * @returns Async iterable object
 */
export const _asyncValues = <T extends any>(array: T[]): {
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