import * as Fs from 'fs';
import * as Path from 'path';
import * as Readline from 'readline';
import * as Crypto from 'crypto';
import { Term, _basename, _errorText, _filepath, _getAllProperties, _jsonParse, _posInt, _round, _str } from '../xutils';


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
export const _realpath = (path: string, target: boolean = false): string => {
	if (!_exists(path)) return '';
	return target ? Fs.realpathSync(path) : Path.resolve(path);
};

/**
 * Get symbolic link target path
 * 
 * @param path - link path
 * @returns `string|undefined`
 */
export const _target = (path: string): string => {
	return _realpath(path, true);
};

/**
 * Get path basename
 * 
 * @param path - file path
 * @param suffix - optionally, an extension to remove from the result.
 * @returns `string` result | `''` on error
 */
export const _filename = (path: string, suffix?: string): string => {
	try {
		return Path.basename(path, suffix);
	}
	catch (e){
		console.warn('[E] _filename', e);
		return '';
	}
};

/**
 * Get path dirname
 * 
 * @param path - parse path
 * @param absolute - resolve absolute path
 * @returns `string` result | `''` on error
 */
export const _dirname = (path: string, absolute: boolean = false): string => {
	try {
		const dir = Path.dirname(path);
		return absolute ? _realpath(dir) : dir;
	}
	catch (e){
		console.warn('[E] _dirname', e);
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
	let info: IPathInfo|undefined = _pathinfo(path);
	if (info){;
		if (!info.isDirectory) throw new Error(`Create directory failed! The path already exists "${info.path_full}" (type = ${info.type}).`);
		return info.path_full;
	}
	try {
		Fs.mkdirSync(path, {mode, recursive});
		if (!((info = _pathinfo(path)) && info.isDirectory)) throw new TypeError(`Failed to resolve created directory real path (${path}).`);
		return info.path_full;
	}
	catch (e){
		throw new Error(`Create directory failed! ${e}`);
	}
};

/**
 * Path info interface
 */
export interface IPathInfo {
	/**
	 * 0 - unknown, 1 = file, 2 = directory, 3 = dir link, 4 = file link
	 */
	type: number;
	path: string,
	path_full: string,
	dir: string,
	dir_full: string,
	basename: string,
	target: string,
	dev: number;
	mode: number;
	nlink: number;
	uid: number;
	gid: number;
	rdev: number;
	blksize: number;
	ino: number;
	size: number;
	blocks: number;
	atimeMs: number;
	mtimeMs: number;
	ctimeMs: number;
	birthtimeMs: number;
	atime: Date;
	mtime: Date;
	ctime: Date;
	birthtime: Date;
	isDirectory: boolean;
	isFile: boolean;
	isBlockDevice: boolean;
	isCharacterDevice: boolean;
	isSymbolicLink: boolean;
	isFIFO: boolean;
	isSocket: boolean;
}

/**
 * Get file path stats
 * 
 * @param path - parse path
 * @param mode - parse mode ~ [`0`] - fs.statSync (follows links), `1` - fs.lstatSync (detect links), `2` - merged
 * @returns `IPathInfo|undefined`
 */
export const _pathinfo = (path: string, mode: 0|1|2 = 0): IPathInfo|undefined => {
	const _get_type = (info: any): number => {
		if (info.isFile) return info.isSymbolicLink ? 4 : 1; 
		if (info.isDirectory) return info.isSymbolicLink ? 3 : 2; 
		return 0;
	}
	const _get_stats = (stats: Fs.Stats): any => ({
		type: 0,
		path,
		path_full: _realpath(path),
		dir: _dirname(path),
		dir_full: _dirname(path, true),
		basename: _filename(path),
		target: _realpath(path, true),
		dev: stats.dev,
		mode: stats.mode,
		nlink: stats.nlink,
		uid: stats.uid,
		gid: stats.gid,
		rdev: stats.rdev,
		blksize: stats.blksize,
		ino: stats.ino,
		size: stats.size,
		blocks: stats.blocks,
		atimeMs: stats.atimeMs,
		mtimeMs: stats.mtimeMs,
		ctimeMs: stats.ctimeMs,
		birthtimeMs: stats.birthtimeMs,
		atime: stats.atime,
		mtime: stats.mtime,
		ctime: stats.ctime,
		birthtime: stats.birthtime,
		isDirectory: stats.isDirectory(),
		isFile: stats.isFile(),
		isBlockDevice: stats.isBlockDevice(),
		isCharacterDevice: stats.isCharacterDevice(),
		isSymbolicLink: stats.isSymbolicLink(),
		isFIFO: stats.isFIFO(),
		isSocket: stats.isSocket(),
	});
	let info: IPathInfo|undefined = undefined;
	if (_exists(path)){
		mode = [0, 1, 2].includes((mode = _posInt(mode, 0) ?? 0 as any)) ? mode : 0
		if (mode === 0) info = _get_stats(Fs.statSync(path));
		else if (mode === 1) info = _get_stats(Fs.lstatSync(path));
		else {
			const stats: any = _get_stats(Fs.statSync(path));
			const lstats: any = _get_stats(Fs.lstatSync(path));
			for (const key in lstats){
				if (!lstats.hasOwnProperty(key)) continue;
				stats[key] = stats[key] || lstats[key];
			}
			info = stats;
		}
	}
	if (info) info.type = _get_type(info);
	return info;
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
	if ((_pathinfo(dir)?.type ?? 0) < 2) throw new Error(`List directory path not found: "${dir.replace(/\\/g, '/')}".`);
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
	if ((_pathinfo(file)?.type ?? 0) !== 1) throw new Error(`Read lines file path not found: "${file.replace(/\\/g, '/')}".`);
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
		if ((_pathinfo(path)?.type ?? 0) !== 1) throw new Error(`Invalid read file path. (${path})`);
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
		const info = _pathinfo(path, 2);
		if (!(info && info.isDirectory)) return -1;
		if (info.isSymbolicLink) Fs.unlinkSync(info.path_full);
		else Fs.rmSync(info.path_full, {recursive, force: true});
		return _exists(info.path_full) ? 0 : 1;
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
		const info = _pathinfo(path, 2);
		if (!(info && (info.isFile || info.isSymbolicLink))) return -1;
		Fs.unlinkSync(info.path_full);
		return _exists(info.path_full) ? 0 : 1;
	}
	catch (e){
		console.warn('[W] _removeFile:', e);
		return 0;
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
	const info = _pathinfo(path);
	if (!(info && info.type === 1)) throw new TypeError(`Hash file path is invalid. (${path})`);
	const hash = Crypto.createHash(algo);
  const stream = Fs.createReadStream(info.path_full);
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

/**
 * Rename existing file path
 * 
 * @param path - file path
 * @param dupes - allow duplicates (default: `false` ~ appends number)
 * @param prefix - basename prefix text
 * @param append - basename append text
 * @returns `string` ~ renamed path
 */
export const _renamePath = (path: string, dupes: boolean = false, prefix: string = '', append: string = ''): string => {
	const {dir, name, ext} = _filepath(path, '/');
	const file_ext = (ext ? '.' + ext : '');
	const file_name = _str(prefix, true) + name + _str(append, true);
	let val: string = dir + '/' + file_name + file_ext;
	if (dupes) return val;
	let num: number = 0;
	while (_exists(val)){
		num ++;
		val = dir + '/' + file_name + '-' + num + file_ext;
	}
	return val;
};

/**
 * Copy file with progress
 * 
 * @param from_path - copy file source 
 * @param to_path  - copy file destination
 * @param overwrite - whether to overwrite existing
 * @returns `Promise<any>`
 */
export const _copyFile = async (from_path: string, to_path: string, overwrite: boolean = false, onProgress?: (percent:number,copied_size:number,total_size:number)=>void): Promise<any> => {
	const from_info = _pathinfo(from_path);
	if (!from_info){
		const error = 'Copy file from path does not exist.';
		console.warn(error, {from_path, to_path});
		return Promise.reject(error);
	}
	if (!from_info.isFile){
		const error = 'Copy file from path is not a file.';
		console.warn(error, {from_path, to_path, from_info});
		return Promise.reject(error);
	}
	let to_info: IPathInfo|undefined = _pathinfo(to_path);
	if (to_info && to_info.isDirectory){
		const from_filename = _filename(from_info.path_full);
		if (!from_filename){
			const error = 'Failed to get copy from file name.';
			console.warn(error, {from_path, to_path, from_info});
			return Promise.reject(error);
		}
		const to_filename = _filename(to_info.path_full);
		if (!to_filename){
			const error = 'Failed to get copy to file name.';
			console.warn(error, {from_path, to_path, from_info});
			return Promise.reject(error);
		}
		if (from_filename === to_filename){
			const error = 'Copy file destination exists as a directory.';
			console.warn(error, {from_path, to_path, from_info});
			return Promise.reject(error);
		}
		to_info = _pathinfo(to_path = to_info.path_full + '/' + from_filename);
	}
	if (to_info){
		if (!to_info.isFile){
			const error = `Copy file exists with unsupported type! [${to_info.type}] "${to_info.path_full}"`;
			console.warn(error, {from_path, to_path, from_info, to_info});
			return Promise.reject(error);
		}
		to_path = to_info.path_full;
		if (!overwrite){
			to_path = _renamePath(to_path);
			to_info = undefined;
		}
	}
	_mkdir(_dirname(to_path));
	const temp: string = to_path + '.copytemp';
	if (!_removeFile(temp)){
		const error = `Failed to remove copy temp file! "${temp}"`;
		console.warn(error, {from_path, to_path, from_info, to_info});
		return Promise.reject(error);
	}
	let done: number = 0;
	let copied_size: number = 0;
	let total_size: number = from_info.size;
	const _onProgress: ((percent:number,copied_size:number,total_size:number)=>void)|undefined = 'function' === typeof onProgress ? onProgress : undefined;
	const _update = (bytes: number): void => {
		copied_size += bytes;
		const percent: number = _round(copied_size/total_size * 100, 2);
		if (_onProgress) _onProgress(percent, copied_size, total_size);
	};
	return (async () => {
		return new Promise((resolve: (value?: any)=>void, reject: (error?: any)=>void) => {
			const _done = (error?: any) => {
				if (done) return;
				done = 1;
				if (error) reject(error);
				resolve();
			};
			_update(0);
			const stream = Fs.createReadStream(from_info.path_full);
			stream.on('error', function(error: any){
				_done('Copy error! ' + _errorText(error));
			});
			stream.on('data', function(buffer){
				_update(buffer.length);
			});
			stream.on('end', function(){
				_done();
			});
			stream.pipe(Fs.createWriteStream(temp));
		});
	})()
	.then(async () => {
		if (!_removeFile(to_path)){
			const error = `Failed to remove copy overwrite file! "${to_path}"`;
			console.warn(error, {from_path, to_path, from_info, to_info});
			return Promise.reject(error);
		}
		Fs.renameSync(temp, to_path);
	});
};