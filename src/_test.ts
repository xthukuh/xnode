import { ProgTerm } from './__utils';
import { _dirname, _processArgs, _realpath, _pathinfo, _target, _copyFile, _exists, _renamePath } from './xfs';
import { Term, _basename, _filepath, _posInt, _sleep, _str, _wrapLines } from './xutils';

export const _run_test = async (): Promise<any> => {
	const args = _processArgs();
	// Term.clear();
	Term.info('>> running test...');
	//-------------------------------------------------------------------------------

	// const from_path: string = 'C:\\Users\\user\\Documents\\ABI-SUPPORT\\backup.zip';
	// const to_path: string = 'C:\\Users\\user\\Desktop\\Tests\\backup.zip';
	
	const from_path: string = 'C:\\Users\\user\\Downloads\\test\\TBRubis.apk';
	const to_path: string = 'C:\\Users\\user\\Desktop\\Tests\\TBRubis.apk';

	let path: any = from_path;
	Term.log(`>> "${path}"`);
	Term.log(`<< "${_renamePath(path)}"`);

	path = to_path;
	Term.log(`>> "${path}"`);
	Term.log(`<< "${_renamePath(path)}"`);

	// const res = await _copyFile(from_path, to_path, true);
	
	// console.log(Term.format(['info'], 'Hello world!').values().join(''));
	
	// try {
	// 	const len = 20, delay = 100;
	// 	const logger = new ProgTerm();
	// 	Term.debug(`>> Test logger with ${delay}ms...`);
	// 	for (let i = 0; i < len; i ++){
	// 		const n = i + 1;
	// 		const percent = (n/len * 100);
	// 		logger.set(percent, `Test ${n}/${len}`);
	// 		if ([25, 30].includes(n)) logger.set(undefined, undefined, 'error').error(`-- [${n}/${len}] failure`);
	// 		else logger.debug(`-- [${n}/${len}] log`);
	// 		await _sleep(delay);
	// 	}
	// }
	// catch (err) {
	// 	console.warn(err);
	// }


	// npm run dev -- --backup="C:\Users\user\Downloads\test" --to="C:\Users\user\Desktop\Tests"
	// npm run dev -- --backup="C:\Users\user\apps\react\xutils\lib" --to="C:\Users\user\apps\react\TrueBlue-MESPT\src\xutils"
	// node "C:\Users\user\apps\react\xparse-ignore\dist" -- --backup="C:\Users\user\apps\react\xutils\lib" --to="C:\Users\user\apps\react\TrueBlue-MESPT\src\xutils"
	// xparse-ignore -- --backup="C:\Users\user\apps\react\xutils\lib" --to="C:\Users\user\apps\react\TrueBlue-MESPT\src\xutils"
	
	
	//..
	// Term.success('done.', res);
};