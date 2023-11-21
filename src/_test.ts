import { _processArgs } from './xfs';
import { Term, _date, _datetime, _duration, _elapsed, _sleep, _time } from './xutils';

export const _run_test = async (): Promise<any> => {
	const args = _processArgs();
	Term.info('>> running test...');
	Term.br();
	//-------------------------------------------------------------------------------
	
	Term.info('>> testing _date(), _time(), _datetime()...')
	class TempCls1 {
		value: string = 'Hello Test';
		constructor(){
		}
	}
	class TempCls2 {
		toString(){
			return 'Wed Jan 01 2020 23:10:00 GMT+0300 (East Africa Time)';
		}
	}
	const tests: {[key: string]: any} = {
		"0": 0,
		"null": null,
		"undefined": undefined,
		"' '": ' ',
		"''": '',
		"'2020-02-28 00:00:00'": '2020-02-28 00:00:00',
		"'2021-02-28 00:00:00'": '2021-02-28 00:00:00',
		"1577909400000": 1577909400000,
		"'1577909400000'": '1577909400000',
		"'Wed Jan 01 2020'": 'Wed Jan 01 2020',
		"true": true,
		"false": false,
		"[]": [],
		"{}": {},
		"[1, 2, 3]": [1, 2, 3],
		"new Date()": new Date(),
		"new Date('')": new Date(''),
		"new TempCls1()": new TempCls1(),
		"new TempCls2()": new TempCls2(),
	};
	for (const [key, val] of Object.entries(tests)){
		const date = _date(val);
		const date_lax = _date(val, false);
		const time = _time(val);
		const time_lax = _time(val, undefined, undefined, false);
		const datetime = _datetime(val);
		const datetime_strict = _datetime(val, true);
		Term.log({test: key, date, date_lax, time, time_lax, datetime, datetime_strict});
	};

	Term.br();
	Term.br();
	Term.info('>> Testing _elapsed(), _duration()...');
	let a: any, b: any, t: any, v: any, r: any, tmp: any;
	a = '2020-02-18 18:45:10';
	b = '2021-02-18 06:10:00';
	t = '11 months, 30 days, 11 hours, 24 minutes and 50 seconds';
	r = _elapsed(a, b);
	Term.debug([a, b, t, r.toString(1), r.toString(), r.toString(1) === t, '<< duration: ' + _duration(a, b).toString()]);

	a = '2020-02-18 06:10:00';
	b = '2021-02-18 18:45:10';
	t = '1 year, 12 hours, 35 minutes and 10 seconds';
	r = _elapsed(a, b);
	Term.debug([a, b, t, r.toString(1), r.toString(), r.toString(1) === t]);

	a = '2020-02-18 00:00:00';
	b = '2021-02-18 00:00:00';
	t = '1 year';
	r = _elapsed(a, b);
	Term.debug([a, b, t, r.toString(1), r.toString(), r.toString(1) === t]);

	a = '2020-02-18 00:00:00';
	b = '2021-02-18 23:59:59';
	t = '1 year, 23 hours, 59 minutes and 59 seconds';
	r = _elapsed(a, b);
	Term.debug([a, b, t, r.toString(1), r.toString(), r.toString(1) === t]);
	
	a = '2019-02-01 18:45:10';
	b = '2020-03-01 06:10:00';
	t = '1 year, 27 days, 11 hours, 24 minutes and 50 seconds';
	r = _elapsed(a, b);
	Term.debug([a, b, t, r.toString(1), r.toString(), r.toString(1) === t]);
	
	a = '2021-02-01 18:45:10';
	b = '2021-03-01 06:10:00';
	t = '27 days, 11 hours, 24 minutes and 50 seconds';
	r = _elapsed(a, b);
	Term.debug([a, b, t, r.toString(1), r.toString(), r.toString(1) === t]);

	a = '2019-02-01 18:45:10';
	b = '2021-02-01 06:10:00';
	t = '1 year, 11 months, 30 days, 11 hours, 24 minutes and 50 seconds';
	r = _elapsed(a, b);
	Term.debug([a, b, t, r.toString(1), r.toString(), r.toString(1) === t]);
	
	a = '2020-02-01 18:45:10';
	b = '2020-03-01 06:10:00';
	t = '28 days, 11 hours, 24 minutes and 50 seconds';
	r = _elapsed(a, b);
	Term.debug([a, b, t, r.toString(1), r.toString(), r.toString(1) === t]);
	
	a = '1991-10-01 20:00:00';
	b = '2023-11-19 20:23:00';
	t = '32 years, 1 month, 18 days and 23 minutes';
	r = _elapsed(a, b);
	Term.debug([a, b, t, r.toString(1), r.toString(), r.toString(1) === t]);

	a = '1992-10-01 20:00:00';
	b = '2023-11-19 20:23:00';
	t = '31 years, 1 month, 18 days and 23 minutes';
	r = _elapsed(a, b);
	Term.debug([a, b, t, r.toString(1), r.toString(), r.toString(1) === t]);

	a = '1993-10-01 20:00:00';
	b = '2023-11-19 20:23:00';
	t = '30 years, 1 month, 18 days and 23 minutes';
	r = _elapsed(a, b);
	Term.debug([a, b, t, r.toString(1), r.toString(), r.toString(1) === t]);

	a = '1994-10-01 20:00:00';
	b = '2023-11-19 20:23:00';
	t = '29 years, 1 month, 18 days and 23 minutes';
	r = _elapsed(a, b);
	Term.debug([a, b, t, r.toString(1), r.toString(), r.toString(1) === t]);

	a = '1995-10-01 20:00:00';
	b = '2023-11-19 20:23:00';
	t = '28 years, 1 month, 18 days and 23 minutes';
	r = _elapsed(a, b);
	Term.debug([a, b, t, r.toString(1), r.toString(), r.toString(1) === t]);

	a = '1996-10-01 20:00:00';
	b = '2023-11-19 20:23:00';
	t = '27 years, 1 month, 18 days and 23 minutes';
	r = _elapsed(a, b);
	Term.debug([a, b, t, r.toString(1), r.toString(), r.toString(1) === t]);

	a = '1996-10-01 20:00:00';
	b = '2022-11-19 20:23:00';
	t = '26 years, 1 month, 18 days and 23 minutes';
	r = _elapsed(a, b);
	Term.debug([a, b, t, r.toString(1), r.toString(), r.toString(1) === t]);
	
	
	//-------------------------------------------------------------------------------
	Term.br();
	Term.br();
	Term.success('done.');
};