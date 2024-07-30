import { _exists, _pathinfo, _realpath } from './xfs';
import { Term, _arrayList, _bool, _commas, _filepath, _posInt, _round, _str } from 'xtutils';

//Print console log
export const _print = (text: string, _error: boolean = false) => {
	text = _str(text).replace(/\n$/, '') + '\n';
	if (_error){
		if ('function' === typeof process?.stderr?.write) process.stderr.write(text);
		else console.error(text);
	}
	else if ('function' === typeof process?.stdout?.write) process.stdout.write(text);
	else console.error(text);
};

//Check if running on windows
export const _isWin = (): boolean => process?.platform === 'win32';

//Get directory full path
export const _dirPath = (dir: string, silent: boolean = false, type: string = 'directory'): string => {
	type = (type = _str(type, true)) ? (type.toLowerCase().indexOf('dir') > -1 ? type : type + ' directory') : 'directory';
	let path: string = _str(dir, true);
	if (!path){
		if (!silent) _print(`The ${type} path is empty.`, true);
		return '';
	}
	if (!(path = _realpath(dir = path))){
		if (!silent) _print(`The ${type} path (${dir}) does not exist.`, true);
		return '';
	}
	if ((_pathinfo(path)?.type ?? 0) !== 2){
		if (!silent) _print(`The ${type} path (${path}) is not a folder.`, true);
		return '';
	}
	return path;
};

//normalize path separator
export const _normSep = (v: string): string => _str(v, true).replace(/[\\/]/g, '/').replace(/\/$/, '');


/**
 * ProgTerm props key
 */
const PROG_TERM_PROPS = Symbol('PROG_TERM_PROPS');

/**
 * @class `ProgTerm` ~ process logger with progress
 */
export class ProgTerm
{
	/**
	 * Progress line
	 */
	static PROGRESS_LINE: string = '============================================================';

	/**
	 * Instance props
	 */
	[PROG_TERM_PROPS]: {
		percent: number;
		label: string;
		format: string|string[];
		mode: -1|0|1; //print progress mode ~ `-1` - disabled, `0` - (default) auto, `1` - enabled
		_clear: number;
	} = {
		percent: 0,
		label: '',
		format: 'dump',
		mode: 0,
		_clear: 0,
	} as any;

	/**
	 * Get/set progress percent ~ `0-100`
	 */
	get percent(): number {
		return this[PROG_TERM_PROPS].percent;
	}
	set percent(value: any){
		this[PROG_TERM_PROPS].percent = _round(_posInt(value, 0, 100, true) ?? 0, 2);
	}

	/**
	 * Get/set progress label
	 */
	get label(): string {
		return this[PROG_TERM_PROPS].label;
	}
	set label(value: any){
		this[PROG_TERM_PROPS].label = _str(value, true);
	}
	
	/**
	 * Get/set progress format
	 */
	get format(): string|string[] {
		return this[PROG_TERM_PROPS].format;
	}
	set format(value: any){
		const items: string[] = [];
		for (let val of (Array.isArray(value) ? value : [value])){
			if (!!(val = _str(val, true))) items.push(val);
		}
		const format: string|string[] = items.length === 1 ? items[0] : items;
		this[PROG_TERM_PROPS].format = format.length ? format : 'dump';
	}

	/**
	 * Get/set print progress mode ~ `-1` - disabled, `0` - (default) auto, `1` - enabled
	 */
	get mode(): -1|0|1 {
		return this[PROG_TERM_PROPS].mode;
	}
	set mode(value: any){
		const mode: any = [-1, 0, 1].includes(value = parseInt(value as any)) ? value : 0;
		this[PROG_TERM_PROPS].mode = mode;
	}

	/**
	 * New instance
	 * 
	 * @param percent - progress percent (default: `0`)
	 * @param label - progress label (default: `''`)
	 * @param format - progress format (default: `'dump'`)
	 */
	constructor(percent: number = 0, label: string = '', format: string|string[] = 'dump'){
		this.percent = percent;
		this.label = label;
		this.format = format;
		this.mode = 0;
	}

