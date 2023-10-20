import { EventEmitter, IEvent } from '../EventEmitter';
import { ITask, Task } from './_Task';
/**
 * Tasks data interface
 */
export interface ITasksData {
    precision: number;
    event_debounce: number;
    size: number;
    progress: number;
    running: boolean;
    started: boolean;
    complete: boolean;
    startTime: number;
    stopTime: number;
    elapsedTime: number;
    tasks: {
        [name: string]: ITask;
    };
}
/**
 * `Symbol` private props key name
 */
declare const PROPS: unique symbol;
/**
 * @class Tasks
 */
export declare class Tasks {
    /**
     * Tasks global event debounce milliseconds
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
        precision: number;
        event_debounce: number;
        _tasks: Map<string, Task>;
        _unsubscribe: Map<string, () => void>;
        _emitter: EventEmitter;
        _debounced_update: () => void;
    };
    /**
     * Tasks count
     */
    get size(): number;
    /**
     * Task precision - `integer` decimal places
     */
    get precision(): number;
    /**
     * Task event debounce milliseconds (default: `Tasks.event_debounce`)
     */
    get event_debounce(): number;
    /**
     * Create new instance
     *
     * @param precision - decimal places (default: `Tasks.decimal_precision`)
     * @param event_debounce - event debounce milliseconds (default: `Tasks.event_debounce`)
     */
    constructor(precision?: number, event_debounce?: number);
    /**
     * Get tasks data
     *
     * @returns `ITasksData` options ~ i.e. `{precision, event_debounce, size, progress, running, started, complete, startTime, stopTime, elapsedTime, tasks}`
     */
    get data(): () => ITasksData;
    /**
     * Update event trigger
     *
     * @returns `Task` instance
     */
    get update(): () => Tasks;
    /**
     * Add update event subscriber ~ `event = {type: 'update', data: ITask}`
     *
     * @param listener - event callback listener
     * @returns `(()=>void)` unsubscribe callback
     */
    subscribe(listener: (event: IEvent) => void): () => void;
    /**
     * Check if task name exists
     *
     * @param name
     * @returns `boolean`
     */
    has(name: string): boolean;
    /**
     * Get task by name
     *
     * @param name - task name
     * @returns `Task`
     */
    get(name: string): Task | undefined;
    /**
     * Add new task
     *
     * @param task - `string` task name | `ITask` task data | `Task` instance
     * @param linked - task value/total/progress linked ~ recalculate on change
     * @param event_debounce - event debounce milliseconds (default: `Task.event_debounce`)
     * @returns `Task`
     */
    add(task: string | ITask | Task, linked?: boolean, event_debounce?: number): Task;
    /**
     * Remove task by name
     *
     * @param name - task name
     * @returns `Tasks` instance
     */
    remove(name: string): Tasks;
}
export {};
