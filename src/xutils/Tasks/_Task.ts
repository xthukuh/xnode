import { EventEmitter, IEvent } from '../EventEmitter';

/**
 * Task status type
 */
export type TStatus = 'new' | 'running' | 'stopped' | 'failed' | 'done';

/**
 * Task statuses list
 */
export const TASK_STATUSES: TStatus[] = ['new', 'running', 'stopped', 'failed', 'done'];

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
 * Helper - custom `JSON.stringify` which ignores self references ~ returns `'null'` for `undefined` value
 * 
 * @param value
 * @returns `string` json
 */
const _json_str = (value: any): string => {
	if (value === undefined) value = null;
	const seen: any[] = [];
	return JSON.stringify(value, function(_, val){
		if (val && 'object' === typeof val){
			if (seen.indexOf(val) > -1) return;
			seen.push(val);
		}
		return val;
	});
};

/**
 * Helper - parse normalized string value
 * 
 * @param val
 * @returns `string` normalized and trimmed
 */
const _get_str = (val: any): string => {
	if ([undefined, null].includes(val)) return '';
	let value: string = '';
	try {
		if (Object(val) === val && val[Symbol.iterator]) val = _json_str([...val]);
		value = String(val);
	}
	catch (e){
		value = '';
	}
	if (Object(val) === val && (!value || /\[object \w+\]/.test(value))) value = _json_str(val).replace(/^"|"$/g, '');
	return value.trim();
};

/**
 * Helper - parse normalized error value
 * 
 * @param val
 * @returns `string` error
 */
