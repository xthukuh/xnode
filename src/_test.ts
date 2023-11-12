import { _dirname, _processArgs, _realpath, _pathinfo, _target, _copyFile } from './xfs';
import { Term, _posInt, _wrapLines } from './xutils';

export const _run_test = async (): Promise<any> => {
	const args = _processArgs();
	// Term.clear();
	Term.info('>> running test...');
	//-------------------------------------------------------------------------------

	// const from_path: string = 'C:\\Users\\user\\Documents\\ABI-SUPPORT\\backup.zip';
	// const to_path: string = 'C:\\Users\\user\\Desktop\\Tests\\backup.zip';
	
	const from_path: string = 'C:\\Users\\user\\Downloads\\test\\TBRubis.apk';
	const to_path: string = 'C:\\Users\\user\\Desktop\\Tests\\TBRubis.apk';
	const res = await _copyFile(from_path, to_path, true);

	// npm run dev -- --backup="C:\Users\user\Downloads\test" --to="C:\Users\user\Desktop\Tests"
	
	
	//..
	Term.success('done.', res);
};