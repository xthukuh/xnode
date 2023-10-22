import { _processArgs } from './xfs';
import { _parseIgnore } from './_parse_ignore';
import { _print } from './_utils';
import { Term, _asyncAll, _asyncQueue, _jsonStringify, _rand, _round, _sleep, _str } from './xutils';
import { _backupCopy } from './_backup';

//help docs
const HELP_DOCS: string = `
xparse-ignore
Parse directory obeying gitignore rules (with extras).

USAGE:
  $ [COMMAND] [--] [ROOT-DIRECTORY] [--ignored] [--relative] [--path-separator="\\\\"]

COMMAND:
  $ npm run dev [OPTIONS]
  $ node ./dist/index.js [OPTIONS]

OUTPUT:
  (default) prints out paths not ignored separated by line feed ("\\n")

OPTIONS:
  [--]                (optional) allows you to pass option arguments to the script
  [ROOT-DIRECTORY]    (required) parse root/source directory (e.g. "C:\\Users\\User\\Example")
  [--help]            (optional) prints out help docs
  [--ignored]         (optional) prints out ignored paths
  [--relative]        (optional) prints paths relative to root directory 
  [--path-separator]  (optional) path separator character "/" or "\\" (default auto)
  [--backup]          (optional) copy backup directory path (destination)
`;

(async()=>{
	const args = _processArgs();
	
	//-- root directory
	const root: any = args[0];

	//-- help
	const help: boolean = !!args['--help'];
	if (help) return _print(HELP_DOCS);

	//-- backup
	if (args.hasOwnProperty('--backup')){
		const dest: string = _str(args['--backup'], true);
		const res = await _backupCopy(root, dest);
		_print(_jsonStringify(res, 2));
		return;
	}
	
	//-- parse ignore
	const ignored: boolean = !!args['--ignored'];
	const relative: boolean = !!args['--relative'];
	const path_separator: any = args['--path-separator'];
	const paths: string[] = await _parseIgnore(root, ignored, relative, path_separator);
	_print(paths.join('\n'));
})()
.catch(err => _print(err, true));