import { bool } from '../types';
/**
 * Check if value is numeric
 *
 * @param value  Parse value
 * @param booleans  Pass `boolean` values as numeric
 * @param blanks  Pass empty `string` values (because `!isNaN('') === true`)
 * @returns `boolean` is numeric
 */
export declare const _numeric: (value: any, booleans?: bool, blanks?: bool) => boolean;
/**
 * Get parsed and normalized `number`
 *
 * - trims `string` value and `''` => `NaN`
 * - supports (#/#.#/.#/#.) & comma separated/spaced string (i.e. `'1, 200, 000 . 3455'` => `1200000.3455`)
 * - normalizes float `3+` last zeros from `5th` place (i.e. `1.1/100` = `0.011000000000000001` => `0.011`)
 *
 * @param value - parse number value
 * @param _default - default `number` result when invalid (default `NaN`)
 * @returns `number` | `NaN` when invalid or when `''`
 */
export declare const _num: (value: any, _default?: number) => number;
/**
 * Get parsed safe positive `number` with optional within min/max limit check
 *
 * @param value - parse number value
 * @param min - set min limit ~ enabled when `min` is a valid positive number
 * @param max - set max limit ~ enabled when `max` is a valid positive number
 * @returns `number` positive | `undefined` when invalid or out of `min/max` bounds
 */
export declare const _posNum: (value: any, min?: number, max?: number) => number | undefined;
/**
 * Get parsed safe `integer` value
 *
 * @param value - parse number value
 * @param _default - result `number` when invalid (default `NaN`)
 * @returns `number` integer
 */
export declare const _int: (value: any, _default?: number) => number;
/**
 * Get parsed safe positive `integer` value with optional within min/max limit check
 *
 * @param value - parse number value
 * @param min - set min limit ~ enabled when `min` is a valid positive number
 * @param max - set max limit ~ enabled when `max` is a valid positive number
 * @param _limit_default - (default: `false`) use min/max value when value goes beyond limit (e.g. `_posInt(150,0,100,true)` => `100`)
 * @returns `number` positive | `undefined` when invalid or out of `min/max` bounds
 */
export declare const _posInt: (value: any, min?: number, max?: number, _limit_default?: boolean) => number | undefined;
/**
 * Round number to decimal places
 *
 * @param value  Parse value
 * @param places  [default: `2`] Decimal places
 * @returns `number` rounded
 */
export declare const _round: (value: number, places?: number) => number;
/**
 * Convert numeric value to comma thousand delimited string (i.e. `1000.4567` => `'1,000.45'`)
 *
 * @param value  Parse value
 * @param places  [default: `2`] Round decimal places
 * @param zeros  Enable trailing `'0'` decimal places (i.e. `1000` => `'1,000.00'`)
 * @returns `string` Comma thousand delimited number (returns `""` if parsed `value` is `NaN`)
 */
export declare const _commas: (value: any, places?: number, zeros?: bool) => string;
/**
 * Generate random `integer` number.
 *
 * @param min  Min `integer`
 * @param max  Max `integer`
 * @returns  `number` Random `integer`
 */
export declare const _rand: (min: number, max: number) => number;
/**
 * Convert px to rem (or reverse)
 *
 * @param val - convert value [default: `1`]
 * @param reverse - convert rem to px
 * @param base - root px [default: `16`]
 * @returns `number`
 */
export declare const _px2rem: (val?: number, reverse?: boolean, base?: number) => number;
/**
 * Convert bytes to size value
 *
 * @param bytes - parse bytes
 * @param mode - parse result mode (default: `0`)
 * - `0` = `string` size text (e.g. `_bytesVal(2097152)` => `2 MB`)
 * - `1` = `number` size value (e.g. `_bytesVal(2097152,1,'MB',0)` => `2`)
 * @param unit - size unit (default: `undefined` = max) ~ `'B'|'KB'|'MB'|'GB'|'TB'|'PB'|'EB'|'ZB'|'YB'`
 * @param places - decimal places
 * @returns `number`
 */
