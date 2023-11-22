//===================================================================================
// simple date helpers - consider useful libraries: https://momentjs.com/ 
//===================================================================================

/**
 * Validate `Date` instance
 * 
 * @param value
 * @returns `boolean`
 */
export const _isDate = (value: any): boolean => value instanceof Date && !isNaN(value.getTime());

/**
 * Parse `Date` value ~ accepts valid `Date` instance, timestamp integer, datetime string (see `_strict` param docs)
 * - supports valid `Date` instance, `integer|string` timestamp in milliseconds and other `string` date texts
 * - when strict parsing, value must be a valid date value with more than `1` timestamp milliseconds
 * - when strict parsing is disabled, result for `undefined` = `new Date()` and `null|false|true|0` = `new Date(null|false|true|0)`
 * 
 * @param value - parse datetime value
 * @param _strict - enable strict parsing (default: `true`)
 * @returns `Date` instance | `undefined` when invalid
 */
export const _date = (value: any, _strict: boolean = true): Date|undefined => {
	if (value === undefined) return _strict ? undefined : new Date();
	const _parse = (val: any): Date|undefined => !isNaN(val) && (val > 1 || !_strict) ? new Date(val) : undefined;
	if ([null, false, true, 0].includes(value)) return _parse(value);
	if (value instanceof Date) return _parse(value.getTime());
	if ('number' === typeof value) return _parse(new Date(value).getTime());
	try {
		let text: string = String(value).trim();
		if (!text || /\[object \w+\]/.test(text)) return undefined;
		if (/^[+-]?\d+$/.test(text)) return _parse(parseInt(text));
		return _parse(Date.parse(text));
	}
	catch (e){
		console.warn('[_date] exception:', e);
		return undefined;
	}
};

/**
 * Parsed `Date` timestamp value (i.e. `date.getTime()`)
 * - see `_date()` parsing docs
 * 
 * @param value - parse datetime value
 * @param min - set `min` timestamp limit ~ enabled when `min` is a valid timestamp integer
 * @param max - set `max` timestamp limit ~ enabled when `max` is a valid timestamp integer
 * @param _strict - enable strict parsing (default: `true`)
 * @returns `number` timestamp in milliseconds | `undefined` when invalid
 */
export const _time = (value: any, min?: number, max?: number, _strict: boolean = true): number|undefined => {
	const date: Date|undefined = _date(value, _strict);
	if (!date) return undefined;
	const time: number = date.getTime();
	if (!isNaN(min = parseFloat(min as any)) && time < min) return undefined;
	if (!isNaN(max = parseFloat(max as any)) && time > max) return undefined;
	return time;
};

/**
 * Day names
 * - `('Sunday'|'Monday'|'Tuesday'|'Wednesday'|'Thursday'|'Friday'|'Saturday')[]`
 */
export const DAY_NAMES: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Get day name
 * 
 * @param index - (default: `0`) day index `0-6` ~ `DAY_NAMES[Math.abs(index % DAY_NAMES.length)]`
 * @returns `string` ~ `'Sunday'|'Monday'|'Tuesday'|'Wednesday'|'Thursday'|'Friday'|'Saturday'`
 */
export const _dayName = (index: any): string => {
	index = !isNaN(index = parseInt(index)) ? index : 0;
	return DAY_NAMES[Math.abs(index % DAY_NAMES.length)];
};

/**
 * Month names
 * - `('January'|'February'|'March'|'April'|'May'|'June'|'July'|'August'|'September'|'October'|'November'|'December')[]`
 */
export const MONTH_NAMES: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * Get month name
 * 
 * @param index - (default: `0`) day index `0-11` ~ `MONTH_NAMES[Math.abs(index % DAY_NAMES.length)]`
 * @returns `string` ~ `'January'|'February'|'March'|'April'|'May'|'June'|'July'|'August'|'September'|'October'|'November'|'December'`
 */
export const _monthName = (index: any): string => {
	index = !isNaN(index = parseInt(index)) ? index : 0;
	return MONTH_NAMES[Math.abs(index % MONTH_NAMES.length)];
};

/**
 * Parse `Date` day start ~ at `00:00:00 0`
 * - see `_date()` parsing docs
 * 
 * @param value - parse datetime value
 * @param _strict - enable strict datetime parsing (default: `false`)
 * @returns `Date`
 */
export const _dayStart = (value?: any, _strict: boolean = false): Date => {
	const date: Date = _date(value, _strict) ?? new Date();
	return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
};

