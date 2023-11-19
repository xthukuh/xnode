import { _processArgs } from './xfs';
import { Term, _date, _datetime, _elapsed, _sleep, _time } from './xutils';

export const _run_test = async (): Promise<any> => {
	const args = _processArgs();
	Term.info('>> running test...');
	Term.br();
	//-------------------------------------------------------------------------------
	// 2 ++ 2
	// 3 ++ 2
	// 0, 2 ++ 1
	// 1, 3 ++ 2
	// 2, 0 ++ 2
		
	let a: any, b: any, t: any, v: any, r: any;

	a = '2020-02-18 18:45:10';
	b = '2021-02-18 06:10:00';
	t = '11 months, 30 days, 11 hours, 24 minutes, 50 seconds ~ 365 days';
	r = _elapsed(a, b);
	v = `${r.months} months, ${r.days} days, ${r.hours} hours, ${r.minutes} minutes, ${r.seconds} seconds ~ ${r.days_total} days`;
	Term.debug([a, b, t, v, t === v]);

	a = '2020-02-18 06:10:00';
	b = '2021-02-18 18:45:10';
	t = '1 year, 12 hours, 35 minutes, 10 seconds ~ 366 days';
	r = _elapsed(a, b);
	v = `${r.years} year, ${r.hours} hours, ${r.minutes} minutes, ${r.seconds} seconds ~ ${r.days_total} days`;
	Term.debug([a, b, t, v, t === v]);

	a = '2020-02-18 00:00:00';
	b = '2021-02-18 00:00:00';
	t = '1 year';
	r = _elapsed(a, b);
	v = `${r.years} year`;
	Term.debug([a, b, t, v, t === v]);

	a = '2020-02-18 00:00:00';
	b = '2021-02-18 23:59:59';
	t = '1 year, 23 hours, 59 minutes, 59 seconds ~ 366 days';
	r = _elapsed(a, b);
	v = `${r.years} year, ${r.hours} hours, ${r.minutes} minutes, ${r.seconds} seconds ~ ${r.days_total} days`;
	Term.debug([a, b, t, v, t === v]);
	
	a = '2019-02-01 18:45:10';
	b = '2020-03-01 06:10:00';
	t = '1 year, 27 days, 11 hours, 24 minutes, 50 seconds ~ 393 days';
	r = _elapsed(a, b);
	v = `${r.years} year, ${r.days} days, ${r.hours} hours, ${r.minutes} minutes, ${r.seconds} seconds ~ ${r.days_total} days`;
	Term.debug([a, b, t, v, t === v]);
	
	a = '2021-02-01 18:45:10';
	b = '2021-03-01 06:10:00';
	t = '27 days, 11 hours, 24 minutes, 50 seconds';
	r = _elapsed(a, b);
	v = `${r.days} days, ${r.hours} hours, ${r.minutes} minutes, ${r.seconds} seconds`;
	Term.debug([a, b, t, v, t === v]);

	a = '2019-02-01 18:45:10';
	b = '2021-02-01 06:10:00';
	t = '1 year, 11 months, 30 days, 11 hours, 24 minutes, 50 seconds ~ 730 days';
	r = _elapsed(a, b);
	v = `${r.years} year, ${r.months} months, ${r.days} days, ${r.hours} hours, ${r.minutes} minutes, ${r.seconds} seconds ~ ${r.days_total} days`;
	Term.debug([a, b, t, v, t === v]);
	
	a = '2020-02-01 18:45:10';
	b = '2020-03-01 06:10:00';
	t = '28 days, 11 hours, 24 minutes, 50 seconds';
	r = _elapsed(a, b);
	v = `${r.days} days, ${r.hours} hours, ${r.minutes} minutes, ${r.seconds} seconds`;
	Term.debug([a, b, t, v, t === v]);
	
	a = '1991-10-01 20:00:00';
	b = '2023-11-19 20:23:00';
	t = '32 years, 1 month, 18 days, 0 hours, 23 minutes, 0 seconds ~ 11737 days';
	r = _elapsed(a, b);
	v = `${r.years} years, ${r.months} month, ${r.days} days, ${r.hours} hours, ${r.minutes} minutes, ${r.seconds} seconds ~ ${r.days_total} days`;
	Term.debug([a, b, t, v, t === v]);

	a = '1992-10-01 20:00:00';
	b = '2023-11-19 20:23:00';
	t = '31 years, 1 month, 18 days, 0 hours, 23 minutes, 0 seconds ~ 11371 days';
	r = _elapsed(a, b);
	v = `${r.years} years, ${r.months} month, ${r.days} days, ${r.hours} hours, ${r.minutes} minutes, ${r.seconds} seconds ~ ${r.days_total} days`;
	Term.debug([a, b, t, v, t === v]);

	a = '1993-10-01 20:00:00';
	b = '2023-11-19 20:23:00';
	t = '30 years, 1 month, 18 days, 0 hours, 23 minutes, 0 seconds ~ 11006 days';
	r = _elapsed(a, b);
	v = `${r.years} years, ${r.months} month, ${r.days} days, ${r.hours} hours, ${r.minutes} minutes, ${r.seconds} seconds ~ ${r.days_total} days`;
	Term.debug([a, b, t, v, t === v]);

	a = '1994-10-01 20:00:00';
	b = '2023-11-19 20:23:00';
	t = '29 years, 1 month, 18 days, 0 hours, 23 minutes, 0 seconds ~ 10641 days';
	r = _elapsed(a, b);
	v = `${r.years} years, ${r.months} month, ${r.days} days, ${r.hours} hours, ${r.minutes} minutes, ${r.seconds} seconds ~ ${r.days_total} days`;
	Term.debug([a, b, t, v, t === v]);

	a = '1995-10-01 20:00:00';
	b = '2023-11-19 20:23:00';
	t = '28 years, 1 month, 18 days, 0 hours, 23 minutes, 0 seconds ~ 10276 days';
	r = _elapsed(a, b);
	v = `${r.years} years, ${r.months} month, ${r.days} days, ${r.hours} hours, ${r.minutes} minutes, ${r.seconds} seconds ~ ${r.days_total} days`;
	Term.debug([a, b, t, v, t === v]);

	a = '1996-10-01 20:00:00';
	b = '2023-11-19 20:23:00';
	t = '27 years, 1 month, 18 days, 0 hours, 23 minutes, 0 seconds ~ 9910 days';
	r = _elapsed(a, b);
	v = `${r.years} years, ${r.months} month, ${r.days} days, ${r.hours} hours, ${r.minutes} minutes, ${r.seconds} seconds ~ ${r.days_total} days`;
	Term.debug([a, b, t, v, t === v]);

	a = '1996-10-01 20:00:00';
	b = '2022-11-19 20:23:00';
	t = '26 years, 1 month, 18 days, 0 hours, 23 minutes, 0 seconds ~ 9545 days';
	r = _elapsed(a, b);
	v = `${r.years} years, ${r.months} month, ${r.days} days, ${r.hours} hours, ${r.minutes} minutes, ${r.seconds} seconds ~ ${r.days_total} days`;
	Term.debug([a, b, t, v, t === v]);

	a = Date.now();
	await _sleep(2000);
	b = Date.now();
	// t = '26 years, 1 month, 18 days, 0 hours, 23 minutes, 0 seconds ~ 9545 days';
	r = _elapsed(a, b);
	v = `${r.years} years, ${r.months} month, ${r.days} days, ${r.hours} hours, ${r.minutes} minutes, ${r.seconds} seconds ~ ${r.days_total} days`;
	Term.debug([a, b, v]);
	
	
	//-------------------------------------------------------------------------------
	Term.br();
	Term.success('done.');
};