export declare const _bytesVal: (bytes: number, mode?: 0 | 1, unit?: 'B' | 'KB' | 'MB' | 'GB' | 'TB' | 'PB' | 'EB' | 'ZB' | 'YB', places?: number, commas?: boolean) => number | string;
/**
 * Convert decimal to base
 *
 * @example
 * _dec2base(126, 2) // '1111110'
 * _dec2base(126, 2, 4) // '0111 1110'
 * _dec2base(126, 8) // '176'
 * _dec2base(126, 16) // '7E'
 * _dec2base(1000, 16) // '03E8'
 * _dec2base(1000, 16, 2) // '03 E8'
 *
 * @param decimal - parse decimal integer
 * @param base - to base (default: `2`) ~ `2` = binary, `8` - octal, `16` - hexadecimal
 * @param group - space group characters length (default: `0`) ~ enabled when base = `2|16`
 * @returns `string`
 */
export declare const _dec2base: (decimal: number, base?: 2 | 8 | 16, group?: number) => string;
/**
 * Parse decimal to binary
 *
 * @example
 * _dec2bin(126) // 1111110
 * _dec2bin(126, 4) // 0111 1110
 * _dec2bin(126, 8) // 01111110
 *
 * @param decimal - parse decimal integer
 * @param group - space group characters length (default: `0`)
 * @returns `string` binary text
 */
export declare const _dec2bin: (decimal: number, group?: number) => string;
/**
 * Parse binary to decimal
 *
 * @example
 * _bin2dec('0111 1110') // 126
 *
 * @param binary - parse binary text
 * @returns `number|undefined` ~ parsed decimal integer | `undefined` when invalid
 */
export declare const _bin2dec: (binary: string) => number | undefined;
/**
 * Parse decimal to hexadecimal
 *
 * @example
 * _dec2hex(1000) // '03E8'
 * _dec2hex(1000, 2) // '03 E8'
 *
 * @param decimal - parse decimal integer `number`
 * @param group - space group characters length (default: `0`)
 * @returns `string` - hexadecimal text
 */
export declare const _dec2hex: (decimal: number, group?: number) => string;
/**
 * Parse hexadecimal to decimal
 *
 * @example
 * _hex2dec('0x7E') // 126
 * _hex2dec('03 E8') // 1000
 *
 * @param hex - parse hexadecimal text
 * @returns `number|undefined` ~ parsed decimal integer | `undefined` when invalid
 */
export declare const _hex2dec: (hex: string) => number | undefined;
/**
 * Parse decimal to octal
 *
 * @example
 * _dec2oct(126) // 176
 * _dec2oct(512) // 1000
 *
 * @param decimal - parse decimal integer `number`
 * @returns `string` - octal text
 */
export declare const _dec2oct: (decimal: number) => string;
/**
 * Parse octal to decimal
 *
 * @example
 * _oct2dec('0o176') // 126
 * _oct2dec('1000') // 512
 *
 * @param octal - parse octal text
 * @returns `number|undefined` ~ parsed decimal integer | `undefined` when invalid
 */
export declare const _oct2dec: (octal: string) => number | undefined;
/**
 * Parse text from base to decimal
 *
 * @example
 * _base2dec('0111 1110', 2) // 126
 * _base2dec('0o176', 8) // 126
 * _base2dec('0x7E', 16) // 126
 *
 * @param value - parse text
 * @param base - from base (default: `2`) ~ `2` = binary, `8` - octal, `16` - hexadecimal
 * @returns `number|undefined` ~ parsed decimal integer | `undefined` when invalid
 */
export declare const _base2dec: (value: string, base?: 2 | 8 | 16) => number | undefined;
/**
 * Convert degree to [radian](https://en.wikipedia.org/wiki/Radian)
 * - `2π rad = 360°` ∴ `radian = degree * π/180`
 *
 * @param degrees - angle in degrees (i.e. 0 - 360°)
 * @returns `number` - radian
 */
export declare const _deg2rad: (degrees: number) => number;
/**
 * Convert radian to [degree](https://en.wikipedia.org/wiki/Degree_(angle))
 * - `2π rad = 360°` ∴ `radian = degree * π/180`
 *
 * @param radians - angle in radians (i.e. 0 - 360°)
 * @returns `number` - degree
 */
export declare const _rad2deg: (radians: number) => number;
/**
 * Get distance in meters between two latitude and longitude coordinates
 *
 * @param latitude1 - first coordinate latitude `number`
 * @param longitude1 - first coordinate longitude `number`
 * @param latitude2 - second coordinate latitude `number`
 * @param longitude2 - second coordinate longitude `number`
 * @returns `number` `m` distance
 * @throws `TypeError` when coorinate argument value is `NaN`
 */
export declare const _distance: (latitude1: number, longitude1: number, latitude2: number, longitude2: number) => number;
