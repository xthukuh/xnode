/**
 * Validate `Date` instance
 *
 * @param value
 * @returns `boolean`
 */
export declare const _isDate: (value: any) => boolean;
/**
 * Parse `Date` value ~ accepts valid `Date` instance, timestamp integer, datetime string (see `_strict` param docs)
 *
 * @param value - parse date value
 * @param _strict - (default: `true`) strict date parsing mode ~ accepts `Date`|`number` value where result `date.getTime() > 1`
 * @returns `Date` instance | `undefined` when invalid
 */
export declare const _date: (value: any, _strict?: boolean) => Date | undefined;
/**
 * Parsed `Date` timestamp value (i.e. `date.getTime()`) ~ _see `_date`_
 *
 * @param value - parse date value
 * @param min - set `min` timestamp limit ~ enabled when `min` is a valid timestamp integer
 * @param max - set `max` timestamp limit ~ enabled when `max` is a valid timestamp integer
 * @param _strict - (default: `true`) strict date parsing mode ~ accepts `Date`|`number` value where result `date.getTime() > 1`
 * @returns `number` timestamp in milliseconds | `undefined` when invalid
 */
export declare const _time: (value: any, min?: number, max?: number, _strict?: boolean) => number | undefined;
/**
 * Day names
 * - `('Sunday'|'Monday'|'Tuesday'|'Wednesday'|'Thursday'|'Friday'|'Saturday')[]`
 */
export declare const DAY_NAMES: string[];
/**
 * Get day name
 *
 * @param index - (default: `0`) day index `0-6` ~ `DAY_NAMES[Math.abs(index % DAY_NAMES.length)]`
 * @returns `string` ~ `'Sunday'|'Monday'|'Tuesday'|'Wednesday'|'Thursday'|'Friday'|'Saturday'`
 */
export declare const _dayName: (index: any) => string;
/**
 * Month names
 * - `('January'|'February'|'March'|'April'|'May'|'June'|'July'|'August'|'September'|'October'|'November'|'December')[]`
 */
export declare const MONTH_NAMES: string[];
/**
 * Get month name
 *
 * @param index - (default: `0`) day index `0-11` ~ `MONTH_NAMES[Math.abs(index % DAY_NAMES.length)]`
 * @returns `string` ~ `'January'|'February'|'March'|'April'|'May'|'June'|'July'|'August'|'September'|'October'|'November'|'December'`
 */
export declare const _monthName: (index: any) => string;
/**
 * Parse `Date` day start ~ at `00:00:00 0`
 *
 * @param value - parse date value
 * @param _strict - (default: `false`) strict date parsing mode ~ accepts `Date`|`number` value where result `date.getTime() > 1`
 * @returns `Date` instance ~ defaults to `new Date()` when value argument is empty or invalid
 */
export declare const _dayStart: (value?: any, _strict?: boolean) => Date;
/**
 * Parse `Date` day end ~ at `23:59:59 999`
 *
 * @param value - parse date value
 * @param _strict - (default: `false`) strict date parsing mode ~ accepts `Date`|`number` value where result `date.getTime() > 1`
 * @returns `Date` instance ~ defaults to `new Date()` when value argument is empty or invalid
 */
export declare const _dayEnd: (value?: any, _strict?: boolean) => Date;
/**
 * Parse `Date` month's start day ~ at `00:00:00 0`
 *
 * @param value - parse date value
 * @param _strict - (default: `false`) strict date parsing mode ~ accepts `Date`|`number` value where result `date.getTime() > 1`
 * @returns `Date` instance ~ defaults to `new Date()` when value argument is empty or invalid
 */
export declare const _monthStart: (value?: any, _strict?: boolean) => Date;
/**
 * Parse `Date` month's end day ~ at `23:59:59 999`
 *
 * @param value - parse date value
 * @param _strict - (default: `false`) strict date parsing mode ~ accepts `Date`|`number` value where result `date.getTime() > 1`
 * @returns `Date` instance ~ defaults to `new Date()` when value argument is empty or invalid
 */
export declare const _monthEnd: (value?: any, _strict?: boolean) => Date;
/**
 * Parse `Date` value to `datetime` format (i.e. `2023-05-27 22:11:57` ~ `YYYY-MM-DD HH:mm:ss`)
 *
 * @param value - parse date value
 * @param _strict - (default: `false`) strict date parsing mode ~ accepts `Date`|`number` value where result `date.getTime() > 1`
 * @returns - `string` ~ formatted `YYYY-MM-DD HH:mm:ss` | empty `''` when invalid
 */
export declare const _datetime: (value?: any, _strict?: boolean) => string;
/**
 * Parse ISO formatted date value to milliseconds timestamp
 * - borrowed from https://github.com/jquense/yup/blob/1ee9b21c994b4293f3ab338119dc17ab2f4e284c/src/util/parseIsoDate.ts
 *
 * @param value - ISO date `string` (i.e. `'2022-12-19T13:12:42.000+0000'`/`'2022-12-19T13:12:42.000Z'` => `1671455562000`)
 * @returns
 * - `number` milliseconds timestamp
 * - `undefined` when invalid
 */
export declare const _parseIso: (value: string) => number | undefined;
/**
 * Duration interface
 */
export interface IDuration {
    start: Date;
    end: Date;
    years: number;
    months: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    milliseconds: number;
    total_days: number;
    total_time: number;
    toString: (mode?: number) => string;
}
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
export declare const _elapsed: (start: any, end: any, _strict?: boolean) => IDuration;
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
export declare const _duration: (start: any, end: any, _strict?: boolean) => IDuration;
