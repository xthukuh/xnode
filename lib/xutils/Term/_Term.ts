import { _clone, _jsonStringify, _isDate, _timestamp, _str, _string, _stringable } from '../utils';

/**
 * Term format result interface
 */
export interface ITermFormat {
	format: (formats: string|string[], ...args: any[]) => ITermFormat;
	values: (...args: any[]) => any[];
	clear: (...args: any[]) => any[];
	log: (message?: any, ...optionalParams: any[]) => void;
	debug: (message?: any, ...optionalParams: any[]) => void;
	warn: (message?: any, ...optionalParams: any[]) => void;
	error: (message?: any, ...optionalParams: any[]) => void;
	info: (message?: any, ...optionalParams: any[]) => void;
}

/**
 * Term `console.*` logger
 */
export class Term
{
	/**
	 * Disable formats
	 */
	static DISABLED: boolean = false;

	/**
	 * Text formats
	 */
	static FORMATS: {[key: string]: string} = {
		reset: '\x1b[0m',
		bright: '\x1b[1m',
		dim: '\x1b[2m',
		underscore: '\x1b[4m',
		blink: '\x1b[5m',
		reverse: '\x1b[7m',
		hidden: '\x1b[8m',
		fg_black: '\x1b[30m',
		fg_red: '\x1b[31m',
		fg_green: '\x1b[32m',
		fg_yellow: '\x1b[33m',
		fg_blue: '\x1b[34m',
		fg_magenta: '\x1b[35m',
		fg_cyan: '\x1b[36m',
		fg_white: '\x1b[37m',
		fg_gray: '\x1b[90m',
		bg_black: '\x1b[40m',
		bg_red: '\x1b[41m',
		bg_green: '\x1b[42m',
		bg_yellow: '\x1b[43m',
		bg_blue: '\x1b[44m',
		bg_magenta: '\x1b[45m',
		bg_cyan: '\x1b[46m',
		bg_white: '\x1b[47m',
		bg_gray: '\x1b[100m',
	};

	/**
	 * Predefined text formats
	 */
	static PREDEFINED_FORMATS: {[key: string]: string|string[]} = {
		log: 'fg_white',
		debug: 'fg_gray',
		error: 'fg_red',
		warn: 'fg_yellow',
		info: 'fg_cyan',
		success: 'fg_green',
		bg_log: ['bg_blue', 'fg_white'],
		bg_debug: ['bg_gray', 'fg_black'],
		bg_error: ['bg_red', 'fg_white'],
		bg_warn: ['bg_yellow', 'fg_black'],
		bg_info: ['bg_cyan', 'fg_black'],
		bg_success: ['bg_green', 'fg_white'],
	};

	/**
	 * Get standardized text formats
	 * 
	 * @param formats Text format(s)
	 * @returns `string[]`
	 */
	static getFormats(formats: string|string[]): string[] {
		const FM = this.FORMATS;
		const PF = this.PREDEFINED_FORMATS;
		const _formats: string[] = Array.isArray(formats) ? formats : 'string' === typeof formats ? [formats] : [];
		return _formats.reduce<string[]>((prev, val) => {
			if ((val = val.trim().toLowerCase()) && val !== 'reset'){
				let tmp = val = val.replace(/[^a-z0-9]/ig, '_').replace('grey', 'gray');
				const _addPF = (k: string): void => {
					const v = PF[k];
					if (Array.isArray(v)) prev.push(...v);
					else if ('string' === typeof v) prev.push(v);
				};
				if (FM.hasOwnProperty(val)) prev.push(val);
				else if (FM.hasOwnProperty(tmp = `fg_${val}`)) prev.push(tmp);
				else if (PF.hasOwnProperty(val)) _addPF(val);
				else if (PF.hasOwnProperty(tmp = `bg_${val}`)) _addPF(tmp);
			}
			return prev;
		}, []);
	}
	