/**
 * Parse `Date` day end ~ at `23:59:59 999`
 * - see `_date()` parsing docs
 * 
 * @param value - parse datetime value
 * @param _strict - enable strict datetime parsing (default: `false`)
 * @returns `Date`
 */
export const _dayEnd = (value?: any, _strict: boolean = false): Date => {
	const date: Date = _date(value, _strict) ?? new Date();
	return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
};

/**
 * Parse `Date` month's start day ~ at `00:00:00 0`
 * - see `_date()` parsing docs
 * 
 * @param value - parse datetime value
 * @param _strict - enable strict datetime parsing (default: `false`) ~ see `_date()`
 * @returns `Date`
 */
export const _monthStart = (value?: any, _strict: boolean = false): Date => {
	const date: Date = _date(value, _strict) ?? new Date();
	return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
};

/**
 * Parse `Date` month's end day ~ at `23:59:59 999`
 * - see `_date()` parsing docs
 * 
 * @param value - parse datetime value
 * @param _strict - enable strict datetime parsing (default: `false`) ~ see `_date()`
 * @returns `Date`
 */
export const _monthEnd = (value?: any, _strict: boolean = false): Date => {
	const date: Date = _date(value, _strict) ?? new Date();
	return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
};

/**
 * Parse `Date` value to `datetime` format (i.e. `2023-05-27 22:11:57` ~ `YYYY-MM-DD HH:mm:ss`)
 * - see `_date()` parsing docs
 * 
 * @param value - parse datetime value
 * @param _strict - enable strict datetime parsing (default: `false`) ~ see `_date()`
 * @returns `string` ~ formatted `YYYY-MM-DD HH:mm:ss` | empty `''` when invalid
 */
export const _datetime = (value?: any, _strict: boolean = false): string => {
	const date: Date|undefined = _date(value, _strict);
	if (!date) return '';
	const values: number[] = [
		date.getFullYear(), //yyyy
		date.getMonth() + 1, //MM
		date.getDate(), //dd
		date.getHours(), //HH
		date.getMinutes(), //mm
		date.getSeconds(), //ss
	];
	const padded: string[] = [];
	for (const val of values) padded.push((val + '').padStart(2, '0')); //pad ~ `'1' => '01'`
	return padded.splice(0, 3).join('-') + ' ' + padded.join(':'); //timestamp
};

/**
 * Parse ISO formatted date value to milliseconds timestamp
 * - borrowed from https://github.com/jquense/yup/blob/1ee9b21c994b4293f3ab338119dc17ab2f4e284c/src/util/parseIsoDate.ts
 * 
 * @param value - ISO date `string` (i.e. `'2022-12-19T13:12:42.000+0000'`/`'2022-12-19T13:12:42.000Z'` => `1671455562000`)
 * @returns `number` milliseconds timestamp | `undefined` when invalid
 */
export const _parseIso = (value: string): number|undefined => {
	const regex  = /^(\d{4}|[+-]\d{6})(?:-?(\d{2})(?:-?(\d{2}))?)?(?:[ T]?(\d{2}):?(\d{2})(?::?(\d{2})(?:[,.](\d{1,}))?)?(?:(Z)|([+-])(\d{2})(?::?(\d{2}))?)?)?$/;
	//                1 YYYY                2 MM        3 DD              4 HH     5 mm        6 ss           7 msec         8 Z 9 ±   10 tzHH    11 tzmm
	let struct: any, timestamp: number = NaN;
	try {
		value = String(value);
	}
	catch (e){
		value = '';
	}
	if (struct = regex.exec(value)){
		for (const k of [1, 4, 5, 6, 7, 10, 11]) struct[k] = +struct[k] || 0; //allow undefined days and months
		struct[2] = (+struct[2]||1) - 1;
		struct[3] = +struct[3]||1; //allow arbitrary sub-second precision beyond milliseconds
		struct[7] = struct[7] ? String(struct[7]).substring(0, 3) : 0; //timestamps without timezone identifiers should be considered local time
		if ((struct[8] === undefined || struct[8] === '') && (struct[9] === undefined || struct[9] === '')){
			timestamp = +new Date(struct[1], struct[2], struct[3], struct[4], struct[5], struct[6], struct[7]);
		}
		else {
			let min_offset = 0;
			if (struct[8] !== 'Z' && struct[9] !== undefined){
				min_offset = struct[10] * 60 + struct[11];
				if (struct[9] === '+') min_offset = 0 - min_offset;
			}
			timestamp = Date.UTC(struct[1], struct[2], struct[3], struct[4], struct[5] + min_offset, struct[6], struct[7]);
		}
	}
	else timestamp = Date.parse ? Date.parse(value) : NaN;
	return !isNaN(timestamp) ? timestamp : undefined;
};

