import { _processArgs } from './xfs';
import { Term } from './xutils';

export const _run_test = async (): Promise<any> => {
	const args = _processArgs();
	Term.info('>> running test...');
	//-------------------------------------------------------------------------------
	//..
	Term.success('done.');
};