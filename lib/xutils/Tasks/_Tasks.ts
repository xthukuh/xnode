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
	endTime: number;
	elapsedTime: number;
	tasks: {[name: string]: ITask};
}

/**
 * Default event debounce milliseconds
 */
let DEFAULT_EVENT_DEBOUNCE: number = 200;

/**
 * Default precision ~ round decimal places
 */
let DEFAULT_PRECISION: number = 2;

/**
 * Helper - parse positive number
 * 
 * @param val
 * @param _default
 * @param _blank
 * @returns `number`
 */
const _pos_num = (val: any, _default: number = 0, _blank: number = 0): number => {
	if ([undefined, null].includes(val) || 'string' === typeof val && !(val = val.trim())) return _blank;
	if (!isNaN(val = parseFloat(val)) && Number.isFinite(val) && val >= 0) return val;
	return _default;
};

/**
 * Helper - parse positive integer
 * 
 * @param val
 * @param _default
 * @param _blank
 * @returns `number` integer
 */
const _pos_int = (val: any, _default: number = 0, _blank: number = 0): number => parseInt(_pos_num(val, _default, _blank) + '');

/**
 * Helper - round number
 * 
 * @param val - round value
 * @param places - precision decimal places [default: `DEFAULT_PRECISION`]
 * @returns `number` rounded
 */
const _round = (val: number, places?: number): number => {
	const p = 10 ** _pos_int(places, DEFAULT_PRECISION, DEFAULT_PRECISION);
	return Math.round((val + Number.EPSILON) * p) / p;
};

/**
 * Helper - debounced callback
 * 
 * @param callback - callback handler
 * @param timeout - timeout milliseconds
 * @returns `()=>void` debounced callback
 */
const _debounce = (callback: ()=>void, timeout: number = 0): () => void => {
	let timer: any, max_wait: any;
	const _handler = () => {
		clearTimeout(timer);
		clearTimeout(max_wait);
		max_wait = undefined;
		callback();
	};
	return () => {
		if (!timeout) return callback();
		clearTimeout(timer);
		timer = setTimeout(_handler, timeout);
		if (!max_wait) max_wait = setTimeout(_handler, Math.floor(timeout * 1.5));
	};
};

/**
 * `Symbol` private props key name
 */
const PROPS = Symbol(`__private_props_${Date.now()}__`);

/**
 * @class Tasks
 */
export class Tasks
{
	/**
	 * Tasks global event debounce milliseconds
	 */
	static get event_debounce(): number {
		return DEFAULT_EVENT_DEBOUNCE;
	}
	static set event_debounce(value: any){
		DEFAULT_EVENT_DEBOUNCE = _pos_int(value, DEFAULT_EVENT_DEBOUNCE, 0);
	}

	/**
	 * Task global precision ~ round decimal places
	 */
	static get decimal_precision(): number {
		return DEFAULT_PRECISION;
	}
	static set decimal_precision(value: any){
		DEFAULT_PRECISION = _pos_int(value, DEFAULT_PRECISION, 2);
	}

	/**
	 * Instance "private" props
	 */
	[PROPS]: {
		precision: number;
		event_debounce: number;
		_tasks: Map<string, Task>;
		_unsubscribe: Map<string, ()=>void>;
		_emitter: EventEmitter;
		_debounced_update: ()=>void;
	} = {} as any;

	/**
	 * Tasks count
	 */
	get size(): number {
		return this[PROPS]._tasks.size;
	}
	
	/**
	 * Task precision - `integer` decimal places
	 */
	get precision(): number {
		return this[PROPS].precision;
	}

	/**
	 * Task event debounce milliseconds (default: `Tasks.event_debounce`)
	 */
	get event_debounce(): number {
		return this[PROPS].event_debounce;
	}

	/**
	 * Create new instance
	 * 
	 * @param precision - decimal places (default: `Tasks.decimal_precision`)
	 * @param event_debounce - event debounce milliseconds (default: `Tasks.event_debounce`)
	 */
	constructor(precision: number = Tasks.decimal_precision, event_debounce: number = Tasks.event_debounce){
		precision = _pos_int(precision, Tasks.decimal_precision, Tasks.decimal_precision);
		event_debounce = _pos_int(event_debounce, Tasks.event_debounce, Tasks.event_debounce);
		this[PROPS] = {
			precision: precision,
			event_debounce: event_debounce,
			_tasks: new Map(),
			_unsubscribe: new Map(),
			_emitter: new EventEmitter(),
			_debounced_update: _debounce(() => {
				const props = this[PROPS];
				props._emitter.emit('update', this.data());
			}, event_debounce),
		};
	}