/**
 * Year unit milliseconds ~ close estimate `365.25` days
 * - `365.25 * 24 * 60 * 60 * 1000` = `31557600000` ms
 */
export const YEAR_MS: number = 365.25 * 24 * 60 * 60 * 1000;

/**
 * Month unit milliseconds ~ close estimate `30.44` days
 * - `30.44 * 24 * 60 * 60 * 1000` = `2630016000.0000005` ms
 */
export const MONTH_MS: number = 30.44 * 24 * 60 * 60 * 1000;

/**
 * Day unit milliseconds
 * - `24 * 60 * 60 * 1000` = `86400000` ms
 */
export const DAY_MS: number = 24 * 60 * 60 * 1000;

/**
 * Hour unit milliseconds
 * - `60 * 60 * 1000` = `3600000` ms
 */
export const HOUR_MS: number = 60 * 60 * 1000;

/**
 * Minute unit milliseconds
 * - `60 * 1000` = `60000` ms
 */
export const MINUTE_MS: number = 60 * 1000;

/**
 * Second unit milliseconds
 * - `1000` ms
 */
export const SECOND_MS: number = 1000;

/**
 * Duration interface
 */
export interface IDuration {
	
	/**
	 * - duration years
	 */
	years: number;
	
	/**
	 * - duration months
	 */
	months: number;
	
	/**
	 * - duration days
	 */
	days: number;
	
	/**
	 * - duration hours
	 */
	hours: number;
	
	/**
	 * - duration minutes
	 */
	minutes: number;
	
	/**
	 * - duration seconds
	 */
	seconds: number;
	
	/**
	 * - duration milliseconds
	 */
	milliseconds: number;
	
	/**
	 * - duration total days (i.e. `Math.floor((time_difference_ms)/(24*60*60*1000))`)
	 */
	total_days: number;
	
	/**
	 * - duration total time in milliseconds (i.e. `Math.abs(time_difference_ms)`)
	 */
	total_time: number;

	/**
	 * - start timestamp in milliseconds
	 */
	start_time: number,
	
	/**
	 * - end timestamp in milliseconds
	 */
	end_time: number,

	/**
	 * - convert to text method
	 * 
	 * @example
	 * _duration(182458878).toString(0?) //'2 days 02:40:58' (short)
	 * _duration(182458878).toString(1)  //'2 days, 2 hours, 40 minutes, 58 seconds and 878 milliseconds' (long)
	 * 
	 * @param mode - text mode (default: `0`) ~ `0` = short, `1` = long _(see docs)_
	 * @returns `string`
	 */
	toString: (mode?:number)=>string;
}

/**
 * **[internal]** Create `IDuration` object
 * 
 * @param years - elapsed years
 * @param months - elapsed months
 * @param days - elapsed days
 * @param hours - elapsed hours
 * @param minutes - elapsed minutes
 * @param seconds - elapsed seconds
 * @param milliseconds - elapsed milliseconds
 * @param total_days - elapsed total days
 * @param total_time - elapsed total time
 * @param start_time - start timestamp
 * @param end_time - end timestamp
 * @returns `IDuration`
 */
const create_duration = (years: number, months: number, days: number, hours: number, minutes: number, seconds: number, milliseconds: number, total_days: number, total_time: number, start_time: number, end_time: number) => ({
	years,
	months,
	days,
	hours,
	minutes,
	seconds,
	milliseconds,
	total_days,
	total_time,
	start_time,
	end_time,
	toString: function(mode: number = 0){
		mode = [0, 1].includes(mode = parseInt(mode as any)) ? mode : 0;
		const buffer_text: string[] = [], buffer_time: string[] = [];
		const _add = (val: any, name: string): void => {
			if (mode === 0 && ['hour', 'minute', 'second', 'millisecond'].includes(name)){
				if (name === 'millisecond') return;
				buffer_time.push(String(val).padStart(2, '0'));
			}
			else if (val) buffer_text.push(val + ' ' + name + (val > 1 ? 's' : ''));
		};
		_add(years, 'year');
		_add(months, 'month');
		_add(days, 'day');
		_add(hours, 'hour');
		_add(minutes, 'minute');
		_add(seconds, 'second');
		_add(milliseconds, 'millisecond');
		if (mode === 0) return (buffer_text.length ? buffer_text.join(', ') + ' ' : '') + buffer_time.join(':');
		if (!buffer_text.length) buffer_text.push('0 milliseconds');
		return buffer_text.join(', ').replace(/,([^,]*)$/, ' and$1');
		// return buffer_text.length > 1 ? buffer_text.slice(0, -1).join(', ') + ' and ' + buffer_text[buffer_text.length - 1] : buffer_text.join('');
	},
});

