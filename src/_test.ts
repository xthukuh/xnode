import { _processArgs } from './xfs';
import { Term, _date, _datetime, _elapsed, _time } from './xutils';

export const _run_test = async (): Promise<any> => {
	const args = _processArgs();
	Term.info('>> running test...');
	Term.br();
	//-------------------------------------------------------------------------------
	//..

	//_date, _time, _elapsed 
	// class TempCls1 {
	// 	value: string = 'Hello Test';
	// 	constructor(){
	// 	}
	// }
	// class TempCls2 {
	// 	toString(){
	// 		return 'Wed Jan 01 2020 23:10:00 GMT+0300 (East Africa Time)';
	// 	}
	// }
	// const tests: {[key: string]: any} = {
	// 	"0": 0,
	// 	"null": null,
	// 	"undefined": undefined,
	// 	"' '": ' ',
	// 	"''": '',
	// 	"'2020-02-28 00:00:00'": '2020-02-28 00:00:00',
	// 	"'2021-02-28 00:00:00'": '2021-02-28 00:00:00',
	// 	"1577909400000": 1577909400000,
	// 	"'1577909400000'": '1577909400000',
	// 	"'Wed Jan 01 2020'": 'Wed Jan 01 2020',
	// 	"true": true,
	// 	"false": false,
	// 	"[]": [],
	// 	"{}": {},
	// 	"[1, 2, 3]": [1, 2, 3],
	// 	"new Date()": new Date(),
	// 	"new Date('')": new Date(''),
	// 	"new TempCls1()": new TempCls1(),
	// 	"new TempCls2()": new TempCls2(),
	// };
	// for (const [key, val] of Object.entries(tests)){
	// 	const date = _date(val);
	// 	const time = _time(val);
	// 	const datetime = _datetime(val);
	// 	Term.log(`[${key}]`, {date, time, datetime});
	// };
	// Term.br();
	let a: any, b: any;
	a = '2023-11-19 00:37:50';
	b = '1991-10-01 20:00:00';
	console.log({
		years: 32,
		months: 1,
		time: 1014007070000,
		days_total: 11736,
		days: 17,
		hours: 4,
		minutes: 37,
		seconds: 50,
		ms: 0,
		ms_total: 481800000
	});
	Term.debug(`_elapsed start=(${a}) end=(${b})`, _elapsed(a, b));
	Term.br();
	Term.br();
	a = '2020-02-28 18:45:10';
	b = '2022-02-28 06:10:00';
	console.log({
		years: 1,
		months: 11,
		time: 63113090000,
		days_total: 730,
		days: 30,
		hours: 11,
		minutes: 24,
		seconds: 50,
		ms: 0,
		ms_total: 1039800000
	});
	Term.debug(`_elapsed start=(${a}) end=(${b})`, _elapsed(a, b));

	Term.br();
	Term.br();
	a = '2020-10-20 18:45:10';
	b = '2020-02-05 06:10:00';
	console.log({
		years: 0,
		months: 8,
		time: 22336510000,
		days_total: 258,
		days: 15,
		hours: 12,
		minutes: 35,
		seconds: 10,
		ms: 0,
		ms_total: 1163400000
	});
	Term.debug(`_elapsed start=(${a}) end=(${b})`, _elapsed(a, b));
	
	//...
	Term.br();
	Term.success('done.');
};