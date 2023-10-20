/**
 * Date time locales
 */
export declare const DateLocales: {
    monthNames: string[];
    dayNames: string[];
    AM: string;
    PM: string;
};
/**
 * Parse `Date` value
 * - ignores empty or nil value (i.e. `undefined`|`null`|0|`''`)
 *
 * @param value - parse date value
 * @param _default - default date value when invalid (`true` => `new Date()`)
 * @returns `Date` instance | `undefined` when invalid
 */
export declare const _date: (value: any, _default?: any) => Date | undefined;
/**
 * Get today's `Date` instance at midnight
 * - i.e. `new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0, 0))`
 *
 * @param value - parse date value
 * @returns `Date` instance
 */
export declare const _today: () => Date;
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
export declare const _midnight: (value: any, _default?: any) => Date | undefined;
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
export declare const _yesterday: (value?: any, _default?: any) => Date | undefined;
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
export declare const _tomorrow: (value?: any, _default?: any) => Date | undefined;
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
export declare const _monthStart: (value?: any, _default?: any) => Date | undefined;
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
export declare const _monthEnd: (value?: any, _default?: any) => Date | undefined;
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
export declare const _monthDays: (value?: any, _default?: any) => number | undefined;
/**
 * Get parsed `Date` value time milliseconds (i.e. `date.getTime()`)
 *
 * @param value - parse date value
 * @param min - set `min` timestamp limit ~ enabled when `min` is a valid timestamp integer
 * @param max - set `max` timestamp limit ~ enabled when `max` is a valid timestamp integer
 * @param _default - default date value when invalid (`true` => `new Date()`)
 * @returns `number` timestamp in milliseconds | `undefined` when invalid
 */
export declare const _time: (value: any, min?: number, max?: number, _default?: any) => number | undefined;
/**
 * Validate `Date` instance
 *
 * @param value
 * @returns `boolean`
 */
export declare const _isDate: (value: any) => boolean;
/**
 * Parse `Date` value to `datetime` format (i.e. `2023-05-27 22:11:57` ~ `YYYY-MM-DD HH:mm:ss`)
 *
 * @param value - parse date value
 * @returns
 * - `string` ~ formatted `YYYY-MM-DD HH:mm:ss`
 * - `''` when date value is invalid
 */
export declare const _datetime: (value: any) => string;
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
