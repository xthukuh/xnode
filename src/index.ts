import { _lsDir, _pathExists, _processArgs, _readSync } from './xfs';
import { _regEscape, _str } from './xutils';

//pattern ignore interface
interface IPatternIgnore {
	pattern: string;
	regex: RegExp;
	neg: boolean;
	dir: boolean;
	val: string;
};

//parent interface
interface IParent {
	dir: string;
	short: string;
	important: number;
	rules: IPatternIgnore[],
};

//child interface
interface IChild {
	path: string;
	short: string;
	name: string;
	tests: string[];
	is_dir: boolean;
	ignore: boolean;
	ignore_match: string[];
	important: number;
	important_match: string[];
}

//known paths
const KNOWN_IGNORE_DIRS: string[] = [
	'.git',
	'.github',
	'node_modules',
	'mobile_sdk',
	'xutils',
];
const KNOWN_IGNORE_FILES: string[] = [
	'yarn.lock',
	'yarn-error.log',
	'package-lock.json',
	'npm-debug.log',
];
const KNOWN_IMPORTANT_DIRS: string[] = [];
const KNOWN_IMPORTANT_FILES: string[] = [
	'.gitignore',
	// '.env',
	// '.env.example',
	// '.env.testing',
];

//fn => console log
const _print = (text: string, _error: boolean = false) => {
	text = _str(text).replace(/\n$/, '') + '\n';
	if (_error){
		if ('function' === typeof process?.stderr?.write) process.stderr.write(text);
		else console.error(text);
	}
	else if ('function' === typeof process?.stdout?.write) process.stdout.write(text);
	else console.error(text);
};

//fn => known ignore
const _knownIgnore = (path: string, is_dir: boolean = false): boolean => {
	const parts = path.split('/');
	const name: string = parts.pop()  + '';
	if (is_dir){ //dirs
		if (KNOWN_IGNORE_DIRS.includes(name)) return true; //known dirs
		if (name === 'vendor'){
			const dir = parts.join('/');
			if (_pathExists(dir + '/composer.json') === 1) return true; //composer vendor dir
		}
		return false;
	}
	else { //files
		if (KNOWN_IGNORE_FILES.includes(name)) return true; //known files
		if (/^z__(.*)\.xx(\.|$)/.test(name)) return true; //xx files temp
		if (/.*\.log$/.test(name)) return true; //log files
		return false;
	}
};

//fn => known important
const _knownImportant = (path: string, is_dir: boolean = false): boolean => {
	const parts = path.split('/');
	const name: string = parts.pop()  + '';
	// const dir = parts.join('/');
	if (is_dir){ //dirs
		if (KNOWN_IMPORTANT_DIRS.includes(name)) return true; //known dirs
		if (/\.xx(\.|$)/.test(name)) return true; //xx dirs
		return false;
	}
	else { //files
		if (KNOWN_IMPORTANT_FILES.includes(name)) return true; //known files
		if (/\.xx(\.|$)/.test(name) && !/^z__(.*)\.xx(\.|$)/.test(name)) return true; //xx files (except temp)
		return false;
	}
}

//fn => get pattern ignore
const _ignore = (pattern: string): IPatternIgnore => {
	let neg: boolean = false;
	let dir: boolean = false;
	let val: string = pattern = _str(pattern, true);
	if (neg = val.startsWith('!')) val = val.substring(1);
	if (dir = val.endsWith('/')) val = val.substring(0, val.length - 1);
	val = _regEscape(val.replace(/^\\/, ''));
	const reg = val
	.replace(/\\\*\\\*/g, '.*')
	.replace(/\\\*/g, '[^/]*')
	.replace(/\\\?/g, '[^/]')
	const regex = new RegExp('^' + reg + '$');
	return {
		pattern,
		regex,
		val,
		neg,
		dir,
	};
};

//fn => parse gitignore
const _parseIgnore = (path: string): IPatternIgnore[] => {
	const content = _pathExists(path) === 1 ? _readSync<string>(path, true) : '';
	if (!content) return [];
	const lines: string[] = [...new Set(content.split('\n').map(v => v.trim()).filter(v => v && !/^#/.test(v)))];
	return lines.map(v => _ignore(v));
};

//fn => normalize path
const _normPath = (v: string): string => _str(v, true).replace(/[\\/]/g, '/').replace(/\/$/, '');

//fn => parse directory
const _parseRoot = async (root: string): Promise<IChild[]> => {
	
	//entries
	const entries: IChild[] = [];

	//parse dir
	const _parseDir = async (dir: string, important: number = 0, parents: IParent[] = []) => {
		dir = _normPath(dir);
		const dir_gitignore = dir + '/.gitignore';
		const dir_parent: IParent = {
			dir,
			important,
			short: dir.substring(root.length + 1),
			rules: _parseIgnore(dir_gitignore),
		};
		
		//dir list paths
		const subfolders: string[] = await _lsDir(dir, 2).then((res: string[]) => res.map(v => _normPath(v)));
		const dir_paths: string[] = await _lsDir(dir).then((res: string[]) => res.map(v => _normPath(v)));
		const dir_parents: IParent[] = [...parents, dir_parent];
		
		//parse dir paths
		for (let path of dir_paths){
			
			//path item
			const name = path.substring(dir.length + 1);
			const short = path.substring(root.length + 1);
			const tests = dir_parents.map(v => short.substring(v.short.length ? v.short.length + 1 : 0));
			const is_dir = subfolders.includes(path);
			const item: IChild = {
				path,
				short,
				name,
				tests,
				is_dir,
				ignore: false,
				ignore_match: [],
				important: 0,
				important_match: [],
			};
			
			//known important
			if (dir_parent.important) item.important = 3;
			else if (_knownImportant(path, is_dir)) item.important = 1;
			
			//known ignore
			if (_knownIgnore(path, is_dir)) item.ignore = true;
			
			//rules ignore
			const ignore_match: Set<string> = new Set();
			const important_match: Set<string> = new Set();
			dir_parents.forEach(parent => {
				parent.rules.forEach(v => {
					tests.forEach(test => {
						if (!is_dir && v.dir || !v.regex.test(test)) return;
						if (v.neg) important_match.add(v.pattern);
						else ignore_match.add(v.pattern);
					});
				});
			});
			if (ignore_match.size){
				if (!item.ignore) item.ignore = true;
				item.ignore_match = [...ignore_match];
			}
			if (important_match.size){
				if (!item.important) item.important = 2;
				item.important_match = [...important_match];
			}
			
			//entries add
			entries.push(item);
			
			//kept subfolder - recurse
			if (is_dir && (item.important || !item.ignore)) await _parseDir(path, item.important, dir_parents);
		}
	};

	//parse root entries
	if (_pathExists(root) >= 2) await _parseDir(root);
	else _print(`[E] Invalid parse ignore root directory path (${root}).`, true);
	return entries;
};

(async()=>{
	const args = _processArgs();
	const input = _str(args[0], true);
	if (!input) return _print('[E] No directory path provided. (try:  "C:/Users/user/apps/react/True_Blue")', true);
	const entries = await _parseRoot(input);
	let paths: string[] = [];
	if (!!args['--ignored']) paths = entries.filter(v => v.ignore && !v.important).map(v => v.short);
	else paths = entries.filter(v => v.important || !v.ignore).map(v => v.short);
	_print(paths.join('\n'));
})()
.catch(err => _print(err, true));