	/**
	 * Text format log arguments
	 * 
	 * @param formats  Text format(s)
	 * @param args  Format values
	 * @returns `ITermFormat`
	 */
	static format(formats: string|string[], ...args: any): ITermFormat {
		let tmp: string;
		const _formats: string[] = this.getFormats(formats);
		const _format = (val: any): any => {
			if (this.DISABLED || !formats.length) return val;
			if ('object' === typeof val && val){
				if (Array.isArray(val)) return val;
				if (new RegExp('\\[object \\w+\\\]').test(tmp = _string(val))) return val;
				else val = tmp;
			}
			if (!('string' === typeof val && val.length)) return val;
			return _formats.reduce<string>((v, f) => this.FORMATS[f] + v + this.FORMATS.reset, val);
		};
		const that = this, _args: any[] = args;
		return {

			/**
			 * Add formatted values
			 * 
			 * @param formats
			 * @param args
			 */
			format(formats: string|string[], ...args: any[]): ITermFormat {
				_args.push(that.format(formats, ...args).values());
				return this;
			},

			/**
			 * Get formatted values
			 * 
			 * @param args
			 */
			values(...args: any[]): any[] {
				return _args.concat(args).map(val => _format(val));
			},

			/**
			 * Get values without formatting
			 * 
			 * @param args
			 */
			clear(...args: any[]): any[] {
				return that.clear(...this.values(...args));
			},

			/**
			 * `console.log` formatted values
			 * 
			 * @param args 
			 */
			log(...args: any[]): void {
				console.log(...this.values(...args));
			},

			/**
			 * `console.debug` formatted values
			 * 
			 * @param args 
			 */
			debug(...args: any[]): void {
				console.debug(...this.values(...args));
			},

			/**
			 * `console.warn` formatted values
			 * 
			 * @param args 
			 */
			warn(...args: any[]): void {
				console.warn(...this.values(...args));
			},

			/**
			 * `console.error` formatted values
			 * 
			 * @param args 
			 */
			error(...args: any[]): void {
				console.error(...this.values(...args));
			},

			/**
			 * `console.info` formatted values
			 * 
			 * @param args 
			 */
			info(...args: any[]): void {
				console.info(...this.values(...args));
			},
		};
	}

