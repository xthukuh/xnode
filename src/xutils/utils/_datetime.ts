//===================================================================================
// simple date helpers - consider useful libraries: https://momentjs.com/ 
//===================================================================================

import { _str } from './_string';
import { _posInt } from './_number';
import { _empty } from './_objects';

/**
 * Date time locales
 */
export const DateLocales = {
	monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
	dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
	AM: 'AM',
	PM: 'PM'
};

/**
 * Parse `Date` value
 * - ignores empty or nil value (i.e. `undefined`|`null`|0|`''`)
 * 
 * @param value - parse date value
 * @param _default - default date value when invalid (`true` => `new Date()`)
 * @returns `Date` instance | `undefined` when invalid
 */
export const _date = (value: any, _default?: any): Date|undefined => {
	let date: Date|undefined = undefined;
	if (value instanceof Date) date = value;
	else if (!_empty(value, true)){
		if ('number' === typeof value) date = new Date(value);
		else if ((value = _str(value, true)) && !isNaN(value = Date.parse(value))) date = new Date(value);
	}
	const _get_default = (): Date|undefined => {
		if (_empty(_default)) return undefined;
		if (_default === true) return new Date();
		return _date(_default);
	};
	return date && !isNaN(date.getTime()) ? date : _get_default();
};

/**
 * Get today's `Date` instance at midnight
 * - i.e. `new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0, 0))`
 * 
 * @param value - parse date value
 * @returns `Date` instance
 */
export const _today = (): Date => {
	const date = new Date();
	return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
};

/**
 * Get `Date` midnight value
 * 
 * @example
 * _midnight('2023-10-05 23:18:52') => '2023-10-05 00:00:00'
 * 
 * @param value - parse date value (`undefined` => `new Date()`) ~ `value ?? new Date()`
 * @param _default - default date value when invalid (`true` => `new Date()`)
 * @returns `Date` instance | `undefined` when invalid
 */
export const _midnight = (value: any, _default?: any): Date|undefined => {
	const date: Date|undefined = _date(value ?? new Date(), _default);
	if (!date) return undefined;
	return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
};

/**
 * Get `Date` midnight value yesterday ~ **-1 DAY** 
 * 
 * @example
 * _yesterday('2023-10-05 23:18:52') => '2023-10-04 00:00:00'
 * 
 * @param value - parse date value (`undefined` => `new Date()`) ~ `value ?? new Date()`
 * @param _default - default date value when invalid (`true` => `new Date()`)
 * @returns `Date` instance | `undefined` when invalid
 */
export const _yesterday = (value?: any, _default?: any): Date|undefined => {
	const date: Date|undefined = _date(value ?? new Date(), _default);
	if (!date) return undefined;
	return new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1, 0, 0, 0, 0);
};

/**
 * Get `Date` value at midnight tomorrow ~ **+1 DAY** 
 * 
 * @example
 * _tomorrow('2023-10-05 23:18:52') => '2023-10-06 00:00:00'
 * 
 * @param value - parse date value (`undefined` => `new Date()`) ~ `value ?? new Date()`
 * @param _default - default date value when invalid (`true` => `new Date()`)
 * @returns `Date` instance | `undefined` when invalid
 */
export const _tomorrow = (value?: any, _default?: any): Date|undefined => {
	const date: Date|undefined = _date(value, _default);
	if (!date) return undefined;
	return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 0, 0, 0, 0);
};

/**
 * Get `Date` value at midnight **first** day of the month
 * 
 * @example
 * _monthStart('2023-10-05 23:18:52') => '2023-10-01 00:00:00'
 * 
 * @param value - parse date value (`undefined` => `new Date()`) ~ `value ?? new Date()`
 * @param _default - default date value when invalid (`true` => `new Date()`)
 * @returns `Date` instance | `undefined` when invalid
 */
export const _monthStart = (value?: any, _default?: any): Date|undefined => {
	const date: Date|undefined = _date(value, _default);
	if (!date) return undefined;
	return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
};

/**
 * Get `Date` value **last** day of the month ~ just before midnight (i.e. time `23:59:59 999`)
 * 
 * @example
 * _monthEnd('2022-02-16 23:18:52') => '2022-02-28 23:59:59'
 * _monthEnd('2020-02-16 23:18:52') => '2020-02-29 23:59:59'
 * 
 * @param value - parse date value (`undefined` => `new Date()`) ~ `value ?? new Date()`
 * @param _default - default date value when invalid (`true` => `new Date()`)
 * @returns `Date` instance | `undefined` when invalid
 */
export const _monthEnd = (value?: any, _default?: any): Date|undefined => {
	const date: Date|undefined = _date(value, _default);
	if (!date) return undefined;
	return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
};

/**
 * Get `Date` value month days count ~ month's last date
 * 
 * @example
 * _monthDays('2022-02-16 23:18:52') => 28
 * _monthDays('2020-02-16 23:18:52') => 29
 * 
 * @param value - parse date value (`undefined` => `new Date()`) ~ `value ?? new Date()`
 * @param _default - default date value when invalid (`true` => `new Date()`)
 * @returns `number` last date | `undefined` when invalid
 */
export const _monthDays = (value?: any, _default?: any): number|undefined => {
	const date: Date|undefined = _date(value, _default);
	if (!date) return undefined;
	const last = new Date(date.getFullYear(), date.getMonth() + 1, 0, 0, 0, 0, 0);
	return last.getDate();
};

/**
 * Get parsed `Date` value time milliseconds (i.e. `date.getTime()`)
 * 
 * @param value - parse date value
 * @param min - set `min` timestamp limit ~ enabled when `min` is a valid timestamp integer
 * @param max - set `max` timestamp limit ~ enabled when `max` is a valid timestamp integer
 * @param _default - default date value when invalid (`true` => `new Date()`)
 * @returns `number` timestamp in milliseconds | `undefined` when invalid
 */
export const _time = (value: any, min?: number, max?: number, _default?: any): number|undefined => {
	let date: Date|undefined, time: number|undefined = undefined;
	if ((date = _date(value)) && Number.isInteger(time = _posInt(date.getTime(), min, max))) return time;
	return (date = _date(_default)) && Number.isInteger(time = _posInt(date.getTime(), min, max)) ? time : undefined;
};

/**
 * Validate `Date` instance
 * 
 * @param value
 * @returns `boolean`
 */
export const _isDate = (value: any): boolean => value instanceof Date && !isNaN(value.getTime());

/**
 * Parse `Date` value to `datetime` format (i.e. `2023-05-27 22:11:57` ~ `YYYY-MM-DD HH:mm:ss`)
 * 
 * @param value - parse date value
 * @returns
 * - `string` ~ formatted `YYYY-MM-DD HH:mm:ss`
 * - `''` when date value is invalid
 */
export const _datetime = (value: any): string => {
	const date = _date(value);
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
	if (struct = regex.exec(value = _str(value, true))){
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