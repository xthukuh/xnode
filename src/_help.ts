import { _processArgs } from './xfs';
import { Term, _arrayList, _wrapLines } from 'xtutils';

/**
 * Indent SPACE
 */
const SPACE: string = '    ';
const MAX_LENGTH: number = 100;
const OPTIONS_PAD: number = 30;

// Help text lines
const _lines = (text: string, mode: 0|1 = 0): string[] => _wrapLines(text, MAX_LENGTH, false, (line, buffer) => {
	if (mode === 1) return buffer.length ? SPACE + ''.padStart(OPTIONS_PAD + 3) + line : SPACE + line;
	return SPACE + line;
});

/**
 * Help docs
 */
const HELP_DOCS: {[key: string]: string[]} = {
		
	//>> backup
	'backup': [
		'RUN BACKUP',
		..._lines('Copies backup directory contents not ignored by available .gitignore file rules to destination.'),
		..._lines('Skips unchanged source-destination files (with same sha256 hash).'),
		' ',
		'USAGE',
		..._lines('$ -- --backup="SOURCE_DIR_PATH" --to="DESTINATION_DIR_PATH" [--out="OUTPUT_JSON_PATH"]'),
		' ',
		'OPTIONS',
		..._lines('--backup="SOURCE_DIR_PATH"'.padEnd(OPTIONS_PAD)	+ '-  backup source root directory path', 1),
		..._lines('--to="DESTINATION_DIR_PATH"'.padEnd(OPTIONS_PAD)	+ '-  backup destination root directory path', 1),
		..._lines('--out="OUTPUT_JSON_PATH"'.padEnd(OPTIONS_PAD)		+ '-  (optional) output json file path to save backup copies <{[source]: destination}>', 1),
	],

	//>> default
	'default': [
		'PARSE IGNORE (default)',
		..._lines('Parses directory contents not ignored by available .gitignore file rules and prints found paths.'),
		..._lines('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed gravida consectetur orci ut viverra. Morbi elementum, felis vel iaculis mattis, ante arcu accumsan lectus, sed finibus ligula dui posuere eros. Aliquam erat volutpat. Nunc vehicula vehicula nibh, nec consequat purus sollicitudin sit amet. Morbi vulputate congue venenatis. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nam odio augue, scelerisque quis sagittis vel, egestas ac mauris. Curabitur ac libero sollicitudin, mollis nulla vel, volutpat orci. Donec sagittis vulputate ipsum, non sollicitudin urna dapibus quis. Nunc molestie semper vestibulum. Sed scelerisque ligula risus, a facilisis eros maximus eu. Suspendisse sit amet felis eu ipsum eleifend varius at a mauris. Aenean pretium eros ut est blandit aliquet. Integer gravida tincidunt justo id faucibus. Proin augue orci, placerat et risus at, vehicula hendrerit nunc.'),
		' ',
		'USAGE',
		..._lines('$ -- "PARSE_DIR_PATH" [--ignored] [--relative] [--path-separator="\\\\"]'),
		' ',
		'OPTIONS',
		..._lines('"PARSE_DIR_PATH'.padEnd(OPTIONS_PAD)					+ '-  parse root directory path. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed gravida consectetur orci ut viverra.', 1),
		..._lines('--ignored'.padEnd(OPTIONS_PAD)								+ '-  (optional) print ignored paths only', 1),
		..._lines('--relative'.padEnd(OPTIONS_PAD)							+ '-  (optional) print relative path not full. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed gravida consectetur orci ut viverra.', 1),
		..._lines('--path-separator="\\\\"'.padEnd(OPTIONS_PAD)	+ '-  (optional) print path separator "/" or "\\\\"', 1),
	],
}; 

/**
 * Print help
 */
export const _print_help = (): void => {
	const args = _processArgs();
	
	//fn => helper > print docs
	const _print_docs = (key: string): void => {
		Term.br();
		for (const line of _arrayList(HELP_DOCS[key])) Term.info(line);
		Term.br();
	};

	//>> backup
	if (args.hasOwnProperty('--backup')) return _print_docs('backup');
	
	//>> default
	_print_docs('default');
	Term.debug('Type --help with options [--backup] for more possible commands help docs.');
}