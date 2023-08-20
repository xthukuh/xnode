import { _watcher } from '../lib/watcher';
import { parse as gitignoreParse } from 'parse-gitignore';
import { Term, _jsonStringify, _lsDir, _pathExists, _processArgs, _readSync, _regEscape, _str, _stringable } from '../lib';

(async()=>{

	//args input
	const args = _processArgs();
	const input = _str(args[0]);
	if (!input){
		Term.error('-- [E] No directory path provided.');
		Term.debug('-- Try:  "C:/Users/user/apps/react/True_Blue"');
		return;
	}
	
	//temp
	const __temp = [
		'C:/Users/user/apps/react/True_Blue/.gitignore',
		'C:/Users/user/apps/htdocs/ncmsapp/.gitignore',
		'C:/Users/user/apps/htdocs/ncmsapp/storage/app/.gitignore',
		'C:/Users/user/apps/htdocs/ncmsapp/bootstrap/cache/.gitignore',
		'',
	];

	//pattern ignore interface
	interface IPatternIgnore {
		pattern: string;
		regex: RegExp;
		neg: boolean;
		dir: boolean;
		val: string;
	};

	//fn => get pattern ignore
	const re = new RegExp(/[a-z]/ig);
	Term.success({re, _stringable: _stringable(re)});
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

	//fn => parse directory
	const KNOWN_IGNORE_DIRS: string[] = ['.git', '.github', 'node_modules', 'mobile_sdk'];
	const KNOWN_IGNORE_FILES: string[] = ['yarn.lock', 'yarn-error.log', 'package-lock.json', 'npm-debug.log'];
	const KNOWN_IMPORTANT_DIRS: string[] = [];
	const KNOWN_IMPORTANT_FILES: string[] = [
		'.gitignore',
		// '.env', '.env.example', '.env.testing',
	];

	//fn => known ignore
	const knownIgnore = (path: string, is_dir: boolean = false): boolean => {
		const parts = path.split('/');
		const name: string = parts.pop()  + '';
		if (is_dir){ //dirs
			if (KNOWN_IGNORE_DIRS.includes(name)) return true; //known dirs
			if (name === 'vendor'){
				const dir = parts.join('/');
				if (_pathExists(dir + '/composer.json')) return true; //composer vendor dir
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
	const knownImportant = (path: string, is_dir: boolean = false): boolean => {
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

	//fn => normalize path
	const _normPath = (v: string): string => _str(v, true).replace(/[\\/]/g, '/').replace(/\/$/, '');
	
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
			if (dir_parent.rules.length) Term.debug(`-- ["/${dir_parent.short}"] root_ignore.length = ${dir_parent.rules.length}`); //DEBUG:
			
			//dir list paths
			const subfolders: string[] = await _lsDir(dir, 2).then((res: string[]) => res.map(v => _normPath(v)));
			const dir_paths: string[] = await _lsDir(dir).then((res: string[]) => res.map(v => _normPath(v)));
			const dir_parents: IParent[] = [...parents, dir_parent];
			
			//parse dir paths
			for (let path of dir_paths){
				
				//path item
				const name = path.substring(dir.length + 1);
				const short = path.substring(root.length + 1);
				const tests = [name].concat(dir_parents.map(v => short.substring(v.short.length ? v.short.length + 1 : 0)));
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
				else if (knownImportant(path, is_dir)) item.important = 1;
				
				//known ignore
				if (knownIgnore(path, is_dir)) item.ignore = true;
				
				//rules ignore
				const temp_tests: any[] = [];
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
		await _parseDir(root);
		return entries;
	};
	
	//DEBUG: - parse root
	Term.info(`>> Parse root...  "${input}"`);
	const entries = await _parseRoot(input);
	let items = entries;
	
	//show table - fields
	const show_table = !!args['--table'];
	if (show_table){
		const show_fields = [
			// 'path',
			'short',
			// 'name',
			// 'tests',
			'is_dir',
			'ignore',
			// 'ignore_match',
			'important',
			// 'important_match',
		];
		items = items.map(v => Object.fromEntries(Object.entries(v).filter(e => {
			if (!show_fields.includes(e[0])) return false;
			if (e[0] === 'important' && !e[1]) e[1] = '';
			return true;
		}))) as any[];
	}
	
	//DEBUG: show filter (default kept)
	if (args['--all']){
		Term.success(`-- showing all list items (${entries.length}).`);
	}
	else if (args['--ignore']){
		items = items.filter(v => v.ignore && !v.important);
		Term.success(`-- showing ignored list items (${items.length}/${entries.length}).`);
	}
	else if (args['--important']){
		items = items.filter(v => v.important);
		Term.success(`-- showing important list items (${items.length}/${entries.length}).`);
	}
	else {
		items = items.filter(v => v.important || !v.ignore);
		Term.success(`-- showing keep list items (${items.length}/${entries.length}).`);
	}
	
	//DEBUG: show
	if (show_table) Term.table(items);
	else Term.log(items);

	//..
})()
.then(() => {
	console.log('');
	Term.success('>> done.');
});

//parse ignore directory listing
function parseIgnore(root: string): any {
	//...
}