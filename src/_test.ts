import { _processArgs } from './xfs';
import { Term, _date, _datetime, _duration, _elapsed, _sleep, _time } from 'xtutils';

export const _run_test = async (): Promise<any> => {
	const args = _processArgs();
	Term.info('>> running test...');
	Term.br();
	//-------------------------------------------------------------------------------
	let val: any = 14083585.764705881;
	Term.debug({val, strict: _time(val, undefined, undefined, true), lax: _time(val, undefined, undefined, false)});
	//--backup="C:\a\b" --to="D:\backup\a\b"

	//-------------------------------------------------------------------------------
	Term.br();
	Term.success('done.');
};