const _get_error = (val: any): string => {
	if (Object(val) === val && !(val instanceof Error)){
		if (val.error instanceof Error || 'string' === typeof val.error && !!val.error.trim()) val = val.error;
		else if (val.reason instanceof Error || 'string' === typeof val.reason && !!val.reason.trim()) val = val.error;
		else if ('string' === typeof val.message && !!val.message.trim()) val = val.message;
	}
	return _get_str(val);
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
 * @class Task
 */
export class Task implements ITask
{
	/**
	 * Task global event debounce milliseconds
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
		_debounced_update: ()=>void;
	} = {} as any;

	/**
	 * Task name
	 */
	get name(): string {
		return this[PROPS].name;
	}

	/**
	 * Task label
	 */
	get label(): string {
		return this[PROPS].label;
	}

	/**
	 * Task linked - value/total/progress (recalculate on change)
	 */
	get linked(): boolean {
		return this[PROPS].linked;
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
	 * Task progress
	 */
	get progress(): number {
		return this[PROPS].progress;
	}

	/**
	 * Task total
	 */
	get total(): number {
		return this[PROPS].total;
	}

	/**
	 * Task value
	 */
	get value(): number {
		return this[PROPS].value;
	}

	/**
	 * Task error
	 */
	get error(): string {
		return this[PROPS].error;
	}

	/**
	 * Task status
	 */
	get status(): TStatus {
		return this[PROPS].status;
	}

	/**
	 * Task startTime - timestamp milliseconds (i.e. `Date.now()`)
	 */
	get startTime(): number {
		return this[PROPS].startTime;
	}

	/**
	 * Task stopTime - timestamp milliseconds (i.e. `Date.now()`)
	 */
	get stopTime(): number {
		return this[PROPS].stopTime;
	}

	/**
	 * Task elapsedTime - millisecond timestamps difference (i.e. `stopTime - startTime`)
	 */
	get elapsedTime(): number {
		return this.stopTime ? this.stopTime - this.startTime : 0;
	}

	/**
	 * Task complete
	 */
	get complete(): boolean {
		return this[PROPS].complete;
	}
	
	/**
	 * Task item
	 */
	get item(): any {
		return this[PROPS].item;
	}

	/**
	 * Create new instance
	 * 
	 * @param name - task name
	 * @param linked - task value/total/progress linked ~ recalculate on change
	 * @param precision - decimal places (default: `Task.decimal_precision`)
	 * @param event_debounce - event debounce milliseconds (default: `Task.event_debounce`)
	 */
	constructor(name: string, linked: boolean = false, precision: number = Task.decimal_precision, event_debounce: number = Task.event_debounce){
		if (!(name = _get_str(name))) throw new TypeError('Invalid new task name.');
		precision = _pos_int(precision, Task.decimal_precision, Task.decimal_precision);
		event_debounce = _pos_int(event_debounce, Task.event_debounce, Task.event_debounce);
		this[PROPS] = {
			name,
			label: '',
			linked,
			precision,
			event_debounce,
			progress: 0,
			total: 0,
			value: 0,
			error: '',
			status: 'new',
			startTime: 0,
			stopTime: 0,
			complete: false,
			item: undefined,
			_done: false,
			_round: (val: number): number => _round(val, this[PROPS].precision),
			_emitter: new EventEmitter(),
			_debounced_update: _debounce(() => {
				const props = this[PROPS];
				if (props._done) return;
				props._emitter.emit('update', this.data());
			}, event_debounce),
		};
	}

	/**
	 * Get task data
	 * 
	 * @returns `ITask` options ~ i.e. `{name, label, linked, precision, event_debounce, progress, total, value, error, status, startTime, stopTime, complete, item}`
	 */
	get data(): ()=>ITask {
		return (): ITask => {
			const { name, label, linked, precision, event_debounce, progress, total, value, error, status, startTime, stopTime, elapsedTime, complete, item } = this;
			return {name, label, linked, precision, event_debounce, progress, total, value, error, status, startTime, stopTime, elapsedTime, complete, item};
		};
	}

	/**
	 * Update event trigger
	 * 
	 * @returns `Task` instance
	 */
	get update(): ()=>Task {
		return (): Task => {
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
	 * Task start
	 * 
	 * @returns `Task` instance
	 */
	start(restart: boolean = false): Task {
		const props = this[PROPS];
		let changes = 0;

		//restart check
		if (props.complete && !restart){
			console.warn('Task \`start\` while complete ignored! Try using `task.start(restart=true)` to override.');
			return this;
		}
		
		//-- complete = false
		if (props.complete){
			changes ++;
			props.complete = false;
		}
		
		//-- status = running
		if (props.status !== 'running'){
			changes ++;
			props.status = 'running';
		}

		//-- startTime
		if (!props.startTime || restart){
			changes ++;
			props.startTime = Date.now();
		}

		//-- stopTime
		if (props.stopTime){
			changes ++;
			props.stopTime = 0;
		}
		
		//-- error
		if (props.error){
			changes ++;
			props.error = '';
		}

		//changes - update
		if (changes) this.update();
		return this;
	}

	/**
	 * Task stop
	 * 
	 * @returns `Task` instance
	 */
	stop(): Task {
		const props = this[PROPS];
		let changes = 0;

		//-- status = stopped
		if (props.status === 'running'){
			changes ++;
			props.status = 'stopped';
		}

		//-- stopTime, startTime
		if (!props.stopTime){
			changes ++;
			props.stopTime = Date.now();
			if (!props.startTime) props.startTime = props.stopTime;
		}

		//changes - update
		if (changes) this.update();
		return this;
	}

	/**
	 * Task failed
	 * 
	 * @returns `Task` instance
	 */
	failure(error?: any): Task {
		error = (error = _get_error(error)) ? error : 'Unknown task error.';
		const props = this[PROPS];
		let changes = 0;
		
		//-- error
		if (props.error !== error){
			changes ++;
			props.error = error;
		}

		//-- status
		if (props.status !== 'failed'){
			changes ++;
			props.status = 'failed';
		}

		//-- stopTime, startTime
		if (!props.stopTime){
			changes ++;
			props.stopTime = Date.now();
			if (!props.startTime) props.startTime = props.stopTime;
		}

		//changes - update
		if (changes) this.update();
		return this;
	}

	/**
	 * Task done
	 * 
	 * @param completeProgress - set full progress ~ enabled when `linked` (i.e. `progress=100` and `value=total`)
	 * @returns `Task` instance
	 */
	done(completeProgress: boolean = false): Task {
		const props = this[PROPS];
		let changes = 0;

		//-- complete = true
		if (!props.complete){
			changes ++;
			props.complete = true;
		}

		//not stopped
		if (props.status !== 'stopped'){
			
			//-- status = done|failed
			const status = props.error ? 'failed' : 'done';
			if (props.status !== status){
				changes ++;
				props.status = status;
			}
	
			//-- completeProgress
			if (props.linked || completeProgress){
				let progress = 100;
				if (progress !== props.progress){
					changes ++;
					props.progress = progress;
				}
				if (props.total && props.value !== props.total){
					changes ++;
					props.value = props.total;
				}
			}
		}

		//-- startTime, stopTime = now
		if (!props.stopTime){
			changes ++;
			props.stopTime = Date.now();
			if (!props.startTime) props.startTime = props.stopTime;
		}

		//done - emit changes
		props._done = true;
		if (changes) props._emitter.emit('update', this.data());
		return this;
	}

	/**
	 * Set progress
	 * 
	 * @param progress - task percentage progress (`0-100`)
	 * @param _value - unlinked task `value` update ~ ignores `undefined`
	 * @param _total - unlinked task `total` update ~ ignores `undefined`
	 * @returns `Task` instance
	 */
	setProgress(progress: number, _value?: number, _total?: number): Task {
		const props = this[PROPS];

		//done - ignore updates
		if (props._done){
			console.warn('Task \`setProgress\` while done ignored.');
			return this;
		}

		//parse progress/adjust
		let tmp: number = _pos_num(progress, -1, -1);
		if (tmp < 0) throw new TypeError(`Invalid set task \`progress\` value (${progress}).`);
		if ((progress = props._round(tmp)) > 100) progress = 100;

		//total/value - unlinked update/linked recalculate
		let value = props.value;
		let total = props.total;
		if (!props.linked){
			if ((_total = _pos_num(_total, -1, -1)) >= 0) total = props._round(_total);
			if ((_value = _pos_num(_value, -1, -1)) >= 0) value = props._round(_value);
		}
		else if (total){
			if (progress === 100) value = total;
			else value = props._round(progress/100 * total);
		}
		
		//changes - update
		let changes = 0;
		if (progress !== props.progress){
			changes ++;
			props.progress = progress;
		}
		if (value !== props.value){
			changes ++;
			props.value = value;
		}
		if (total !== props.total){
			changes ++;
			props.total = total;
		}
		if (changes) this.update();
		return this;
	}
	
	/**
	 * Set total
	 * 
	 * @param total
	 * @returns `Task` instance
	 */
	setTotal(total: number): Task {
		const props = this[PROPS];

		//done - ignore updates
		if (props._done){
			console.warn('Task \`setTotal\` while done ignored.');
			return this;
		}

		//parse total/adjust
		let tmp: number = _pos_num(total, -1, -1);
		if (tmp < 0) throw new TypeError(`Invalid set task \`total\` value (${total}).`);
		total = props._round(tmp);

		//linked - recalculate value/progress
		let progress = props.progress;
		let value = props.value;
		if (props.linked){
			if (!total){
				value = 0;
				progress = 0;
			}
			else if (value){
				if (value >= total){
					value = total;
					progress = 100;
				}
				else progress = props._round(value/total * 100);
			}
			else if (progress) value = props._round(progress/100 * total);
		}

		//changes - update
		let changes = 0;
		if (progress !== props.progress){
			changes ++;
			props.progress = progress;
		}
		if (value !== props.value){
			changes ++;
			props.value = value;
		}
		if (total !== props.total){
			changes ++;
			props.total = total;
		}
		if (changes) this.update();
		return this;
	}

	/**
	 * Set value
	 * 
	 * @param value
	 * @returns `Task` instance
	 */
	setValue(value: number): Task {
		const props = this[PROPS];
		
		//done - ignore updates
		if (props._done){
			console.warn('Task \`setValue\` while done ignored.');
			return this;
		}

		//parse value/adjust
		let tmp: number = _pos_num(value, -1, -1);
		if (tmp < 0) throw new TypeError(`Invalid set task \`value\` value (${value}).`);
		value = props._round(tmp);

		//linked - recalculate progress
		let total = props.total;
		let progress = props.progress;
		if (props.linked){
			if (!value) progress = 0;
			else if (total){
				if (value > total){
					total = value;
					progress = 100;
				}
				else progress = props._round(value/total * 100);
			}
			else if (progress) total = props._round(100/progress * value);
		}

		//changes - update
		let changes = 0;
		if (progress !== props.progress){
			changes ++;
			props.progress = progress;
		}
		if (value !== props.value){
			changes ++;
			props.value = value;
		}
		if (total !== props.total){
			changes ++;
			props.total = total;
		}
		if (changes) this.update();
		return this;
	}

	/**
	 * Set item
	 * 
	 * @param item
	 * @returns `Task` instance
	 */
	setItem(item: any): Task {
		const props = this[PROPS];
		
		//done - ignore updates
		if (props._done){
			console.warn('Task \`setItem\` while done ignored.');
			return this;
		}
		
		//set item
		props.item = item;
		return this;
	}

	/**
	 * Create instance from existing task options
	 * 
	 * @param options - `ITask` options ~ i.e. `{name, label, linked, precision, event_debounce, progress, total, value, error, status, startTime, stopTime, complete, item}`
	 * @param precision - decimal places (default: `Task.decimal_precision`)
	 * @param event_debounce - event debounce milliseconds (default: `Task.event_debounce`)
	 * @returns `Task` instance
	 * @throws validation `Error`
	 */
	static create(options: ITask, precision?: number, event_debounce?: number): Task {
		let {
			name,
			label,
			linked,
			precision: _precision,
			event_debounce: _event_debounce,
			progress,
			total,
			value,
			error,
			status,
			startTime,
			stopTime,
			complete,
			item,
		} = Object(options);
		try {
			
			//parse options
			let tmp: any;
			if (!(tmp = _get_str(name))) throw new TypeError('Invalid task `name` value.');
			name = tmp;
			label = _get_str(label);
			linked = !!linked;
			
			//-- precision
			tmp = _pos_int(_precision, -1, Task.decimal_precision);
			if ((tmp = _pos_int(precision, -1, tmp)) < 0) precision = Task.decimal_precision;
			else precision = tmp;

			//-- event_debounce
			tmp = _pos_int(_event_debounce, -1, Task.event_debounce);
			if ((tmp = _pos_int(event_debounce, -1, tmp)) < 0) event_debounce = Task.event_debounce;
			else event_debounce = tmp;

			//-- precision round
			const _round_p = (val: number): number => _round(val, precision);

			//-- parse/adjust: progress, total, value
			if ((tmp = _pos_num(progress, -1)) < 0) throw new TypeError('Invalid task `progress` value.');
			if ((progress = _round_p(tmp)) > 100) progress = 100;
			if ((tmp = _pos_num(total, -1)) < 0) throw new TypeError('Invalid task `total` value.');
			total = _round_p(tmp);
			if ((tmp = _pos_num(value, -1)) < 0) throw new TypeError('Invalid task `value` value.');
			value = _round_p(tmp);
			if (linked){
				if (!value) progress = 0;
				else if (total){
					if (value > total){
						console.warn(`Task linked \`value\` (${value}) is greater than \`total\` (${total}). Using value as new total${progress !== 100 ? ' - updating progress' : ''}.`);
						total = value;
						progress = 100;
					}
					else {
						const prog = _round_p(value/total * 100);
						if (progress !== prog){
							if (progress) console.warn(`Task linked \`progress\` (${progress}) recalculated to (${prog}) using current value/total (${value}/${total}) %.`);
							progress = prog;
						}
					}
				}
				else if (progress) total = _round_p(100/progress * value);
			}

			//-- parse/adjust: error, status, startTime, stopTime, complete
			complete = !!complete;
			error = _get_error(error);
			if (!(status = _get_str(status).toLowerCase())) status = 'new';
			else if (!TASK_STATUSES.includes(status)) status = 'new';
			if ((tmp = _pos_int(startTime, -1)) < 0) throw new TypeError('Invalid task \`startTime\` value.');
			startTime = tmp;
			if ((tmp = _pos_int(stopTime, -1)) < 0) throw new TypeError('Invalid task `stopTime` value.');
			stopTime = tmp;
			if (!(['stopped', 'failed', 'done'].includes(status) && startTime && stopTime && startTime < stopTime)){
				status = 'new';
				startTime = 0;
				stopTime = 0;
				error = '';
				complete = false;
			}
			else if (error && status !== 'failed') status = 'failed';
			else if (status === 'done' && !complete) complete = true;
			if (!TASK_STATUSES.includes(status)) throw new TypeError('Invalid task \`status\` value.');

			//create task
			const t = new Task(name, linked, precision, event_debounce);
			const props = t[PROPS];
			props.name = name;
			props.label = label;
			props.linked = linked;
			props.precision = precision as number;
			props.event_debounce = event_debounce as number;
			props.progress = progress;
			props.total = total;
			props.value = value;
			props.error = error;
			props.status = status;
			props.startTime = startTime;
			props.stopTime = stopTime;
			props.complete = complete;
			props.item = item; //-- item
			props._debounced_update = _debounce(() => {
				if (props._done) return;
				props._emitter.emit('update', t.data());
			}, t.event_debounce);
			return t;
		}
		catch (e: any){
			const error = `Create Task Failure! ${e instanceof Error ? e.message : e}`.trim();
			const _options = {name, label, linked, precision, event_debounce, progress, total, value, error, status, startTime, stopTime, complete, item};
			console.warn(error, {_options});
			if (e.name === 'TypeError') throw new TypeError(error);
			else throw new Error(error);
		}
	}
}