	/**
	 * Clear text value formatting
	 * 
	 * @param args  Formatted values
	 * @returns `any[]` Clear values
	 */
	static clear(...args: any[]): any[] {
		const _clear = (val: string): string => Object.values(this.FORMATS).reduce<string>((p, v)=> p.replace(new RegExp(String(v).replace(/\x1B/, '\\x1B').replace(/\[/, '\\['), 'g'), ''), val);
		return args.map((val: any) => 'string' === typeof val && val.trim().length ? _clear(val) : val);
	}

	/**
	 * Get formatted text
	 * 
	 * @param value  Text value
	 * @param formats  Text format(s)
	 * @returns `string` Formatted
	 */
	static text(value: string, formats?: string|string[]): string {
		const _val: string = _string(value), _formats: string[] = (Array.isArray(formats) ? formats : 'string' === typeof formats ? [formats] : []).filter(v => 'string' === typeof v && !!v.trim());
		if (!(_formats.length && _val.trim().length)) return _val;
		return this.format(_formats, _val).values()[0];
	}

	/**
	 * Log `console.log` format
	 * 
	 * @param args
	 */
	static log(...args: any[]): void {
		this.format('log', ...args).log();
	}

	/**
	 * Debug `console.debug` format
	 * 
	 * @param args
	 */
	static debug(...args: any[]): void {
		this.format('debug', ...args).debug();
	}

	/**
	 * Error `console.error` format
	 * 
	 * @param args
	 */
	static error(...args: any[]): void {
		this.format('error', ...args).error();
	}

	/**
	 * Warn `console.warn` format
	 * 
	 * @param args
	 */
	static warn(...args: any): void {
		this.format('warn', ...args).warn();
	}

	/**
	 * Info `console.info` format
	 * 
	 * @param args
	 */
	static info(...args: any): void {
		this.format('info', ...args).info();
	}

	/**
	 * Success `console.log` format
	 * 
	 * @param args
	 */
	static success(...args: any): void {
		this.format('success', ...args).log();
	}

	/**
	 * Get value list
	 * 
	 * @param value
	 * @param _entries
	 */
	static list(value: any, _entries: boolean = false): [list: any[], type:'values'|'entries'] {
		let items: any[] = [value = _clone(value)], type: 'values'|'entries' = 'values';
		if ('object' === typeof value && value){
			if (!(type = value[Symbol.iterator]?.name)){
				type = 'values';
				items = [value];
				if (_entries && _stringable(value) === false){
					let tmp: any = Object.fromEntries(Object.entries(value));
					let tmp_entries: [k: any, v: any][] = [];
					if (!('object' === typeof tmp && tmp && (tmp_entries = Object.entries(tmp)).length)) tmp_entries = Object.entries(value);
					if (tmp_entries.length){
						type = 'entries';
						items = tmp_entries;
					}
				}
			}
			else if (type === 'entries') items = _entries ? [...value] : [value];
			else items = [...value];
		}
		return [items, type];
	}

	/**
	 * Custom `console.table` logger
	 * 
	 * @param data
	 * @param cellMaxLength
	 */
	static table(data: any, cellMaxLength: number = 248, divider: boolean = false): void {
		
		//vars
		const that = this;
		const [data_items, data_type] = that.list(data, 'object' === typeof data && data && !_stringable(data));

		//fn => str value
		const strVal = (val: any): [_value: string, _format: string] => {
			let color: string, tmp: any;
			if (!Array.isArray(val) && (tmp = _stringable(val)) !== false){
				color = 'green';
				if ('number' === typeof val) color = 'yellow';
				else if (val === undefined || val === null) color = 'gray';
				else if (val === true) color = 'cyan';
				else if (val === false) color = 'red';
				else if (/^\d{4}-(?:0[1-9]|1[0-2])-(?:[0-2][1-9]|[1-3]0|3[01])T(?:[0-1][0-9]|2[0-3])(?::[0-6]\d)(?::[0-6]\d)?(?:\.\d{3})?(?:[+-][0-2]\d:[0-5]\d|Z)?$/.test(tmp)) color = 'magenta'; //match ISO timestamp (i.e. 2023-06-09T18:18:57.070Z)
				val = tmp;
			}
			else {
				if ('object' === typeof val && val){
					const _type = val[Symbol.iterator];
					if (!!_type){
						val = [...val];
						if (_type === 'entries') val = Object.fromEntries(val);
					}
					else val = Object.fromEntries(Object.entries(val));
				}
				val = _jsonStringify(val);
				color = 'magenta';
			}
			val = val.replace(/\t/g, '  ');
			return [val, color];
		};

		//value log - cannot be tabled
		// if (data_type === 'values' && data_items.length < 2){
		// 	const [_value, _format] = strVal(data);
		// 	console.log(that.text(_value, _format));
		// 	return;
		// }

		//table items
		let mode: 'values'|'entries';
		const table_items: any[][] = [];
		if (data_type === 'entries'){
			table_items.push(['(index)', 'Values']);
			table_items.push(...data_items);
		}
		else {
			let map_keys: string[] = [], map_items: {[key: string]: any}[] = [];
			data_items.forEach((data_item, r) => {
				let [list_items, list_type] = that.list(data_item, !r || mode === 'entries');
				if (!r) mode = list_type;
				const map_item: {[key: string]: any} = {};
				list_items.forEach((item, i) => {
					let k: string, v: any;
					if (list_type === 'entries'){
						k = _str(item[0], true, true);
						v = item[1];
					}
					else {
						k = `${i}`;
						v = item;
					}
					if (!map_keys.includes(k)) map_keys.push(k);
					map_item[k] = v;
				});
				map_items.push(map_item);
			});
			table_items.push(['(index)', ...map_keys]);
			map_items.forEach((map_item, r) => {
				const table_item: any[] = [];
				for (const key of map_keys) table_item.push(map_item[key]);
				table_items.push([r, ...table_item]);
			});
		}

		//width
		const width_map: {[key: number]: number} = {};
		const str_items: [_value: string, _format: string][][] = [];
		table_items.forEach(table_item => {
			const str_item: [_value: string, _format: string][] = [];
			table_item.forEach((val, i) => {
				const [_value, _format] = strVal(val);
				if (!width_map.hasOwnProperty(i)) width_map[i] = 0;
				let len = _value.length;
				if (len > cellMaxLength) len = cellMaxLength; //cellMaxLength limit
				if (len > width_map[i]) width_map[i] = len;
				str_item.push([_value, _format]);
			});
			str_items.push(str_item);
		});

		//rows
		const rows_len: number = str_items.length;
		str_items.forEach((str_item, r) => {
			let max_lines: number = 0, str_item_lines: string[][] = [];
			str_item.forEach((val, i) => {
				let [_value, _format] = val;
				if (!i || !r) _format = (!i && r && mode === 'values') ? 'gray' : 'white';
				const width: number = width_map[i];
				const lines: string[] = [];
				if (_value.length > width){
					while (_value.length > width) {
						const line = _value.substring(0, width).padEnd(width);
						_value = _value.slice(width);
						lines.push(that.text(line, _format)); //format
					}
					if (_value.length) lines.push(that.text(_value.padEnd(width), _format)); //format
				}
				else lines.push(that.text(_value.padEnd(width), _format)); //format
				str_item_lines.push(lines);
				if (max_lines < lines.length) max_lines = lines.length;
			});
			str_item_lines = str_item_lines.map((lines, c) => {
				const width: number = width_map[c];
				return [...Array(max_lines)].map((_, i) => {
					const line = i < lines.length ? lines[i] : ''.padEnd(width);
					return line;
				});
			});
			const line_rows:string[][] = [...Array(max_lines)].map(() => []);
			str_item_lines.forEach((lines, c) => {
				lines.forEach((line, i) => line_rows[i][c] = line);
			});
			const rows: string[] = [];
			const len = line_rows.length;
			line_rows.forEach((line_row, n) => {
				if (!n && !r) rows.push('┌─' + line_row.map((_, i) => ''.padEnd(width_map[i], '─')).join('─┬─') + '─┐'); //border top
				rows.push('│ ' + line_row.join(' │ ') + ' │');
				if ((!r || divider) && n + 1 === len && r + 1 < rows_len) rows.push('├─' + line_row.map((_, i) => ''.padEnd(width_map[i], '─')).join('─┼─') + '─┤'); //border mid
				if (n + 1 === len && r + 1 === rows_len) rows.push('└─' + line_row.map((_, i) => ''.padEnd(width_map[i], '─')).join('─┴─') + '─┘'); //border bottom
			});
			rows.forEach(row => console.log(row));
		});
	}
}