/**
 * Get elapsed duration between two dates/timestamps ~ extra accuracy considering leap years
 * - start and end values are reordered automatically (start = min, end = max)
 * 
 * @param start - start date/timestamp
 * @param end - end date/timestamp (default: `undefined`)
 * @param _strict - enable strict datetime parsing (default: `false`) ~ see `_date()`
 * @throws `TypeError` on invalid start/end time value
 * @returns `IDuration`
 */
export const _elapsed = (start: any, end: any = undefined, _strict: boolean = false): IDuration => {
	if (!(start = _date(start, _strict))) throw new TypeError('Invalid elapsed start date value! Pass a valid Date instance, integer timestamp or date string value.');
	if (!(end = _date(end, _strict))) throw new TypeError('Invalid elapsed end date value! Pass a valid Date instance, integer timestamp or date string value.');
	if (start > end){
		const swap = start;
		start = end;
		end = swap;
	}
	let years: number = 0;
	let months: number = 0;
	let days: number = 0;
	let hours: number = 0;
	let minutes: number = 0;
	let seconds: number = 0;
	let milliseconds: number = 0
	const start_time: number = start.getTime();
	const end_time: number = end.getTime();
	const total_time: number = end_time - start_time;
	const total_days: number = Math.floor(total_time / DAY_MS);
	if ((milliseconds += (end.getMilliseconds() - start.getMilliseconds())) < 0){
		seconds --;
		milliseconds += 1000;
	}
	if ((seconds += (end.getSeconds() - start.getSeconds())) < 0){
		minutes --;
		seconds += 60;
	}
	if ((minutes += (end.getMinutes() - start.getMinutes())) < 0){
		hours --;
		minutes += 60;
	}
	if ((hours += (end.getHours() - start.getHours())) < 0){
		days --;
		hours += 24;
	}
	const start_year: number = start.getFullYear();
	let start_month: number = start.getMonth();
	years = end.getFullYear() - start_year;
	if ((months = end.getMonth() - start_month) < 0){
		years --;
		months += 12;
	}
	if ((days += (end.getDate() - start.getDate())) < 0){
		if (end.getMonth() === start.getMonth()) start_month ++;
		if (months <= 0){
			years --;
			months = 11;
		}
		else months --;
		days += new Date(start_year, start_month + 1, 0).getDate();
	}
	return create_duration(years, months, days, hours, minutes, seconds, milliseconds, total_days, total_time, start_time, end_time);
};

/**
 * Get elapsed duration between two dates/timestamps ~ closest estimation
 * - start and end values are reordered automatically (start = min, end = max)
 * 
 * @param start - start date/ms timestamp
 * @param end - end date/ms timestamp (default: `0`)
 * @param _strict - enable strict datetime parsing (default: `false`) ~ see `_date()`
 * @throws `TypeError` on invalid start/end time value
 * @returns `IDuration`
 */
export const _duration = (start: any, end: any = 0, _strict: boolean = false): IDuration => {
	if (!(start = _date(start, _strict))) throw new TypeError('Invalid duration start date value! Pass a valid Date instance, integer timestamp or date string value.');
	if (!(end = _date(end, _strict))) throw new TypeError('Invalid duration end date value! Pass a valid Date instance, integer timestamp or date string value.');
	if (start > end){
		const swap = start;
		start = end;
		end = swap;
	}
	let diff: number = 0;
	const end_time: number = end.getTime();
	const start_time: number = start.getTime();
	const total_time: number = diff = Math.abs(end_time - start_time);
	const total_days: number = Math.floor(total_time / DAY_MS);
	const years = Math.floor(total_time / YEAR_MS);
	diff %= YEAR_MS;
	const months: number = Math.floor(diff / MONTH_MS);
	diff %= MONTH_MS;
	const days: number = Math.floor(diff / DAY_MS);
	diff %= DAY_MS;
	const hours: number = Math.floor(diff / HOUR_MS);
	diff %= HOUR_MS;
	const minutes: number = Math.floor(diff / MINUTE_MS);
	diff %= MINUTE_MS;
	const seconds: number = Math.floor(diff / SECOND_MS);
	const milliseconds: number = diff % SECOND_MS;
	return create_duration(years, months, days, hours, minutes, seconds, milliseconds, total_days, total_time, start_time, end_time);
};