import { _commas, _jsonStringify, _posInt, _round, _split, _str } from '../utils';

/**
 * Basename (stringable) object interface
 */
export interface IBasename {
	value: any;
	basename: string;
	name: string;
	ext: string;
	error: string;
	illegal: string[];
	invalid: string[];
	
	/**
	 * Get basename text
	 * 
	 * @param prop - text value prop
	 * @returns `string`
	 */
	toString: (
		
		/**
		 * Specify text value prop (default `'basename'`)
		 */
		prop?: 'basename'|'name'|'ext'|'error'
	)=>string;
}

/**
 * Basename error interface
 */
export interface IBasenameError extends Error {
	name: string;
	item: IBasename;
}

/**
 * Get validated basename from file path value
 * 
 * - splits path separators `[\\/]` uses last entry
 * - trims spaces, invalidates empty
 * - invalidates illegal characters (i.e. `:?"<>|*`)
 * - invalidates invalid names (i.e. `'...', 'name.', 'name...'`)
 * 
 * @param value - parse path value
 * @param dots - allow dot nav ~ `'.' | '..'` (default: `false`)
 * @param _strict - strict parsing ~ returns blank (`''`) values on error
 * @param _failure - error handling ~ `0` = ignore, '1' = warn, `2` = throw error (default `0`)
 * @returns `IBasename` basename (stringable)
 * @throws `IBasenameError`
 */
