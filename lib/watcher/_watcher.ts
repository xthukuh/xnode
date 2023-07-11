import { Term, _int, _str } from 'xutils';
import { _lsDir, _pathExists, _processArgs, _processCwd, _readSync } from '../node';
import { parse as gitignoreParse } from 'parse-gitignore';
import { glob } from 'glob';

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

	//root - listing
	Term.debug('-- dir listing...');
	const recursive = false;
	const _getList = async (mode:1|2): Promise<string[]> => _lsDir(root, mode, recursive).then(arr => arr.map(_normPath));
	const _list_subfolders = await _getList(2);
	const _list_files = await _getList(1);
	const _list = [..._list_subfolders, ..._list_files];

	//list items
	const root_len = root.length;
	const items = _list.map(v => v.substring(root_len));
	
	//list dump
	console.log('');
	Term.log({items});
	Term.debug(`-- Found ${items.length} items.`);

	//list gitignore
	const gitignore_file:string|any = _list.find(v => /\/\.gitignore$/.test(v));
	if (gitignore_file){
		const gitignore_short = gitignore_file.substring(root_len);
		const gitignore_data = _readSync(gitignore_file) as Buffer;
		const gitignore_list = gitignoreParse(gitignore_data).patterns;
		
		//glob
		Term.info('-- gitignore glob listing...');
		const _glob_list = await glob(`${root}/**`, {
			ignore: gitignore_list,
			maxDepth: 1,
		});
		const glob_list = _glob_list.map(v => _normPath(v).substring(root_len)); 
		console.log('');
		Term.success({gitignore_short, glob_list, ignore: gitignoreParse(gitignore_data)});
		Term.info(`-- glob_list ${glob_list.length} items`);
		console.log('');
	}

	//..
	return true;
};