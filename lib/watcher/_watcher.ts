import { Term, _asyncValues, _int, _str } from 'xutils';
import { _lsDir, _pathExists, _processArgs, _processCwd, _readSync } from '../node';
import { parse as gitignoreParse } from 'parse-gitignore';
// const { glob, sync, hasMagic } = require('glob-gitignore');
// const micromatch = require('micromatch');
// import { glob } from 'glob';

// {
// 	micromatch: <ref *1> [Function: micromatch] {
// 		match: [Circular *1],
// 		matcher: [Function (anonymous)],
// 		isMatch: [Function (anonymous)],
// 		any: [Function (anonymous)],
// 		not: [Function (anonymous)],
// 		contains: [Function (anonymous)],
// 		matchKeys: [Function (anonymous)],
// 		some: [Function (anonymous)],
// 		every: [Function (anonymous)],
// 		all: [Function (anonymous)],
// 		capture: [Function (anonymous)],
// 		makeRe: [Function (anonymous)],
// 		scan: [Function (anonymous)],
// 		parse: [Function (anonymous)],
// 		braces: [Function (anonymous)],
// 		braceExpand: [Function (anonymous)]
// 	}
// }

//watcher config
const WatcherConfig = {
	changes: {
		registry: [],
		paths: [],
	},
	cleanup: {
		registry: [],
		paths: [],
	},
	backups: [
		{
			target: '',
			backup: '',
			ignore: [],
		},
	],
};


//normalize path
const _normPath = (path: any): string => _str(path, true).replace(/\\/g, '/');

//list dir items
const _lsDirNorm = async (dir: string, mode:0|1|2 = 0, recursive: boolean = false): Promise<string[]> => _lsDir(dir, mode, recursive).then(arr => arr.map(_normPath));