export const _basename = (value: any, dots: boolean = false, _strict: boolean = false, _failure?: 0|1|2): IBasename => {
	const failure: 0|1|2 = [0, 1, 2].includes(_failure = parseInt(_failure + '') as any) ? _failure as (0|1|2) : 0;

	//basename item
	const item: IBasename = {
		value,
		basename: '',
		name: '',
		ext: '',
		error: '',
		illegal: [],
		invalid: [],
		toString(prop?: 'basename'|'name'|'ext'|'error'): string {
			const key: string = prop && ['basename', 'name', 'ext', 'error']
			.includes(prop = _str(prop, true).toLowerCase() as any) ? prop + '' : 'basename';
			return this[key as 'basename'|'name'|'ext'|'error'];
		},
	};

	//parse value
	let m: RegExpMatchArray|null = null;
	const val = item.name = item.basename = _str(_str(value, true).split(/[\\\/]/g).pop(), true);
	if (m = val.match(/([^\\/]*)$/i)){
		item.name = m[1];
		if (m = item.name.match(/(.*)(\.([-_0-9a-zA-Z]+))$/i)){
			item.name = m[1];
			item.ext = m[3];
		}
	}
	try {
		const errors: string[] = [];
		if (!val) errors.push('The basename string value is empty');
		else {

			//dots
			if (!dots && ['..', '..'].includes(val)){
				item.invalid.push(val);
				errors.push(`The basename "${val}" dots not allowed`);
			}

			//invalid
			if (/^\.\.[\.]+$/.test(val) || /[^\.][\.]+$/.test(val)){
				if (!item.invalid.length) item.invalid.push(val);
				errors.push(`The basename "${val}" format is invalid`);
			}
			
			//illegal
			if (m = val.match(/[\:\?\"\<\>\|\*]/g)){
				item.illegal.push(...m);
				errors.push(`The basename "${val}" contains illegal characters (:?"<>|*) => "${m.join('')}"`);
			}
		}
		if (errors.length) throw new Error(item.error = errors.join('; ') + '.'); //error - set, throw
		return item; //result
	}
	catch (e: any){
		if (_strict){ //strict - clear
			item.basename = '';
			item.name = '';
			item.ext = '';
		}
		if (failure){ //failure - custom error
			class BasenameError extends Error implements IBasenameError {
				name: string = 'BasenameError';
				item: IBasename = item;
			}
			const error = new BasenameError(`${e.message || e}`);
			if (failure === 2) throw error; //throw
			else console.warn(error + '', {item}); //warn
		}
		return item; //result
	}
};

/**
 * Normalized path (stringable) interface
 */
export interface IFilePath {
	value: any;
	root: string;
	drive: string;
	path: string;
	dir: string;
	basename: string;
	name: string;
	ext: string;
	error: string;
	illegal: string[];
	invalid: string[];

	/**
	 * Get path text
	 * 
	 * @param prop - text value prop
	 * @returns `string`
	 */
	toString: (

		/**
		 * Specify text value prop (default: `'path'`)
		 * - use `'file'` to enforce valid basename and no error
		 */
		prop?: 'file'|'root'|'drive'|'path'|'dir'|'basename'|'name'|'ext'|'error'
	)=>string;
}

/**
 * Normalized path error interface
 */
export interface IFilePathError extends Error {
	name: string;
	item: IFilePath;
}

/**
 * Get normalized file/directory path (validates basename)
 * 
 * - trims spaces, silently omits empty
 * - invalidates illegal path name characters (i.e. `:?"<>|*`)
 * - invalidates invalid path name dots (i.e. `'...', 'name.', 'name...'`)
 * - invalidates outbound root dot nav
 * - normalizes dot path			(i.e. `'/.'` => `'/'`, `'a/b/./c' => 'a/b/c'`, `'./a/../b/c' => './b/c'`) ignores out of bound (i.e. `'C:/a/../../b/c' => 'C:/b/c'`)
 * - normalizes drive letter	(i.e. `'c:\\a.txt' => 'C:\\a.txt'`, `'c:'` => `'C:\\'`)
 * 
 * @param value - parse path value
 * @param separator - result path separator ~ `'' | '/' | '\\'` (default `''` = unchanged)
 * @param _strict - strict parsing ~ returns blank (`''`) values on error
 * @param _type - path type (default `''`) ~ name used in error message (i.e. `'The ${_type} path...'`)
 * @param _failure - error handling ~ `0` = ignore, '1' = warn, `2` = throw error (default `0`)
 * @returns `IFilePath` normalized path (stringable)
 */
export const _filepath = (value: any, separator?: ''|'/'|'\\', _strict: boolean = false, _type?: string, _failure?: 0|1|2): IFilePath => {
	const sep: ''|'/'|'\\' = ['', '/', '\\'].includes(separator = _str(separator, true) as any) ? separator as (''|'/'|'\\') : '';
	const type: string = (_type = _str(_type, true).replace(/path\s*$/i, '').trim()) ? _type + ' ' : '';
	const failure: 0|1|2 = [0, 1, 2].includes(_failure = parseInt(_failure + '') as any) ? _failure as (0|1|2) : 0;
	
	//normalized path item
	const item: IFilePath = {
		value,
		root: '',
		drive: '',
		path: '',
		dir: '',
		basename: '',
		name: '',
		ext: '',
		error: '',
		illegal: [],
		invalid: [],
		toString(prop?: 'file'|'root'|'drive'|'path'|'dir'|'basename'|'name'|'ext'|'error'): string {
			let key: string = prop && ['file', 'root', 'drive', 'path', 'dir', 'basename', 'name', 'ext', 'error']
			.includes(prop = _str(prop, true).toLowerCase() as any) ? prop + '' : 'path';
			if (key === 'file'){
				if (!(!this.error && this.basename)) return '';
				key = 'path';
			}
			return this[key as 'root'|'drive'|'path'|'dir'|'basename'|'name'|'ext'|'error'];
		},
	};

	//parse path
	let path: string = _str(value, true);
	try {
		let root = '', drive = '', m: RegExpMatchArray|null = null;
		const items: [part: string, div: string][] = [];
		const path_parts: [part: string, div: string][] = _split(path, /[\\\/]/);
		for (let i = 0; i < path_parts.length; i ++){
			let [part, div] = path_parts[i];
			div = div ? (sep ? sep : div) : '';
			if (!i){
				if (/[a-z]\:/i.test(part)) root = drive = part.toUpperCase() + ((sep ? sep : div) || '\\');
				else if (!part && div) root = div;
				if (root) continue;
			}
			items.push([part, div]);
		}

		//parse items - trim basename
		const trimmed_parts: [part: string, div: string][] = [];
		for (let i = 0; i < items.length; i ++){
			let [part, div] = items[i];
			part = _str(part, true);
			if (i && !part) continue; //skip blank ('') entries
			trimmed_parts.push([part, div]);
		}

		//parse trimmed - normalize dot path
		const norm_parts: [part: string, div: string][] = [];
		for (let i = 0; i < trimmed_parts.length; i ++){
			let [part, div] = trimmed_parts[i];
			if (part === '.' && (!i && root || i)){ //match dot path ('.') (at start with root, not at start)
				if (i && i === trimmed_parts.length - 1) trimmed_parts[i - 1][1] = ''; //if last remove previous separator
				continue; //skip unnecessary dot path ('.')
			}
			norm_parts.push([part, div]);
		}

		//parse normalized - validate parts
		const invalid: Set<string> = new Set();
		const illegal: Set<string> = new Set();
		const outbound: [part: string, div: string][] = [];
		const parts: [part: string, div: string][] = [];
		for (let i = 0; i < norm_parts.length; i ++){
			const [part, div] = norm_parts[i]; //part entry
			try {
				_basename(part, true, false, 2); //validate basename
			}
			catch (e: any) {
				if (Array.isArray(e?.item?.invalid) && e.item.invalid.length){
					for (const v of e.item.invalid) invalid.add(v);
				}
				if (Array.isArray(e?.item?.illegal) && e.item.illegal.length){
					for (const v of e.item.illegal) illegal.add(v);
				}
			}
			if (part === '..'){ //dot path ('..') nav
				if (parts.length){ //pop parent
					const p = parts.length - 1;
					if (p > -1 && !!parts[p][0] && !['.', '..'].includes(parts[p][0])){
						parts.pop();
						continue;
					}
				}
				else if (root){ //root parent - outbound 
					outbound.push([part, div]);
					if (drive) continue; //ignore when root is drive
				}
			}
			parts.push([part, div]); //add entry
		}
		if (root && parts.length && !parts[0][0] && parts[0][1]) parts[0][1] = ''; //fix root separator
		if (outbound.length) outbound.push(...parts); //outbound entries

		//update item - set root, drive, dir, basename, ext, dir
		item.root = root;
		item.drive = drive;

		//join parts - update dir, path
		let tmp_path: string = '';
		for (const part of parts) tmp_path += part.join('');
		item.dir = item.path = path = root + tmp_path.replace(/[\\/]$/, '');

		//update item - set basename, name, ext, dir
		const end = parts.pop();
		if (end && !['', '.', '..'].includes(end[0])){
			const basename: IBasename = _basename(end[0]);
			item.basename = basename.basename;
			item.name = basename.name;
			item.ext = basename.ext;

			//join parts - update dir
			tmp_path = '';
			for (const part of parts) tmp_path += part.join('');
			item.dir = root + tmp_path.replace(/[\\/]$/, '');
		}

		//check errors - update item
		const errors: string[] = [];
		tmp_path = '';
		for (const part of outbound) tmp_path += part.join('');
		const outbound_path = tmp_path ? root + tmp_path : '';
		if (outbound_path) errors.push(`The ${type}root (${root}) dot nav path is outbound "${outbound_path}" => "${path}"`); //outbound
		if (invalid.size) errors.push(`The ${type}path contains invalid name${invalid.size > 1 ? 's' : ''} (${_jsonStringify([...invalid])})`); //invalid
		if (illegal.size) errors.push(`The ${type}path contains illegal characters (:?"<>|*) => "${[...illegal].join('')}"`); //illegal
		if (errors.length){ //throw errors
			item.invalid = [...invalid];
			item.illegal = [...illegal];
			throw new Error(item.error = errors.join('; ') + '.'); //error - set, throw
		}
		return item; //<< result - IFilePath
	}
	catch (e: any){
		if (_strict){ //strict - clear
			item.root = '';
			item.drive = '';
			item.path = '';
			item.dir = '';
			item.basename = '';
			item.name = '';
			item.ext = '';
		}
		if (failure){ //failure - custom error
			class NormPathError extends Error implements IFilePathError {
				name: string = 'NormPathError';
				item: IFilePath = item;
			}
			const error = new NormPathError(`${e.message || e}`);
			if (failure === 2) throw error; //throw
			else console.warn(error + '', {item}); //warn
		}
		return item; //<< result - IFilePath (failed)
	}
};

/**
 * Format bytes to `'B'|'KB'|'MB'|'GB'|'TB'|'PB'|'EB'|'ZB'|'YB'` text
 * 
 * @param bytes - parse bytes
 * @param places - decimal places
 * @param commas - use thousand comma separator
 * @returns `string`
 */
export const _bytesText = (bytes: number, places: number = 2, commas: boolean = false): string => {
	if (!(bytes = _posInt(bytes, 0) ?? 0)) return '0 B';
	const kb: number = 1024, labels = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
	const i = Math.floor(Math.log(bytes)/Math.log(kb)), label = labels[i], size = bytes/Math.pow(kb, i);
	return (commas ? _commas(size, places) : _round(size, places)) + ' ' + label;
};