import { EventEmitter, IEvent } from '../EventEmitter';
/**
 * Task status type
 */
export type TStatus = 'new' | 'running' | 'stopped' | 'failed' | 'done';
/**
 * Task statuses list
 */
export declare const TASK_STATUSES: TStatus[];
/**
 * Task interface
 */
export interface ITask {
    name: string;
    label: string;
    linked: boolean;
    precision: number;
    event_debounce: number;
    progress: number;
    total: number;
    value: number;
    error: string;
    status: TStatus;
    startTime: number;
    stopTime: number;
    elapsedTime: number;
    complete: boolean;
    item: any;
}
/**
 * `Symbol` private props key name
 */
declare const PROPS: unique symbol;
/**
 * @class Task
 */
export declare class Task implements ITask {
    /**
     * Task global event debounce milliseconds
     */
    static get event_debounce(): number;
    static set event_debounce(value: any);
    /**
     * Task global precision ~ round decimal places
     */
    static get decimal_precision(): number;
    static set decimal_precision(value: any);
    /**
     * Instance "private" props
     */
    [PROPS]: {
        name: string;
        label: string;
        linked: boolean;
        precision: number;
        event_debounce: number;
        progress: number;
        total: number;
        value: number;
        error: string;
        status: TStatus;
        startTime: number;
        stopTime: number;
        complete: boolean;
        item: any;
        _done: boolean;
        _round: (val: number) => number;
        _emitter: EventEmitter;
        _debounced_update: () => void;
    };
    /**
     * Task name
     */
    get name(): string;
    /**
     * Task label
     */
    get label(): string;
    /**
     * Task linked - value/total/progress (recalculate on change)
     */
    get linked(): boolean;
    /**
     * Task precision - `integer` decimal places
     */
    get precision(): number;
    /**
     * Task event debounce milliseconds (default: `Tasks.event_debounce`)
     */
    get event_debounce(): number;
    /**
     * Task progress
     */
    get progress(): number;
    /**
     * Task total
     */
    get total(): number;
    /**
     * Task value
     */
    get value(): number;
    /**
     * Task error
     */
    get error(): string;
    /**
     * Task status
     */
    get status(): TStatus;
    /**
     * Task startTime - timestamp milliseconds (i.e. `Date.now()`)
     */
    get startTime(): number;
    /**
     * Task stopTime - timestamp milliseconds (i.e. `Date.now()`)
     */
    get stopTime(): number;
    /**
     * Task elapsedTime - millisecond timestamps difference (i.e. `stopTime - startTime`)
     */
    get elapsedTime(): number;
    /**
     * Task complete
     */
    get complete(): boolean;
    /**
     * Task item
     */
    get item(): any;
    /**
     * Create new instance
     *
     * @param name - task name
     * @param linked - task value/total/progress linked ~ recalculate on change
     * @param precision - decimal places (default: `Task.decimal_precision`)
     * @param event_debounce - event debounce milliseconds (default: `Task.event_debounce`)
     */
    constructor(name: string, linked?: boolean, precision?: number, event_debounce?: number);
    /**
     * Get task data
     *
     * @returns `ITask` options ~ i.e. `{name, label, linked, precision, event_debounce, progress, total, value, error, status, startTime, stopTime, complete, item}`
     */
    get data(): () => ITask;
    /**
     * Update event trigger
     *
     * @returns `Task` instance
     */
    get update(): () => Task;
    /**
     * Add update event subscriber ~ `event = {type: 'update', data: ITask}`
     *
     * @param listener - event callback listener
     * @returns `(()=>void)` unsubscribe callback
     */
    subscribe(listener: (event: IEvent) => void): () => void;
    /**
     * Task start
     *
     * @returns `Task` instance
     */
    start(restart?: boolean): Task;
    /**
     * Task stop
     *
     * @returns `Task` instance
     */
    stop(): Task;
    /**
     * Task failed
     *
     * @returns `Task` instance
     */
    failure(error?: any): Task;
    /**
     * Task done
     *
     * @param completeProgress - set full progress ~ enabled when `linked` (i.e. `progress=100` and `value=total`)
     * @returns `Task` instance
     */
    done(completeProgress?: boolean): Task;
    /**
     * Set progress
     *
     * @param progress - task percentage progress (`0-100`)
     * @param _value - unlinked task `value` update ~ ignores `undefined`
     * @param _total - unlinked task `total` update ~ ignores `undefined`
     * @returns `Task` instance
     */
    setProgress(progress: number, _value?: number, _total?: number): Task;
    /**
     * Set total
     *
     * @param total
     * @returns `Task` instance
     */
    setTotal(total: number): Task;
    /**
     * Set value
     *
     * @param value
     * @returns `Task` instance
     */
    setValue(value: number): Task;
    /**
     * Set item
     *
     * @param item
     * @returns `Task` instance
     */
    setItem(item: any): Task;
    /**
     * Create instance from existing task options
     *
     * @param options - `ITask` options ~ i.e. `{name, label, linked, precision, event_debounce, progress, total, value, error, status, startTime, stopTime, complete, item}`
     * @param precision - decimal places (default: `Task.decimal_precision`)
     * @param event_debounce - event debounce milliseconds (default: `Task.event_debounce`)
     * @returns `Task` instance
     * @throws validation `Error`
     */
    static create(options: ITask, precision?: number, event_debounce?: number): Task;
}
export {};
