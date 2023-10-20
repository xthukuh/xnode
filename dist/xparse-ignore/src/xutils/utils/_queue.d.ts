/**
 * Queue object interface
 */
export interface IQueue<T> {
    count: number;
    length: number;
    isEmpty: boolean;
    enqueue(value: T): void;
    dequeue(): T | undefined;
    peek(): T | undefined;
    values(): T[];
}
/**
 * Create queue object
 *
 * @returns `IQueue`
 */
export declare const _queue: <T = any>() => IQueue<T>;