//watcher command
//npm run dev -- watcher "C:\Users\user\apps\htdocs\ncmsapp"
export const _watcher = async(): Promise<any> => {
	
	//process args
	const args = _processArgs();
	
	//args option[0]: watcher command
	const cmd = _str(args['0'], true).toLowerCase();
	if (cmd !== 'watcher') return;

	//args option[1]: root directory
	const root = _normPath(args['1']);

	//title
	Term.info(`>> watcher: "${root}"`.trim());

	//root - validate
	if (_pathExists(root) !== 2){
		const err = `The argument path directory "${root}" does not exist. Ensure first command argument is an existing directory path.`;
		Term.warn(`-- [E] ${err}`);
		return;
	}

	//interface - dir ignores
	interface IDirIgnores {
		dir: string;
		base: string;
		patterns: string[];
		parent?: IDirIgnores;
		match: (path: string)=>boolean;
	}

	let test_debug: boolean = false;

	//fn => dir ignores
	const _dirIgnores = (dir: string, parent?: IDirIgnores, _patterns?: string[]): IDirIgnores => {
		
		//dir gitignore
		const dir_gitignore = `${dir}/.gitignore`;
		const dir_gitignore_patterns: string[] = [];
		if (_pathExists(dir_gitignore) === 1) dir_gitignore_patterns.push(...gitignoreParse(_readSync<Buffer>(dir_gitignore, false)).patterns);
		const patterns: string[] = [...new Set([
			...(_patterns && Array.isArray(_patterns) ? _patterns.filter(v => 'string' === typeof v) : []),
			...dir_gitignore_patterns,
		])]
		.map(v => _str(v, true)).filter(v => v);

		//fn => is ignored (-1 = kept | 0 = false | 1 = true)
		const _ignored = (test_path: string, parent_dir: string, parent_patterns: string[]): -1|0|1 => {
			if (!patterns.length) return 0;
			const rel_path = _str(test_path.substring(parent_dir.length + 1), true);
			if (!rel_path) return 0;
			let kept: boolean = false;

			//fn => ignored tests
			const _tests = (test_subject: string, test_patterns: string[]): boolean => {
				if (!test_patterns.length) return false;
				const test_keep = test_patterns.filter(v => /^!/.test(v));
				if (test_keep.length && !!test_keep.find(pattern => {
					let pattern_regex = convertGitIgnoreToRegex(pattern);
					if (/^\//.test(test_subject)) pattern_regex += '/?$';
					const matched = new RegExp(pattern_regex).test(test_subject);
					// Term.debug(`--- keep_pattern_regex: "${test_path}" - "${test_subject}" << "${pattern}" => ${pattern_regex} - ${matched}`, JSON.stringify(pattern_regex));
					return matched;
				})){
					kept = true;
					return true;
				}
				const test_ignore = test_patterns.filter(v => !/^!/.test(v));
				if (test_ignore.length && !!test_ignore.find(pattern => {
					let pattern_regex = convertGitIgnoreToRegex(pattern);
					if (/^\//.test(test_subject)) pattern_regex += '/?$';
					const matched = new RegExp(pattern_regex).test(test_subject);
					// Term.debug(`--- pattern_regex: "${test_path}" - "${test_subject}" << "${pattern}" => ${pattern_regex} - ${matched}`, JSON.stringify(pattern_regex));
					return matched;
				})) return true;
				return false;
			};

			//match relative
			const rel_patterns = parent_patterns.filter(v => /^\//.test(v));
			if (rel_patterns.length && _tests(`/${rel_path}`, rel_patterns)) return kept ? -1 : 1;
			// if (rel_patterns.length){
			// 	const t_res = _tests(`/${rel_path}`, rel_patterns);
			// 	if (t_res){
			// 		Term.debug(`-- [${t_res}] rel_patterns === 1`);
			// 		return kept ? -1 : 1;
			// 	}
			// }
			
			//match all
			const all_patterns = parent_patterns.filter(v => !/^\//.test(v));
			if (all_patterns.length && _tests(rel_path, all_patterns)) return kept ? -1 : 1;
			// if (all_patterns.length && _tests(rel_path, all_patterns)){
			// 	Term.debug(`-- all_patterns === 1`);
			// 	return kept ? -1 : 1;
			// }
			
			//unmatched
			return 0;
		};

		//fn => test parent ignored
		const _parentIgnored = (test_path: string, test_parent: IDirIgnores): -1|0|1 => {
			let num: -1|0|1 = 0;
			const basename = test_path.split('/').map(v => v.trim()).filter(v => v).slice(-1).join('').toLowerCase().trim();
			if (basename === '.gitignore') return -1;
			if (basename === '.git') return 1;
			if (test_parent.patterns.length){
				if (num = _ignored(test_path, test_parent.dir, test_parent.patterns)) return num;
				if (/\/$/.test(test_path) && (num = _ignored(test_path.split('/').slice(0, -1).join('/').trim(), test_parent.dir, test_parent.patterns))) return num;
				return num;
			}
			if (test_parent.parent && (num = _parentIgnored(test_path, test_parent.parent))) return num;
			return 0;
		};

		//result - IDirIgnores
		return {
			dir,
			base: parent ? parent.base : dir,
			patterns,
			parent,
			match: function(path: string): boolean {
				return _parentIgnored(path, this) > 0;
				// const res = _parentIgnored(path, this);
				// Term.debug(`-- ignored: "${path}" === ${res}`);
				// return res > 0;
			},
		};
	};

	//dir - listing
	const _dirPaths = async (dir: string, _patterns?: string[], _depth?: number, _parent?: IDirIgnores): Promise<string[]> => {
		const dir_subfolders = await _lsDirNorm(dir, 2);
		const dir_files = await _lsDirNorm(dir, 1);
		// test_debug = dir.indexOf('android') > -1;
		const dir_ignores = _dirIgnores(dir, _parent, _patterns);
		const kept_subfolders = dir_subfolders.filter(v => !dir_ignores.match(`${v}/`));
		// if (test_debug) console.log(`--_dirPaths: "${dir}"`, {dir_subfolders, kept_subfolders});
		const kept_files = dir_files.filter(v => !dir_ignores.match(v));
		const depth = !isNaN(_depth = _int(_depth, 0)) && _depth >= 0 ? _depth : 0;
		const paths: string[] = [];
		if (kept_subfolders.length){
			const d = depth - 1;
			await _asyncValues<string>(kept_subfolders).each(async subfolder => {
				paths.push(subfolder);
				if (d > 0){
					const res_paths = await _dirPaths(subfolder, [], d, dir_ignores);
					paths.push(...res_paths);
				}
			});
		}
		if (kept_files.length) paths.push(...kept_files);
		
		//DEBUG:
		const dir_paths = [...dir_subfolders, ...dir_files];
		// Term.debug(`-- dir paths: ${paths.length}/${dir_paths.length}`);
		dir_paths.forEach(v => {
			const s = v.substring((_parent ? _parent.base : dir).length);
			if (paths.includes(v)) Term.log(s);
			else Term.debug(s);
		});

		//result
		return paths;
	};

	//root - listing
	const ignore_patterns: string[] = [];
	console.log('');
	const paths = await _dirPaths(root, ignore_patterns, _int(args['-d'], 0));
	// Term.table(paths);
	// Term.debug(`-- count = ${paths.length}`);
	return true;
};

//fn => gitignore to regex
function convertGitIgnoreToRegex(pattern: string, test?: any): string {
	
	// Escape special regex characters
	const escapedPattern = pattern.replace(/[.*+?^${}()|\[\]\\]/g, '\\$&');

	// Convert the match pattern to a regex pattern
	const regexPattern = escapedPattern
	.replace(/^\\\*\\\*\/\\\*$/g, '(.+/)?') // Handle the special pattern '**/*'
	.replace(/^\\\*\\\*\/(.+)/g, '(?:.+/)?$1') // Handle '**/' prefix
	.replace(/\\\*/g, '[^/]*') // Handle '*' wildcard
	.replace(/\\\?/g, '.') // Handle '?' wildcard
	.replace(/^!/g, '^'); // Handle '!'' negate
	return regexPattern;
}