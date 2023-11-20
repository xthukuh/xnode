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
 * 
 * @param value - parse date value
 * @param _strict - (default: `true`) strict date parsing mode ~ accepts `Date`|`number` value where result `date.getTime() > 1`
 * @returns `Date` instance | `undefined` when invalid
 */
export const _date = (value: any, _strict: boolean = true): Date|undefined => {
	if (value === undefined) return undefined;
	const _parse = (val: any): Date|undefined => !isNaN(val) && (val > 1 || !_strict) ? new Date(val) : undefined;
	if ([null, false, true, 0].includes(value)) return _parse(value);
	if (value instanceof Date) return _parse(value.getTime());
	if (Number.isInteger(value)) return _parse(new Date(value).getTime());
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
 * Parsed `Date` timestamp value (i.e. `date.getTime()`) ~ _see `_date`_
 * 
 * @param value - parse date value
 * @param min - set `min` timestamp limit ~ enabled when `min` is a valid timestamp integer
 * @param max - set `max` timestamp limit ~ enabled when `max` is a valid timestamp integer
 * @param _strict - (default: `true`) strict date parsing mode ~ accepts `Date`|`number` value where result `date.getTime() > 1`
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
 * 
 * @param value - parse date value
 * @param _strict - (default: `false`) strict date parsing mode ~ accepts `Date`|`number` value where result `date.getTime() > 1`
 * @returns `Date` instance ~ defaults to `new Date()` when value argument is empty or invalid
 */
export const _dayStart = (value?: any, _strict: boolean = false): Date => {
	const date: Date = _date(value, _strict) ?? new Date();
	return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
};

/**
 * Parse `Date` day end ~ at `23:59:59 999`
 * 
 * @param value - parse date value
 * @param _strict - (default: `false`) strict date parsing mode ~ accepts `Date`|`number` value where result `date.getTime() > 1`
 * @returns `Date` instance ~ defaults to `new Date()` when value argument is empty or invalid
 */
export const _dayEnd = (value?: any, _strict: boolean = false): Date => {
	const date: Date = _date(value, _strict) ?? new Date();
	return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
};

/**
 * Parse `Date` month's start day ~ at `00:00:00 0`
 * 
 * @param value - parse date value
 * @param _strict - (default: `false`) strict date parsing mode ~ accepts `Date`|`number` value where result `date.getTime() > 1`
 * @returns `Date` instance ~ defaults to `new Date()` when value argument is empty or invalid
 */
export const _monthStart = (value?: any, _strict: boolean = false): Date => {
	const date: Date = _date(value, _strict) ?? new Date();
	return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
};

/**
 * Parse `Date` month's end day ~ at `23:59:59 999`
 * 
 * @param value - parse date value
 * @param _strict - (default: `false`) strict date parsing mode ~ accepts `Date`|`number` value where result `date.getTime() > 1`
 * @returns `Date` instance ~ defaults to `new Date()` when value argument is empty or invalid
 */
export const _monthEnd = (value?: any, _strict: boolean = false): Date => {
	const date: Date = _date(value, _strict) ?? new Date();
	return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
};

/**
 * Parse `Date` value to `datetime` format (i.e. `2023-05-27 22:11:57` ~ `YYYY-MM-DD HH:mm:ss`)
 * 
 * @param value - parse date value
 * @param _strict - (default: `false`) strict date parsing mode ~ accepts `Date`|`number` value where result `date.getTime() > 1`
 * @returns - `string` ~ formatted `YYYY-MM-DD HH:mm:ss` | empty `''` when invalid
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
 * @returns
 * - `number` milliseconds timestamp
 * - `undefined` when invalid
 */
export const _parseIso = (value: string): number|undefined => {
	//                1 YYYY                2 MM        3 DD              4 HH     5 mm        6 ss           7 msec         8 Z 9 ±   10 tzHH    11 tzmm
	const regex  = /^(\d{4}|[+-]\d{6})(?:-?(\d{2})(?:-?(\d{2}))?)?(?:[ T]?(\d{2}):?(\d{2})(?::?(\d{2})(?:[,.](\d{1,}))?)?(?:(Z)|([+-])(\d{2})(?::?(\d{2}))?)?)?$/;
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
 * Duration interface
 */
export interface IDuration {
	start: Date,
	end: Date,
	years: number;
	months: number;
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
	milliseconds: number;
	total_days: number;
	total_time: number;
	toString: (mode?:number)=>string;
}

/**
 * Create elapsed time object
 * 
 * @param start - date start 
 * @param end - date end 
 * @param years - elapsed years
 * @param months - elapsed months
 * @param days - elapsed days
 * @param hours - elapsed hours
 * @param minutes - elapsed minutes
 * @param seconds - elapsed seconds
 * @param milliseconds - elapsed milliseconds
 * @param total_days - elapsed total days
 * @param total_time - elapsed total time
 * @returns `IDuration`
 */
const _get_duration = (
	start: Date,
	end: Date,
	years: number,
	months: number,
	days: number,
	hours: number,
	minutes: number,
	seconds: number,
	milliseconds: number,
	total_days: number,
	total_time: number,
) => ({
	start,
	end,
	years,
	months,
	days,
	hours,
	minutes,
	seconds,
	milliseconds,
	total_days,
	total_time,
	toString: function(mode: number = 0){
		let buffer: string = '';
		const _add = (val: any, name: string): void => {
			if (mode === 0){
				if (['hour', 'minute', 'second', 'millisecond'].includes(name)){
					if (name === 'millisecond') return;
					val = String(val).padStart(2, '0');
					if (name === 'hour') buffer += (buffer ? ' ' : '') + val;
					else buffer += ':' + val;
					return;
				}
				if (val) buffer += (buffer ? ' ' : '') + val + ' ' + (val === 1 ? name : name + 's');
				return;
			}
			else if (val) buffer += (buffer ? ', ' : '') + val + ' ' + (val === 1 ? name : name + 's');
		};
		_add(years, 'year');
		_add(months, 'month');
		_add(days, 'day');
		_add(hours, 'hour');
		_add(minutes, 'minute');
		_add(seconds, 'second');
		_add(milliseconds, 'millisecond');
		if (!buffer) buffer = '0 milliseconds';
		if (mode === 0) return buffer;
		const values = buffer.split(', ').map(v => v.trim());
		return values.length > 1 ? values.slice(0, -1).join(', ') + ' and ' + values[values.length - 1] : values.join('');
	},
});

/**
 * Get elapsed time ~ difference between two date/time values (ordered automatically)
 * - accepts any date value format
 * 
 * @param start - start date
 * @param end - end date
 * @param _strict - (default: `false`) strict date parsing mode ~ accepts `Date`|`number` value where result `date.getTime() > 1`
 * @throws `TypeError` on invalid start/end time value
 * @returns `IDuration`
 */
export const _elapsed = (start: any, end: any, _strict: boolean = false): IDuration => {
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
	const total_time: number = end.getTime() - start.getTime();
	const total_days: number = Math.floor(total_time / (24 * 60 * 60 * 1000));
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
	return _get_duration(
		start,
		end,
		years,
		months,
		days,
		hours,
		minutes,
		seconds,
		milliseconds,
		total_days,
		total_time,
	);
};

/**
 * Get elapsed time ~ difference between two date/time values (ordered automatically)
 * - accepts any date value format
 * 
 * @param start - start date
 * @param end - end date
 * @param _strict - (default: `false`) strict date parsing mode ~ accepts `Date`|`number` value where result `date.getTime() > 1`
 * @throws `TypeError` on invalid start/end time value
 * @returns `IDuration`
 */
export const _duration = (start: any, end: any, _strict: boolean = false): IDuration => {
	if (!(start = _date(start, _strict))) throw new TypeError('Invalid duration start date value! Pass a valid Date instance, integer timestamp or date string value.');
	if (!(end = _date(end, _strict))) throw new TypeError('Invalid duration end date value! Pass a valid Date instance, integer timestamp or date string value.');
	if (start > end){
		const swap = start;
		start = end;
		end = swap;
	}
	let diff: number = 0;
	const total_time: number = Math.abs(end.getTime() - start.getTime());
	const total_days: number = Math.floor(total_time / (24 * 60 * 60 * 1000));
	const years = Math.floor(total_time / (365.25 * 24 * 60 * 60 * 1000));
	diff %= 365.25 * 24 * 60 * 60 * 1000;
	const months: number = Math.floor(diff / (30.44 * 24 * 60 * 60 * 1000));
	diff %= 30.44 * 24 * 60 * 60 * 1000;
	const days: number = Math.floor(diff / (24 * 60 * 60 * 1000));
	diff %= 24 * 60 * 60 * 1000;
	const hours: number = Math.floor(diff / (60 * 60 * 1000));
	diff %= 60 * 60 * 1000;
	const minutes: number = Math.floor(diff / (60 * 1000));
	diff %= 60 * 1000;
	const seconds: number = Math.floor(diff / 1000);
	const milliseconds: number = diff % 1000;
	console.log({start,
		end,
		years,
		months,
		days,
		hours,
		minutes,
		seconds,
		milliseconds,
		total_days,
		total_time,});
	return _get_duration(
		start,
		end,
		years,
		months,
		days,
		hours,
		minutes,
		seconds,
		milliseconds,
		total_days,
		total_time,
	);
};