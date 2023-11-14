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
