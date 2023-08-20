import * as Fs from 'fs';
import * as Path from 'path';
import * as Readline from 'readline';
import { Term, _jsonParse } from '../xutils';

/**
 * Get existing path type
 * 
 * @param path
 * @returns `0|1|2` ~> `0` = not found | `1` = file | `2` = directory
 */
export const _pathExists = (path: string): 0|1|2 => {
	try {
		const stats = Fs.statSync(path);
		if (stats.isFile()) return 1;
		if (stats.isDirectory()) return 2;
	}
	catch (e){}
	return 0;
};

/**
 * Get directory listing
 * 
 * @param dir  Directory path
 * @param mode  List mode (i.e. `0` = all | `1` = only files | `2` = only subfolders)
 * @param recursive  List recursively `boolean`
 * @returns `string[]` Paths array
 */
export const _lsDir = async (dir: string, mode: number = 0, recursive: boolean = false): Promise<string[]> => {
	if (_pathExists(dir) !== 2) throw new Error(`List directory path not found: "${dir.replace(/\\/g, '/')}".`);
	if (![0, 1, 2].includes(mode)) mode = 0;
	recursive = !!recursive;
	const items = await Fs.promises.readdir(dir, {withFileTypes: true});
	return items.reduce<Promise<string[]>>(async (promise, item) => promise.then(async (prev: string[]): Promise<string[]> => {
		const path = Path.resolve(dir, item.name);
		if (item.isDirectory()){
			if ([0, 2].includes(mode)) prev.push(path);
			if (!recursive) return prev;
			const _files = await _lsDir(path, mode, recursive);
			prev.push(..._files);
		}
		else if ([0, 1].includes(mode)) prev.push(path);
		return prev;
	}), Promise.resolve([]));
};

/**
 * Read file content lines `callback` (Aborts if `callback` result is `false`);
 * 
 * @param file  File path
 * @param callback  Read line handler
 * @returns `number` Total lines read
 */
export const _readLines = async (file: string, handler: (lineContent: string, lineNumber?: number)=>any): Promise<number> => {
	if (_pathExists(file) !== 1) throw new Error(`Read lines file path not found: "${file.replace(/\\/g, '/')}".`);
	const fileStream = Fs.createReadStream(file);
	const rl = Readline.createInterface({input: fileStream, crlfDelay: Infinity});
	let n: number = 0;
	for await (let line of rl){
		n ++;
		const res: any = await (async()=>handler(line, n))();
		if (res === false) break;
	}
	return n;
};

/**
 * Read file contents
 * 
 * @param path  File path
 * @param parse  Parse content to string or JSON decode (default Buffer)
 * @param _default  Default result on parse failure [default: `undefined`]
 * @returns `T|undefined` Parsed data or `undefined` on failure
 */
export const _readSync = <T extends any>(path: string, parse: boolean|'json' = false, _default: T|undefined = undefined): T => {
	try {
		if (_pathExists(path) !== 1) throw new Error(`Invalid read file path. (${path})`);
		const buffer: any = Fs.readFileSync(path);
		if (!parse) return buffer;
		const content: any = buffer.toString();
		if (parse !== 'json') return content;
		const fail = `__fail_${Date.now()}__`;
		const json = _jsonParse(content, fail);
		if (json === fail) throw new Error(`JSON parse read file content failed. (${path})`);
		return json;
	}
	catch (e){
		if (_default === undefined) Term.warn(e);
		return _default as T;
	}
};

/**
 * Write file contents
 * 
 * @param path  File path
 * @param content  Write content
 * @param append  [default: `false` (overwrite)] Append content
 * @param abortController  `AbortController`
 * @returns `void`
 */
export const _writeSync = (path: string, content: string|NodeJS.ArrayBufferView, append: boolean = false, abortController: AbortController|undefined = undefined): void => {
	const _options: any = {};
	if (abortController instanceof AbortController){
		const { signal } = abortController;
		_options.signal = signal;
	}
	if (append) _options.flag = 'a+';
	return Fs.writeFileSync(path, content, _options);
};

/**
 * Get process working directory (`process.cwd()`)
 * 
 * @returns `string`
 */
export const _processCwd = (): string => process.cwd();

/**
 * Get parsed process arguments (`process.argv`) as options
 * 
 * @returns `{[key: string]: string|boolean}`
 */
export const _processArgs = (): {[key: string]: string|boolean} => {
	if (!(Array.isArray(process?.argv) && process.argv.length > 2)) return {};
	const args = process.argv.slice(2), options: {[key: number|string]: string|boolean} = {};
	let key: string|undefined = undefined, opts: number = 0;
	args.forEach((val, i) => {
		let matches: RegExpMatchArray|null;
		if (!(matches = val.match(/(^|\s)(--([_0-9a-zA-Z][-_0-9a-zA-Z]*[_0-9a-zA-Z]))($|([ =])(.*)$)/))) matches = val.match(/(^|\s)(-([a-zA-Z]))($|([ =])(.*)$)/);
		if (matches && matches.length >= 7){
			const k = matches[2];
			const e = 'string' === typeof matches[5] ? matches[5] : '';
			const v = 'string' === typeof matches[6] ? (e !== '=' ? e : '') + matches[6] : '';
			if (e === '=' || v.length){
				options[k] = v === 'false' ? false : v;
				key = undefined;
			}
			else options[key = k] = true;
			if (!opts) opts = 1;
			return;
		}
		if (key !== undefined){
			options[key] = val === 'false' ? false : val;
			key = undefined;
			return;
		}
		key = undefined;
		if (opts) return console.warn(`[W] _processArgs: Ignored "${val}" option. Invalid argument format.`);
		options[`${i}`] = val;
	});
	return options;
};

/**
 * Delete directory - returns (1 = success, 0 = failure, -1 = invalid path/not found)
 * 
 * @param path  Directory path
 * @param recursive  Delete directory contents
 * @returns `number` 1 = success, 0 = failure, -1 = invalid path/not found
 */
export const _removeDir = (path: string, recursive: boolean = false): number => {
	try {
		if (_pathExists(path = path.trim()) !== 2) return -1;
		Fs.rmSync(path, {recursive, force: true});
		return 1;
	}
	catch (e){
		console.warn('[W] _removeDir:', e);
		return 0;
	}
};

/**
 * Delete file - returns (1 = success, 0 = failure, -1 = invalid path/not found)
 * 
 * @param path
 * @returns `number` 1 = success, 0 = failure, -1 = invalid path/not found
 */
export const _removeFile = (path: string): number => {
	try {
		if (_pathExists(path = path.trim()) !== 1) return -1;
		Fs.unlinkSync(path);
		return 1;
	}
	catch (e){
		console.warn('[W] _removeFile:', e);
		return 0;
	}
};