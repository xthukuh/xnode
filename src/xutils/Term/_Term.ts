import { _clone, _jsonStringify, _isDate, _str, _string, _stringable, _strEscape, _bool, _posInt } from '../utils';

/**
 * Term format result interface
 */
export interface ITermFormat {
	method: (value: undefined|'log'|'debug'|'warn'|'error'|'info') => ITermFormat;
	format: (formats: string|string[], ...args: any[]) => ITermFormat;
	values: (...args: any[]) => any[];
	clean: (...args: any[]) => any[];
	log: (message?: any, ...optionalParams: any[]) => void;
	debug: (message?: any, ...optionalParams: any[]) => void;
	warn: (message?: any, ...optionalParams: any[]) => void;
	error: (message?: any, ...optionalParams: any[]) => void;
	info: (message?: any, ...optionalParams: any[]) => void;
}

/**
 * Term log method ~ static read/write cache
 */
let TERM_FORMAT_DISABLED: boolean = false;

/**
 * Term log method ~ static read/write cache
 */
let TERM_LOG_METHOD: undefined|'log'|'debug'|'warn'|'error'|'info' = undefined

/**
 * Term `console.*` logger
 */
export class Term
{
	/**
	 * Format disabled
	 */
	static get FORMAT_DISABLED(): boolean {
		return TERM_FORMAT_DISABLED;
	}
	static set FORMAT_DISABLED(value: any){
		TERM_FORMAT_DISABLED = _bool(value, true) ?? false;
	}

	/**
	 * Console log methods
	 */
	static get LOG_METHODS(): string[] {
		return ['log', 'debug', 'warn', 'error', 'info'];
	}

	/**
	 * Preferred console log method
	 */
	static get LOG_METHOD(): undefined|'log'|'debug'|'warn'|'error'|'info' {
		return TERM_LOG_METHOD;
	}
	static set LOG_METHOD(value: any){
		TERM_LOG_METHOD = this.LOG_METHODS.includes(value) ? value : undefined;
	}

