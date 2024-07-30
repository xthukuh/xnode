import { Term, _asyncAll, _asyncQueue, _jsonStringify, _rand, _round, _sleep, _str } from 'xtutils';
import { _processArgs } from './xfs';
import { _parseIgnore } from './_parse_ignore';
import { _print } from './__utils';
import { _run_backup } from './_backup';
import { _print_help } from './_help';
import { _run_test } from './_test';

(async()=>{
	const args = _processArgs();
	
	//>> help ~ return _print(HELP_DOCS);
	if (args.hasOwnProperty('--help')) return _print_help();

	//>> help ~ return _print(HELP_DOCS);
	if (args.hasOwnProperty('--test')) return _run_test();

	//>> backup > --backup="SOURCE_DIR_PATH" --to="DESTINATION_DIR_PATH" [--out="OUTPUT_JSON_PATH"]
	if (args.hasOwnProperty('--backup')) return _run_backup();
	
	//>> default ~ parse ignore > "PARSE_DIR_PATH" [--ignored] [--relative] [--path-separator="\\"]
	const paths: string[] = await _parseIgnore(args[0] as any, !!args['--ignored'], !!args['--relative'], args['--path-separator'] as any);
	_print(paths.join('\n'));
})()
.catch(err => _print(err, true));