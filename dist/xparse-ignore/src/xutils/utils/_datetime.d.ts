/**
 * Validate `Date` instance
 *
 * @param value
 * @returns `boolean`
 */
export declare const _isDate: (value: any) => boolean;
/**
 * Parse `Date` value ~ accepts valid `Date` instance, timestamp integer, datetime string (see `_strict` param docs)
 * - supports valid `Date` instance, `integer|string` timestamp in milliseconds and other `string` date texts
 * - when strict parsing, value must be a valid date value with more than `1` timestamp milliseconds
 * - when strict parsing is disabled, result for `undefined` = `new Date()` and `null|false|true|0` = `new Date(null|false|true|0)`
 *
 * @param value - parse date value
 * @param _strict - enable strict parsing (default: `true`)
 * @returns `Date` instance | `undefined` when invalid
 */
export declare const _date: (value: any, _strict?: boolean) => Date | undefined;
/**
 * Parsed `Date` timestamp value (i.e. `date.getTime()`)
 * - see `_date()` parsing docs
 *
 * @param value - parse date value
 * @param min - set `min` timestamp limit ~ enabled when `min` is a valid timestamp integer
 * @param max - set `max` timestamp limit ~ enabled when `max` is a valid timestamp integer
 * @param _strict - enable strict parsing (default: `true`)
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
 * - see `_date()` parsing docs
 *
 * @param value - parse date value ~ **_(defaults to `new Date()` when invalid)_**
 * @param _strict - enable strict datetime parsing (default: `false`)
 * @returns `Date`
 */
export declare const _dayStart: (value?: any, _strict?: boolean) => Date;
/**
 * Parse `Date` day end ~ at `23:59:59 999`
 * - see `_date()` parsing docs
 *
 * @param value - parse date value ~ **_(defaults to `new Date()` when invalid)_**
 * @param _strict - enable strict datetime parsing (default: `false`)
 * @returns `Date`
 */
export declare const _dayEnd: (value?: any, _strict?: boolean) => Date;
/**
 * Parse `Date` month's start day ~ at `00:00:00 0`
 * - see `_date()` parsing docs
 *
 * @param value - parse date value ~ **_(defaults to `new Date()` when invalid)_**
 * @param _strict - enable strict datetime parsing (default: `false`) ~ see `_date()`
 * @returns `Date`
 */
export declare const _monthStart: (value?: any, _strict?: boolean) => Date;
/**
 * Parse `Date` month's end day ~ at `23:59:59 999`
 * - see `_date()` parsing docs
 *
 * @param value - parse date value ~ **_(defaults to `new Date()` when invalid)_**
 * @param _strict - enable strict datetime parsing (default: `false`) ~ see `_date()`
 * @returns `Date`
 */
export declare const _monthEnd: (value?: any, _strict?: boolean) => Date;
/**
 * Parse `Date` year's start day ~ at `YYYY-01-01 00:00:00 0`
 * - see `_date()` parsing docs
 *
 * @param value - parse date value ~ **_(defaults to `new Date()` when invalid)_**
 * @param _strict - enable strict datetime parsing (default: `false`) ~ see `_date()`
 * @returns `Date`
 */
export declare const _yearStart: (value?: any, _strict?: boolean) => Date;
/**
 * Parse `Date` year's end day ~ at `YYYY-12-31 23:59:59 999`
 * - see `_date()` parsing docs
 *
 * @param value - parse date value ~ **_(defaults to `new Date()` when invalid)_**
 * @param _strict - enable strict datetime parsing (default: `false`) ~ see `_date()`
 * @returns `Date`
 */
export declare const _yearEnd: (value?: any, _strict?: boolean) => Date;
/**
 * Parse `Date` value to `YYYY-MM-DD HH:mm:ss` format (e.g. `'2023-05-27 22:11:57'`)
 * - see `_date()` parsing docs
 *
 * @param value - parse date value
 * @param _strict - enable strict datetime parsing (default: `false`) ~ see `_date()`
 * @returns `string` ~ `'YYYY-MM-DD HH:mm:ss'` | empty `''` when invalid
 */
export declare const _datetime: (value?: any, _strict?: boolean) => string;
/**
 * Parse `Date` value to `YYYY-MM-DD` format `string` (e.g. `'2023-05-27'`)
 * - see `_date()` parsing docs
 *
 * @param value - parse date value
 * @param _strict - enable strict datetime parsing (default: `false`) ~ see `_date()`
 * @returns `string` ~ `'YYYY-MM-DD'` | empty `''` when invalid
 */
export declare const _datestr: (value?: any, _strict?: boolean) => string;
/**
 * Parse `Date` value to `HH:mm:ss` format `string` (e.g. `'22:11:57'`)
 * - see `_date()` parsing docs
 *
 * @param value - parse date value
 * @param _strict - enable strict datetime parsing (default: `false`) ~ see `_date()`
 * @returns `string` ~ `'HH:mm:ss'` | empty `''` when invalid
 */
export declare const _timestr: (value?: any, _strict?: boolean) => string;
/**
 * Parse ISO formatted date value to milliseconds timestamp
 * - borrowed from https://github.com/jquense/yup/blob/1ee9b21c994b4293f3ab338119dc17ab2f4e284c/src/util/parseIsoDate.ts
 *
 * @param value - ISO date `string` (i.e. `'2022-12-19T13:12:42.000+0000'`/`'2022-12-19T13:12:42.000Z'` => `1671455562000`)
 * @returns `number` milliseconds timestamp | `undefined` when invalid
 */
export declare const _parseIso: (value: string) => number | undefined;
/**
 * Year unit milliseconds ~ close estimate `365.25` days
 * - `365.25 * 24 * 60 * 60 * 1000` = `31557600000` ms
 */
export declare const YEAR_MS: number;
/**
 * Month unit milliseconds ~ close estimate `30.44` days
 * - `30.44 * 24 * 60 * 60 * 1000` = `2630016000.0000005` ms
 */
export declare const MONTH_MS: number;
/**
 * Day unit milliseconds
 * - `24 * 60 * 60 * 1000` = `86400000` ms
 */
export declare const DAY_MS: number;
/**
 * Hour unit milliseconds
 * - `60 * 60 * 1000` = `3600000` ms
 */
export declare const HOUR_MS: number;
/**
 * Minute unit milliseconds
 * - `60 * 1000` = `60000` ms
 */
export declare const MINUTE_MS: number;
/**
 * Second unit milliseconds
 * - `1000` ms
 */
export declare const SECOND_MS: number;
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
    start_time: number;
    /**
     * - end timestamp in milliseconds
     */
    end_time: number;
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
    toString: (mode?: number) => string;
}
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
export declare const _elapsed: (start: any, end?: any, _strict?: boolean) => IDuration;
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
export declare const _duration: (start: any, end?: any, _strict?: boolean) => IDuration;