	/**
	 * Text formats
	 */
	static get FORMATS(): {[key: string]: string} {
		return {
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
	}

	/**
	 * Predefined text formats
	 */
	static get PREDEFINED_FORMATS(): {[key: string]: string|string[]} {
		return {
			log: 'fg_white',
			dump: ['fg_white', 'bright'],
			debug: 'fg_gray',
			error: 'fg_red',
			warn: 'fg_yellow',
			info: ['fg_cyan', 'bright'],
			success: 'fg_green',
			bg_log: ['bg_blue', 'fg_white'],
			bg_debug: ['bg_gray', 'fg_black'],
			bg_error: ['bg_red', 'fg_white'],
			bg_warn: ['bg_yellow', 'fg_black'],
			bg_info: ['bg_cyan', 'fg_black'],
			bg_success: ['bg_green', 'fg_white'],
		};
	}

	/**
	 * Parse standard text formats
	 * 
	 * @param formats - text formats
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
	 * Format text items
	 * 
	 * @param formats - text formats
	 * @param args - parse items (arguments)
	 * @returns `ITermFormat`
	 */
	static format(formats: string|string[], ...args: any[]): ITermFormat {
		
		//-- fn => format helpers
		let tmp: string;
		const _formats: string[] = this.getFormats(formats);
		const _format = (val: any): any => {
			if (this.FORMAT_DISABLED || !formats.length) return val;
			if ('object' === typeof val && val){
				if (Array.isArray(val)) return val;
				if (new RegExp('\\[object \\w+\\\]').test(tmp = _string(val))) return val;
				else val = tmp;
			}
			if (!('string' === typeof val && val.length)) return val;
			return _formats.reduce<string>((v, f) => this.FORMATS[f] + v + this.FORMATS.reset, val);
		};
		const that = this, values: any[] = [];
		for (const val of (Array.isArray(args) ? args : [])) values.push(_format(val));
		let log_method: any = that.LOG_METHOD;
		const _method = (name: any): 'log'|'debug'|'warn'|'error'|'info' => {
			if (log_method) return log_method;
			return that.LOG_METHODS.includes(name) ? name : 'log';
		};
		
		//<< result -  ITermFormat
		return {

			/**
			 * Set preferred log method
			 */
			method(value: undefined|'log'|'debug'|'warn'|'error'|'info'): ITermFormat {
				log_method = that.LOG_METHODS.includes(value as any) ? value : that.LOG_METHOD;
				return this;
			},

			/**
			 * Add formatted values
			 * 
			 * @param formats
			 * @param args
			 */
			format(formats: string|string[], ...args: any[]): ITermFormat {
				values.push(...that.format(formats, ...args).values());
				return this;
			},

			/**
			 * Get formatted values
			 * 
			 * @param args
			 */
			values(...args: any[]): any[] {
				const items: any[] = [];
				if (Array.isArray(args) && args.length){
					for (const val of args) items.push(_format(val));
				}
				return [...values, ...items];
			},

			/**
			 * Get values without formatting
			 * 
			 * @param args
			 */
			clean(...args: any[]): any[] {
				return that.clean(...[...values, ...args]);
			},

			/**
			 * `console.log` formatted values
			 * 
			 * @param args 
			 */
			log(...args: any[]): void {
				const items: any[] = [];
				if (Array.isArray(args) && args.length){
					for (const val of args) items.push(_format(val));
				}
				console[_method('log')](...[...values, ...items]);
			},

			/**
			 * `console.debug` formatted values
			 * 
			 * @param args 
			 */
			debug(...args: any[]): void {
				const items: any[] = [];
				if (Array.isArray(args) && args.length){
					for (const val of args) items.push(_format(val));
				}
				console[_method('debug')](...[...values, ...items]);
			},

			/**
			 * `console.warn` formatted values
			 * 
			 * @param args 
			 */
			warn(...args: any[]): void {
				const items: any[] = [];
				if (Array.isArray(args) && args.length){
					for (const val of args) items.push(_format(val));
				}
				console[_method('warn')](...[...values, ...items]);
			},

			/**
			 * `console.error` formatted values
			 * 
			 * @param args 
			 */
			error(...args: any[]): void {
				const items: any[] = [];
				if (Array.isArray(args) && args.length){
					for (const val of args) items.push(_format(val));
				}
				console[_method('error')](...[...values, ...items]);
			},

			/**
			 * `console.info` formatted values
			 * 
			 * @param args 
			 */
			info(...args: any[]): void {
				const items: any[] = [];
				if (Array.isArray(args) && args.length){
					for (const val of args) items.push(_format(val));
				}
				console[_method('info')](...[...values, ...items]);
			},
		};
	}

	/**
	 * Clean/remove text formatting
	 * 
	 * @param args - parse items (arguments)
	 * @returns `any[]`
	 */
	static clean(...args: any[]): any[] {
		const _clean = (val: string): string => Object.values(this.FORMATS).reduce<string>((p, v)=> p.replace(new RegExp(String(v).replace(/\x1B/, '\\x1B').replace(/\[/, '\\['), 'g'), ''), val);
		const values: any[] = [];
		for (const val of args) values.push('string' === typeof val && val.trim().length ? _clean(val) : val);
		return values;
	}

	/**
	 * Format text
	 * 
	 * @param value - format text
	 * @param formats - text formats
	 * @returns `string`
	 */
	static text(value: string, formats?: string|string[]): string {
		const _val: string = _string(value);
		const _formats: string[] = [], _formats_list: string[] = (Array.isArray(formats) ? formats : 'string' === typeof formats ? [formats] : []);
		for (const v of _formats_list){
			if ('string' === typeof v && !!v.trim()) _formats.push(v);
		}
		if (!(_formats.length && _val.trim().length)) return _val;
		return this.format(_formats, _val).values()[0];
	}

	/**
	 * Print line ~ `console.log(' ')`
	 */
	static br(): void {
		console.log(' ');
	}

	/**
	 * Print log ~ `console.log(..)`
	 * 
	 * @param args - log arguments
	 */
	static log(...args: any[]): void {
		this.format('log', ...args).log();
	}

	/**
	 * Print debug ~ `console.debug(..)`
	 * 
	 * @param args - log arguments
	 */
	static debug(...args: any[]): void {
		this.format('debug', ...args).debug();
	}

	/**
	 * Print error ~ `console.error(..)`
	 * 
	 * @param args - log arguments
	 */
	static error(...args: any[]): void {
		this.format('error', ...args).error();
	}

	/**
	 * Print warning ~ `console.warn(..)`
	 * 
	 * @param args - log arguments
	 */
	static warn(...args: any[]): void {
		this.format('warn', ...args).warn();
	}

	/**
	 * Print info ~ `console.info(..)`
	 * 
	 * @param args - log arguments
	 */
	static info(...args: any[]): void {
		this.format('info', ...args).info();
	}

	/**
	 * Print success ~ `console.log('..')`
	 * 
	 * @param args - log arguments
	 */
	static success(...args: any[]): void {
		this.format('success', ...args).log();
	}

	/**
	 * Parse list items
	 * 
	 * @param value - parse value
	 * @param _entries - (default: `false`) whether to parse entries ~ `Object.entries(value)`
	 * @returns `[list: any[], type:'values'|'entries']`
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
	 * ### Print table ~ `console.table`
	 * 
	 * _uses process argument options as default values for params:_
	 * - `cellMaxLength` = `--cellMaxLength=##` (where `##` is positive integer)
	 * - `divider` = `--divider` | `--divider=false`
	 * - `noIndex` = `--noIndex` | `--noIndex=false`
	 * 
	 * @param data - log data
	 * @param cellMaxLength - (default: `250`) table max cell length (width)
	 * @param divider - (default: `false`) whether to add row divider
	 * @param noIndex - (default: `false`) whether to remove index column ([#])
	 */
	static table(data: any, cellMaxLength?: number, divider?: boolean, noIndex?: boolean): void {
		
		//args
		let args_cellMaxLength: number|undefined = undefined;
		let args_divider: boolean|undefined = undefined;
		let args_noIndex: boolean|undefined = undefined;
		const args_text: string = process?.argv && Array.isArray(process.argv) ? process.argv.slice(2).join('|') : '';
		let args_match: RegExpMatchArray|null = args_text.match(/--cellMaxLength=(\d+)(\||$)/);
		if (args_match) args_cellMaxLength = _posInt(args_match[1], 0);
		if (!!(args_match = args_text.match(/--divider(\||$)/))) args_divider = true;
		else if (!!(args_match = args_text.match(/--divider=false(\||$)/))) args_divider = false;
		if (!!(args_match = args_text.match(/--noIndex(\||$)/))) args_noIndex = true;
		else if (!!(args_match = args_text.match(/--noIndex=false(\||$)/))) args_noIndex = false;
		cellMaxLength = args_cellMaxLength ?? _posInt(cellMaxLength, 0) ?? 250;
		divider = args_divider ?? divider ?? false;
		noIndex = args_noIndex ?? noIndex ?? false;

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
			const _val: string = _strEscape(val);
			return [_val, color];
		};

		//table items
		let mode: 'values'|'entries' = undefined as any;
		const table_items: any[][] = [];
		if (data_type === 'entries'){
			if (!noIndex) table_items.push(['[#]', 'Values']);
			table_items.push(...data_items);
		}
		else {
			let map_keys: string[] = [], map_items: {[key: string]: any}[] = [];
			for (let r = 0; r < data_items.length; r ++){
				const data_item = data_items[r];
				let [list_items, list_type] = that.list(data_item, !r || mode === 'entries');
				if (!r) mode = list_type;
				const map_item: {[key: string]: any} = {};
				for (let i = 0; i < list_items.length; i ++){
					const item = list_items[i];
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
				}
				map_items.push(map_item);
			}
			if (!noIndex) table_items.push(['[#]', ...map_keys]);
			for (let r = 0; r < map_items.length; r ++){
				const table_item: any[] = [], map_item = map_items[r];
				for (const key of map_keys) table_item.push(map_item[key]);
				table_items.push([...(!noIndex ? [r] : []), ...table_item]);
			}
		}

		//width
		const width_map: {[key: number]: number} = {};
		const str_items: [_value: string, _format: string][][] = [];
		for (const table_item of table_items){
			const str_item: [_value: string, _format: string][] = [];
			for (let i = 0; i < table_item.length; i ++){
				const val = table_item[i];
				const [_value, _format] = strVal(val);
				if (!width_map.hasOwnProperty(i)) width_map[i] = 0;
				let len = _value.length;
				if (cellMaxLength && len > cellMaxLength) len = cellMaxLength; //cellMaxLength limit
				if (len > width_map[i]) width_map[i] = len;
				str_item.push([_value, _format]);
			}
			str_items.push(str_item);
		}

		//rows
		const rows_len: number = str_items.length;
		for (let r = 0; r < str_items.length; r ++){
			const str_item = str_items[r];
			let max_lines: number = 0;
			let str_item_lines: string[][] = [];
			for (let i = 0; i < str_item.length; i ++){
				let [_value, _format] = str_item[i];
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
			}
			const max_str_item_lines: string[][] = [];
			for (let c = 0; c < str_item_lines.length; c ++){
				const lines = str_item_lines[c];
				const width: number = width_map[c];
				const str_max_lines: string[] = [];
				const max_lines_array: any[] = [...Array(max_lines)];
				for (let i = 0; i < max_lines_array.length; i ++) str_max_lines.push(i < lines.length ? lines[i] : ''.padEnd(width));
				max_str_item_lines.push(str_max_lines);
			}
			str_item_lines = max_str_item_lines;
			const line_rows:string[][] = [];
			for (const _ of [...Array(max_lines)]) line_rows.push([]);
			for (let c = 0; c < str_item_lines.length; c ++){
				const lines = str_item_lines[c];
				for (let i = 0; i < lines.length; i ++){
					line_rows[i][c] = lines[i]
				}
			}
			const rows: string[] = [];
			const len = line_rows.length;
			const lines_top = [
				{line: '─', left: '┌─', mid: '─┬─', right: '─┐'},
				{line: '═', left: '╔═', mid: '═╦═', right: '═╗'},
				{line: '─', left: '╓─', mid: '═╤═', right: '─╖'},
			];
			const lines_mid = [
				{line: '─', left: '├─', mid: '─┼─', right: '─┤'},
				{line: '═', left: '╠═', mid: '═╬═', right: '═╣'},
				{line: '─', left: '╟─', mid: '─╫─', right: '─╢'},
				{line: '─', left: '├─', mid: '─┼─', right: '─┤'},
			];
			const lines_bottom = [
				{line: '─', left: '└─', mid: '─┴─', right: '─┘'},
				{line: '═', left: '╚═', mid: '═╩═', right: '═╝'},
			];
			const lines_side = [
				{left: '│ ', mid: ' │ ', right: ' │'},
				{left: '║ ', mid: ' ║ ', right: ' ║'},
			];
			
			//TODO: border modes
			const borderMode: number = 0;

			//REF: https://cboard.cprogramming.com/c-programming/151930-ascii-table-border.html
			// BOX_DLR     ═
			// BOX_DUD     ║
			// BOX_DUL     ╝
			// BOX_DUR     ╚
			// BOX_DDL     ╗
			// BOX_DDR     ╔
			// BOX_DUDL    ╣
			// BOX_DUDR    ╠
			// BOX_DULR    ╩
			// BOX_DDLR    ╦
			// BOX_DUDLR   ╬
			// BOX_DU_SL   ╜
			// BOX_DU_SR   ╙
			// BOX_DD_SL   ╖
			// BOX_DD_SR   ╓
			// BOX_DL_SU   ╛
			// BOX_DL_SD   ╕
			// BOX_DR_SU   ╘
			// BOX_DR_SD   ╒
			// BOX_DU_SLR  ╨
			// BOX_DD_SLR  ╥
			// BOX_DL_SUD  ╡
			// BOX_DR_SUD  ╞
			// BOX_DLR_SU  ╧
			// BOX_DLR_SD  ╤
			// BOX_DLR_SUD ╪
			// BOX_DUD_SL  ╢
			// BOX_DUD_SR  ╟
			// BOX_DUD_SLR ╫
			// BOX_SLR     ─
			// BOX_SUD     │
			// BOX_SUL     ┘
			// BOX_SUR     └
			// BOX_SDL     ┐
			// BOX_SDR     ┌
			// BOX_SULR    ┴
			// BOX_SDLR    ┬
			// BOX_SUDL    ┤
			// BOX_SUDR    ├
			// BOX_SUDLR   ┼
			
			//-- table borders
			for (let n = 0; n < line_rows.length; n ++){
				const line_row = line_rows[n];
				let b: any, bm: number = borderMode === 0 ? 0 : 1;

				//-- border top
				b = lines_top[bm];
				if (!n && !r){
					let border_top: string = b.left;
					for (let i = 0; i < line_row.length; i ++){
						border_top += (i ? b.mid : '') + ''.padEnd(width_map[i], b.line);
					}
					border_top += b.right;
					rows.push(border_top);
				}

				//-- border side
				b = lines_side[bm];
				rows.push(b.left + line_row.join(b.mid) + b.right);

				//-- border mid
				b = lines_mid[bm];
				if ((!r || divider) && n + 1 === len && r + 1 < rows_len){
					let border_mid: string = b.left;
					for (let i = 0; i < line_row.length; i ++){
						border_mid += (i ? b.mid : '') + ''.padEnd(width_map[i], b.line);
					}
					border_mid += b.right;
					rows.push(border_mid);
				}

				//-- border bottom
				b = lines_bottom[bm];
				if (n + 1 === len && r + 1 === rows_len){
					let border_bottom: string = b.left;
					for (let i = 0; i < line_row.length; i ++){
						border_bottom += (i ? b.mid : '') + ''.padEnd(width_map[i], b.line);
					}
					border_bottom += b.right;
					rows.push(border_bottom);
				}
			}
			console.log(rows.join('\n')); //<< print table
		}
	}

	/**
	 * Console clear logs
	 */
	static get clear(): () => void {
		return function(): void {
			console.log('\x1Bc');
			console.clear();
		};
	}
}