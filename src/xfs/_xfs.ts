import * as Fs from 'fs';
import * as Path from 'path';
import * as Readline from 'readline';
import * as Crypto from 'crypto';
import { Term, _errorText, _jsonParse } from '../xutils';


/**
 * Check if path exists
 * 
 * @param path - file path
 * @returns `string` real path | `''` on failure
 */
export const _exists = (path: string): boolean => {
	try {
		return !!Fs.existsSync(path);
	}
	catch (e){
		if (`${e}`.indexOf('no such file or directory') < 0) console.warn('[E] _realpath', e);
		return false;
	}
};

/**
 * Get path realpath
 * 
 * @param path - file path
 * @returns `string` result | `''` on error
 */
export const _realpath = (path: string): string => {
	try {
		if (!_exists(path)) return '';
		const res: string = Fs.realpathSync(path);
		return res;
	}
	catch (e){
		console.warn('[E] _realpath', e);
		return '';
	}
};

/**
 * Get path basename
 * 
 * @param path - file path
 * @param suffix - optionally, an extension to remove from the result.
 * @returns `string` result | `''` on error
 */
export const _pathBasename = (path: string, suffix?: string): string => {
	try {
		return Path.basename(path, suffix);
	}
	catch (e){
		console.warn('[E] _pathBasename', e);
		return '';
	}
};

/**
 * Get path dirname
 * 
 * @param path - file path
 * @returns `string` result | `''` on error
 */
export const _pathDirname = (path: string): string => {
	try {
		return Path.dirname(path);
	}
	catch (e){
		console.warn('[E] _pathDirname', e);
		return '';
	}
};

/**
 * Create directory if not exist
 * 
 * @param path - directory path 
 * @param mode - (default: `0o777`) create permission
 * @param recursive - (default: `true`) create recursively ~ create parent folders if they dont exist
 * @returns `string` created directory realpath | `''` on error
 */
export const _mkdir = (path: string, mode: string|number = 0o777, recursive: boolean = true): string => {
	let real_path: string = _realpath(path);
	if (real_path){
		const type = _filetype(path);
		if (type !== 2) throw new Error(`Create directory failed! The path already exists. (${real_path} => ${type})`);
		return real_path;
	}
	try {
		Fs.mkdirSync(path, {mode, recursive});
		if (!((real_path = _realpath(path)) && _filetype(real_path) === 2)) throw new TypeError(`Failed to resolve created directory real path (${path}).`);
		return real_path;
	}
	catch (e){
		throw new Error(`Create directory failed! ${e}`);
	}
};

/**
 * Get existing file type
 * 
 * @param path - file path
 * @returns `0|1|2` ~> `0` = not found | `1` = file | `2` = directory | `3` = symlink directory
 */
export const _filetype = (path: string): 0|1|2|3 => {
	try {
		if (!_exists(path)) return 0;
		const stats = Fs.statSync(path);
		if (stats.isFile()) return 1;
		if (stats.isDirectory()) return stats.isSymbolicLink() ? 3 : 2;
		return 0;
	}
	catch (e){
		if (`${e}`.indexOf('no such file or directory') < 0) console.warn('[E] _filetype', e);
		return 0;
	}
};

/**
 * Get directory content paths
 * 
 * @param dir - root directory path
 * @param mode - parse mode (i.e. `0` = all | `1` = only files | `2` = only subfolders)
 * @param recursive - whether to parse subbolders recursively
 * @returns `string[]` root directory content paths
 */
export const _lsDir = async (dir: string, mode: number = 0, recursive: boolean = false): Promise<string[]> => {
	if (_filetype(dir) < 2) throw new Error(`List directory path not found: "${dir.replace(/\\/g, '/')}".`);
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
	if (_filetype(file) !== 1) throw new Error(`Read lines file path not found: "${file.replace(/\\/g, '/')}".`);
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
		if (_filetype(path) !== 1) throw new Error(`Invalid read file path. (${path})`);
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
		let force: boolean = true;
		const type = _filetype(path = path.trim());
		if (type < 2) return -1;
		if (type === 3){
			recursive = false;
			force = false;
		}
		Fs.rmSync(path, {recursive, force});
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
		if (_filetype(path = path.trim()) !== 1) return -1;
		Fs.unlinkSync(path);
		return 1;
	}
	catch (e){
		console.warn('[W] _removeFile:', e);
		return 0;
	}
};

/**
 * Get symbolic link target path
 * 
 * @param path - link path
 * @returns `string|undefined`
 */
export const _linkTarget = (path: string): string => {
	try {
		if (_filetype(path) !== 3) return '';
		const target: string = Fs.readlinkSync(path);
		if (!('string' === typeof target && target.trim())) throw new TypeError('Empty read link result.');
		return target;
	}
	catch (e){
		console.warn(`Read link "${path}" failure; ${e}`);
		return '';
	}
};

/**
 * Get hash algorithms
 * 
 * @returns `string[]` ~ `RSA-MD5`, `RSA-RIPEMD160`, `RSA-SHA1`, `RSA-SHA1-2`, `RSA-SHA224`, `RSA-SHA256`, `RSA-SHA3-224`, `RSA-SHA3-256`, `RSA-SHA3-384`, `RSA-SHA3-512`, `RSA-SHA384`, `RSA-SHA512`, `RSA-SHA512/224`, `RSA-SHA512/256`, `RSA-SM3`, `blake2b512`, `blake2s256`, `id-rsassa-pkcs1-v1_5-with-sha3-224`, `id-rsassa-pkcs1-v1_5-with-sha3-256`, `id-rsassa-pkcs1-v1_5-with-sha3-384`, `id-rsassa-pkcs1-v1_5-with-sha3-512`, `md5`, `md5-sha1`, `md5WithRSAEncryption`, `ripemd`, `ripemd160`, `ripemd160WithRSA`, `rmd160`, `sha1`, `sha1WithRSAEncryption`, `sha224`, `sha224WithRSAEncryption`, `sha256`, `sha256WithRSAEncryption`, `sha3-224`, `sha3-256`, `sha3-384`, `sha3-512`, `sha384`, `sha384WithRSAEncryption`, `sha512`, `sha512-224`, `sha512-224WithRSAEncryption`, `sha512-256`, `sha512-256WithRSAEncryption`, `sha512WithRSAEncryption`, `shake128`, `shake256`, `sm3`, `sm3WithRSAEncryption`, `ssl3-md5`, `ssl3-sha1`
 */
export const _hashes = (): string[] => Crypto.getHashes();


/**
 * Get file checksum hash
 * 
 * @param path - file path
 * @param algo - hash algorithm (default: `'sha256'`) ~ see `_hashes()`
 * @returns `Promise<string>` ~ hash result | `''` on error
 */
export const _hashFile = async (path: string, algo: string = 'sha256'): Promise<string> => {
	if (!_exists(path)) return '';
	const file = _realpath(path);
	const file_type = _filetype(file);
	if (!(file && file_type === 1)) throw new TypeError(`Hash file path is invalid. (${path})`);
  const hash = Crypto.createHash(algo);
  const stream = Fs.createReadStream(path);
  const complete: boolean = await (new Promise((resolve, reject) => {
    stream.on('data', (data) => hash.update(data));
    stream.on('close', resolve);
    stream.on('error', reject);
  }))
	.then(() => true)
	.catch((err: any) => {
		console.warn(`Hash file failure; ${_errorText(err)}`);
		return false;
	});
	if (!complete) return '';
	return hash.digest('hex');
};