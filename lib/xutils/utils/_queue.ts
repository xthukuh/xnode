/**
 * Queue object interface
 */
export interface IQueue<T> {
	count: number;
	length: number;
	isEmpty: boolean;
	enqueue(value: T): void;
	dequeue(): T|undefined;
	peek(): T|undefined;
	values(): T[];
}

/**
 * Create queue object
 * 
 * @returns `IQueue`
 */
export const _queue = <T extends any>(): IQueue<T> => {
	const items: {[key: number]: T} = {};
	let head: number = 0;
	let tail: number = 0;
	return {
		get count(): number {
			return tail;
		},
		get length(): number {
			return tail - head;
		},
		get isEmpty(): boolean {
			return this.length === 0;
		},
		enqueue(value: T): void {
			items[tail] = value;
			tail ++;
		},
		dequeue(): T|undefined {
			const item = items[head];
			delete items[head];
			head ++;
			return item;
		},
		peek(): T|undefined {
			return items[head];
		},
		values(): T[] {
			return Object.values(items);
		},
	};
};