import { _filetype, _realpath } from './xfs';
import { _str } from './xutils';

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
		if (!silent) _print(`[E] The ${type} path is empty.`, true);
		return '';
	}
	if (!(path = _realpath(dir = path))){
		if (!silent) _print(`[E] The ${type} path (${dir}) does not exist.`, true);
		return '';
	}
	if (_filetype(path) < 2){
		if (!silent) _print(`[E] The ${type} path (${path}) is not a folder.`, true);
		return '';
	}
	return path;
};

//normalize path separator
export const _normSep = (v: string): string => _str(v, true).replace(/[\\/]/g, '/').replace(/\/$/, '');