	/**
	 * Get tasks data
	 * 
	 * @returns `ITasksData` options ~ i.e. `{precision, event_debounce, size, progress, running, started, complete, startTime, endTime, elapsedTime, tasks}`
	 */
	get data(): ()=>ITasksData {
		return (): ITasksData => {
			const props = this[PROPS];
			let size: number = 0;
			let startTime: number = 0;
			let endTime: number = 0;
			let all_progress: number = 0;
			let full_progress: number = 0;
			let has_running: boolean = false;
			let has_started: boolean = false;
			let has_incomplete: boolean = false;

			//tasks data
			const tasks: {[name: string]: ITask} = Object.fromEntries([...props._tasks.values()].map(task => {
				const data = task.data();
				size ++;

				//-- progress
				full_progress += 100;
				all_progress += data.progress;
				
				//-- complete
				if (!has_incomplete && !data.complete) has_incomplete = true;
				
				//-- status = running/started
				if (data.status === 'running'){
					if (!has_running) has_running = true;
					if (!has_started) has_started = true;
				}
				else if (!has_started && ['failed', 'done'].includes(data.status)) has_started = true;

				//-- startTime
				if (data.startTime && (!startTime && data.startTime < startTime)) startTime = data.startTime;
				
				//-- endTime
				if (data.endTime && (!endTime && data.endTime > endTime)) endTime = data.endTime;

				//task entry
				return [task.name, data];
			}));
			
			//calc data
			const progress = (!all_progress || !full_progress) ? 0 : ((all_progress >= full_progress) ? 100 :  _round(all_progress/full_progress * 100, props.precision));
			const running = has_running;
			const started = has_started;
			const complete = started && !has_incomplete;
			let elapsedTime = 0;
			if (endTime && startTime){
				if (endTime < startTime) startTime = endTime;
				elapsedTime = endTime - startTime;
			}

			//data
			return {
				precision: this.precision,
				event_debounce: this.event_debounce,
				size,
				progress,
				running,
				started,
				complete,
				startTime,
				endTime,
				elapsedTime,
				tasks,
			}
		};
	}

	/**
	 * Update event trigger
	 * 
	 * @returns `Task` instance
	 */
	get update(): ()=>Tasks {
		return (): Tasks => {
			this[PROPS]._debounced_update();
			return this;
		};
	}

	/**
	 * Add update event subscriber ~ `event = {type: 'update', data: ITask}`
	 * 
	 * @param listener - event callback listener
	 * @returns `(()=>void)` unsubscribe callback
	 */
	subscribe(listener: (event:IEvent)=>void): ()=>void {
		return this[PROPS]._emitter.subscribe('update', listener);
	}

	/**
	 * Check if task name exists
	 * 
	 * @param name
	 * @returns `boolean`
	 */
	has(name: string): boolean {
		return this[PROPS]._tasks.has(name);
	}

	/**
	 * Get task by name
	 * 
	 * @param name - task name
	 * @returns `Task`
	 */
	get(name: string): Task|undefined {
		return this[PROPS]._tasks.get(name);
	}

	/**
	 * Add new task
	 * 
	 * @param task - `string` task name | `ITask` task data | `Task` instance
	 * @param linked - task value/total/progress linked ~ recalculate on change
	 * @param event_debounce - event debounce milliseconds (default: `Task.event_debounce`)
	 * @returns `Task`
	 */
	add(task: string|ITask|Task, linked: boolean = false, event_debounce?: number): Task {
		const props = this[PROPS];
		event_debounce = (event_debounce = _pos_int(event_debounce, -1, -1)) >= 0 ? event_debounce : undefined;
		
		//task instance
		let _task: Task = undefined as any;
		if ('string' === typeof task) _task = new Task(task, linked, props.precision, event_debounce);
		else if (task instanceof Task) _task = task;
		else if ('object' === typeof task && 'string' === typeof task?.name) _task = Task.create(task, props.precision, event_debounce);
		if (!(_task instanceof Task)) throw new TypeError('Add \`Task\` object is invalid.');

		//task exists - replace
		if (this.has(_task.name)) console.warn(`Existing task named "${_task.name}" has been replaced.`);

		//task listener
		const unsubscribe = _task.subscribe((event: IEvent) => {
			console.debug(`-- task event ${event.data.name}`, event.data.progress); //TODO: remove task event debug
			this.update(); //task update
		});

		//task add
		props._tasks.set(_task.name, _task);
		props._unsubscribe.set(_task.name, unsubscribe);
		this.update(); //update
		
		//result
		return _task;
	}
	
	/**
	 * Remove task by name
	 * 
	 * @param name - task name
	 * @returns `Tasks` instance
	 */
	remove(name: string): Tasks {
		const props = this[PROPS];
		if (!props._tasks.has(name)) return this;
		
		//unsubscribe task listener
		const unsubscribe = props._unsubscribe.get(name);
		if (unsubscribe){
			props._unsubscribe.delete(name);
			unsubscribe();
		}
		
		//remove task - update
		props._tasks.delete(name);
		this.update();
		return this;
	}
}