	/**
	 * Handle print
	 * 
	 * @param method - `Term` method
	 * @param args - method args
	 */
	print(method?: 'log'|'debug'|'error'|'warn'|'info'|'success'|'clear'|'table', args: any[] = []): void {
		
		//fn => helper > clear lines
		const _clear_lines = (count: number): void => {
			if (!count) return;
			for (let i = 0; i < count; i ++){
				const y: any = i === 0 ? null : -1;
				// if (!i) process.stdout.clearLine(0);
				process.stdout.moveCursor(0, y);
				// process.stdout.clearLine(1);
				process.stdout.clearLine(0);
			}
			process.stdout.cursorTo(0);
			this[PROG_TERM_PROPS]._clear = 0;
		};

		//-- clear lines
		_clear_lines(this[PROG_TERM_PROPS]._clear);

		//-- call method
		const methods = ['log', 'debug', 'error', 'warn', 'info', 'success', 'clear', 'table'];
		if (method && methods.includes(method)){
			const _func: (...args: any[])=>void = Term[method];
			_func.apply(Term, _arrayList(args));
		}

		//-- print progress
		const pending: boolean = this.percent > 0 && this.percent < 100;
		const print_enabled: boolean = this.mode === -1 ? false : (this.mode === 0 ? pending : true);
		if (print_enabled){
			const prog_line: string = ProgTerm.PROGRESS_LINE, len = prog_line.length;
			const prog_pos = Math.floor(this.percent/100 * len);
			const prog_text = '[' + prog_line.substring(0, prog_pos).padEnd(len) + '] ' + this.percent + '%';
			let print_text: string = pending ? '\n' : '';
			if (this.label) print_text += this.label + '\n';
			print_text += prog_text;
			print_text = Term.format(this.format, print_text).values().join('');
			const print_lines: number = print_text.split('\n').length;
			process.stdout.write(print_text);
			this[PROG_TERM_PROPS]._clear = print_lines;
		}
	}

	/**
	 * Set progress values
	 * 
	 * @param percent - progress percent
	 * @param label - progress label
	 * @param format - progress format
	 * @returns `ProgTerm` - this instance
	 */
	set(percent?: number, label?: string, format?: string|string[]): ProgTerm {
		if (percent !== undefined) this.percent = percent;
		if (label !== undefined) this.label = label;
		if (format !== undefined) this.format = format;
		return this;
	}

	/**
	 * Print log
	 * 
	 * @param args - log args
	 */
	log(...args: any[]): void {
		return this.print('log', args);
	}
	
	/**
	 * Print debug
	 * 
	 * @param args - print args
	 */
	debug(...args: any[]): void {
		return this.print('debug', args);
	}
	
	/**
	 * Print error
	 * 
	 * @param args - print args
	 */
	error(...args: any[]): void {
		return this.print('error', args);
	}
	
	/**
	 * Print warn
	 * 
	 * @param args - print args
	 */
	warn(...args: any[]): void {
		return this.print('warn', args);
	}
	
	/**
	 * Print info
	 * 
	 * @param args - print args
	 */
	info(...args: any[]): void {
		return this.print('info', args);
	}
	
	/**
	 * Print success
	 * 
	 * @param args - print args
	 */
	success(...args: any[]): void {
		return this.print('success', args);
	}
	
	/**
	 * Print clear
	 * 
	 * @param args - print args
	 */
	clear(): void {
		return this.print('clear');
	}
	
	/**
	 * Print table
	 * 
	 * @param args - print args
	 */
	table(data: any, cellMaxLength?: number, divider?: boolean): void {
		const args: any[] = [data];
		if ((cellMaxLength = _posInt(cellMaxLength, 0) ?? 0) > 0) args.push(cellMaxLength);
		if (!!(divider = _bool(divider, true))) args.push(divider);
		return this.print('table', args);
	}
}