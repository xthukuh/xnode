import { bool } from '../types';
/**
 * Get unique string of random characters
 *
 * @example
 * _xuid() => 'zt7eg4eu3b6mf66jga' 18
 *
 * @returns `string` ~ alphanumeric lowercase
 */
export declare const _xuid: () => string;
/**
 * Get unique string of random characters `string` ~ alphanumeric lowercase
 *
 * @example
 * _uuid() => 'g9eem5try3pll9ue' 16
 * _uuid(20) => 'k6yo2zgzodjll9uers4u' 20
 * _uuid(7, 'test_') => 'test_3bmxj2t' 12
 * _uuid(7, 'test_{uuid}_example') => 'test_lk9r5tv_example' 20
 * _uuid(7, 'test_{uuid}_{uuid}_example') => 'test_g948vqf_0s6ms8y_example' 28
 *
 * @param length - uuid length - integer `number` min=`7`, max=`64` (default `16`)
 * @param template - uuid template - trimmed `string` ~ appends when `'{uuid}'` not in template
 * @returns unique `string` ~ alphanumeric lowercase `(length[min: 7, max: 64])`
 */
export declare const _uuid: (length?: number, template?: string) => string;
/**
 * Safely `string` cast value
 * - Returns ISO format timestamp for valid Date value
 *
 * @param value  Cast value
 * @param _default  [default: `''`] Default result on failure
 * @returns `string`
 */
export declare const _string: (value: any, _default?: string) => string;
/**
 * Safely `string` cast value if possible.
 *
 * @param value
 * @returns `false|string` Cast result or `false` on failure
 * @returns value `string` | `false` on failure
 */
export declare const _stringable: (value: any) => false | string;
/**
 * Convert value to `string` equivalent
 *
 * - Returns '' for `null` and `undefined` value
 * - When `stringify` is `false`, returns '' for `array` or `object` value that does not implement `toString()` method
 *
 * @param value
 * @param trim  Trim result
 * @param stringify  Stringify `array` or `object` value that does not implement `toString()` method
 * @returns `string`
 */
export declare const _str: (value: any, trim?: boolean, stringify?: boolean) => string;
/**
 * Normalize string by removing accents (i.e. "Amélie" => "Amelie")
 *
 * @param value
 * @returns normalized `string`
 */
export declare const _strNorm: (value: any) => string;
/**
 * Escape regex operators from string
 * - i.e. `'\\s\n\r\t\v\x00~_!@#$%^&*()[]\\/,.?"\':;{}|<>=+-'` => `'\\s\n\r\t\v\x00\s~_!@#\\$%\\^&\\*\\(\\)\\[\\]\\\\/,\\.\\?"\':;\\{\\}\\|<>=\\+-'`
 *
 * @param value
 * @returns escaped `string`
 */
export declare const _regEscape: (value: any) => string;
/**
 * Escape string special characters
 * - i.e. `'\r\n\t\f\v\x00-\u00f3-\u1234-\xb4-\u000b-/\\'` => `'\\r\\n\\t\\f\\v\\x00-ó-ሴ-´-\\v-/\\\\'`
 *
 * @param value
 * @returns escaped `string`
 */
export declare const _strEscape: (value: any) => string;
/**
 * Escape `SQL` special characters from query `string` value
 *
 * @param value - parse `string`
 * @returns
 * - `string` with special characters escaped ~ `'\\'"\0\n\r\x1a'`
 * - `number` (unchanged) when type is `number` and not  `NaN`
 * - `boolean` (unchanged) when type is `true` or `false`
 * - `null` when type is `undefined`|`NaN`|`null`
 */
export declare const _sqlEscape: (value: any) => string | number | boolean | null;
/**
 * Regex string trim characters
 *
 * @param value  Trim value
 * @param chars  Strip characters [default: `' \n\r\t\f\v\x00'`] - use `'{default}'` to include defaults (i.e `'-{defaults}'` == `'- \n\r\t\f\v\x00'`)
 * @param rl  Trim mode (`''` => (default) trim right & left, `'r'|'right'` => trim right, `'l'|'left'` => trim left)
 * @returns trimmed `string`
 */
export declare const _trim: (value: any, chars?: string, rl?: '' | 'r' | 'l' | 'right' | 'left') => string;
/**
 * Regex string trim leading characters (left)
 *
 * @param value Trim value
 * @param chars Strip characters [default: `' \n\r\t\f\v\x00'`] - use `'{default}'` to include defaults (i.e `'-{defaults}'` == `'- \n\r\t\f\v\x00'`)
 * @returns left trimmed `string`
 */
export declare const _ltrim: (value: any, chars?: string) => string;
/**
 * Regex string trim trailing characters (right)
 *
 * @param value Trim value
 * @param chars Strip characters [default: `' \n\r\t\f\v\x00'`] - use `'{default}'` to include defaults (i.e `'-{defaults}'` == `'- \n\r\t\f\v\x00'`)
 * @returns right trimmed `string`
 */
export declare const _rtrim: (value: any, chars?: string) => string;
/**
 * Convert string to title case (i.e. "heLLo woRld" => "Hello World")
 *
 * @param value  Parse string
 * @param keepCase  Disable lowercasing uncapitalized characters
 * @returns Title Case `string`
 */
export declare const _toTitleCase: (value: any, keepCase?: bool) => string;
/**
 * Convert string to sentence case
 *
 * @param value  Parse string
 * @param keepCase  Disable lowercasing uncapitalized characters
 * @returns Sentence case `string`
 */
export declare const _toSentenceCase: (value: any, keepCase?: bool) => string;
/**
 * Convert value to snake case (i.e. 'HelloWorld' => 'hello_world')
 * - accents are normalized (i.e. "Test Amélie" => "test_amelie")
 *
 * @param value  Parse string
 * @param trimTrailing  Trim trailing "_" (`false` = (default) disabled, `true` => trim right & left, `'r'|'right'` => trim right, `'l'|'left'` => trim left)
 * @returns snake_case `string`
 */
export declare const _toSnakeCase: (value: any, trimTrailing?: boolean | 'l' | 'left' | 'r' | 'right') => string;
/**
 * Convert value to slug case (i.e. 'HelloWorld' => 'hello-world')
 *
 * @param value  Parse string
 * @returns slug-case `string`
 */
export declare const _toSlugCase: (value: any, trimTrailing?: boolean | 'l' | 'left' | 'r' | 'right') => string;
/**
 * Convert value to studly case (i.e. 'hello-world' => 'HelloWorld')
 *
 * @param value  Parse string
 * @returns StudlyCase `string`
 */
export declare const _toStudlyCase: (value: any) => string;
/**
 * Convert value to camel case (i.e. 'hello-world' => 'helloWorld')
 *
 * @param value  Parse string
 * @returns camelCase `string`
 */
export declare const _toCamelCase: (value: any) => string;
/**
 * Convert value to lower case sting
 *
 * @param value
 * @returns lowercase `string`
 */
export declare const _toLowerCase: (value: any) => string;
/**
 * Convert value to lower case sting
 *
 * @param value
 * @returns UPPERCASE `string`
 */
export declare const _toUpperCase: (value: any) => string;
/**
 * Parse text value hash code
 *
 * @example
 * _hashCode('Hello world!') => -52966915
 * _hashCode('Hello') => 69609650
 *
 * @param value - parse text value
 * @returns `number` ~ hash code | `0` when blank
 */
export declare const _hashCode: (value: any) => number;
/**
 * Parse text value hash code in `string` format ~ uses `_hashCode(value)` but prepends `'n'` when result number is negative and `'x'` when positive
 *
 * @example
 * _hashCodeStr('Hello world!') => 'n52966915'
 * _hashCodeStr('Hello') => 'x69609650'
 *
 * @param value - parse text value
 * @returns `string` ~ has code text
 */
export declare const _hashCodeStr: (value: any) => string;
/**
 * Parse text value hash code using hash53
 * - A simple but high quality 53-bit string hash generator
 * - Based on `cyrb53` script by `bryc` (https://stackoverflow.com/a/52171480/3735576)
 *
 * @example
 * _hash53('Hello world!') => 5211024121371232
 *
 * @param value - parse text value
 * @param seed - hash entropy seed
 * @returns `number` ~ 53-bit hash code (length=16) | `0` when blank
 */
export declare const _hash53: (value: any, seed?: number) => number;
/**
 * Parsed data URI interface
 */
export interface IDataUri {
    mime: string;
    encoding: string;
    charset: string;
    data: string;
}
/**
 * Parse data URI (uniform resource identifier)
 *
 * @example
 * _parseDataUri('data:text/plain;charset=utf-8,Hello%20world%21') => {
 *   mime: 'text/plain',
 *   encoding: 'charset=utf-8',
 *   charset: 'utf-8',
 *   data: 'Hello%20world%21',
 * }
 * _parseDataUri('data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAZABkAAD') => {
 *   mime: 'image/jpeg',
 *   encoding: 'base64',
 *   charset: '',
 *   data: '/9j/4AAQSkZJRgABAgAAZABkAAD',
 * }
 *
 * @param value - parse data uri value
 * @returns
 * - `IDataUri` ~ `{mime:string;encoding:string;charset:string;data:string}`
 * - `undefined` on error
 */
export declare const _parseDataUri: (value: any) => IDataUri | undefined;
/**
 * Validate URL `string` (uniform resource locator)
 * - includes IP (v4) addresses
 *
 * @param value - parse url `string` value
 * @param matchDataURI - validation includes data URI (i.e. 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAZABkAAD')
 * @returns `boolean` - valid url
 */
export declare const _isUrl: (value: any, matchDataURI?: boolean) => boolean;
/**
 * Validate email address `string`
 *
 * @param value
 * @returns `boolean`
 */
export declare const _isEmail: (value: any) => boolean;
/**
 * Parse csv data into 2d string array
 *
 * @param text - parse text
 * @param delimiter - delimiter character (default: `','`)
 * @param br - new line (default: `'\n'`)
 * @returns `string[][]` ~ `[[...cols], ...rows]`
 */
export declare const _parseCsv: (text: string, delimiter?: string, br?: string) => string[][];
/**
 * Convert data to csv text
 *
 * @param data - parse data
 * @param delimiter - delimiter character (default: `','`)
 * @param br - new line replace (default: `'\n'`)
 * @returns `string` csv text
 */
export declare const _toCsv: (data: string | string[] | string[][], delimiter?: string, br?: string) => string;
/**
 * Split `string` value into parts ~ part and separator array (last entry's separator is `''`)
 *
 * @param value - split string
 * @param separator - split separator (default: `undefined`)
 * @param limit - split items limit/count (default: `undefined`)
 * @returns `[part: string, separator: string | ''][]` split parts
 */
export declare const _split: (value: any, separator?: string | RegExp, limit?: number) => [part: string, separator: string][];
/**
 * Get error text
 *
 * @param error - parse error value
 * @returns `string`
 */
export declare const _errorText: (error: any) => string;
/**
 * Get text with max length limit
 *
 * @param value - parse text
 * @param max - max characters length (default: `1000`)
 * @param mode - result mode
 * - `0` = `substring(0, max)`
 * - `1` = `substring(0, max - 3) + '...'`
 * - `2` = `substring(0, max - [append].length) + [append]` where `[append]` is `'...(' + value.length + ')'`
 * @returns `string` ~ whose character length is <= max
 */
export declare const _textMaxLength: (value: any, max?: number, mode?: 0 | 1 | 2) => string;
/**
 * Custom text encrypt/decrypt cypher ~ `v20231027232850`
 *
 * @param value - text value ~ `string`
 * @param index - index offset ~ `integer` (default: `0`)
 * @param key - parse key ~ `string` (default: `'QWxvaG9tb3JhIQ'`)
 * @returns `string` buffer | `'ERROR'` on failure
 */
export declare const _cr: (value: any, index?: any, key?: any) => string;
/**
 * Parse key value text ~ escapes/restores values delimiter (i.e. `'='`) and entries delimiter (i.e. `'\n'`)
 *
 * @param value - parse value text (`string`)
 * @param escape - whether to escape delimiters (default: `false` ~ restore)
 * @param value_delimiter - value delimiter (default: `'='` ~ e.g. `'key=value'`)
 * @param entries_delimiter - entries delimiter (default: `'\n'` ~ e.g. `'key=value\nkey2=value2'`)
 * @returns `string`
 */
export declare const _keyValue: (value: any, escape?: boolean, value_delimiter?: string, entries_delimiter?: string) => string;
/**
 * Parse serialized key values ~ (i.e. `'key=value\nkey2=value2'`)
 *
 * @param value - parse serialized text
 * @param escape - whether to escape delimiters (default: `false` ~ restore)
 * @param value_delimiter - value delimiter (default: `'='` ~ e.g. `'key=value'`)
 * @param entries_delimiter - entries delimiter (default: `'\n'` ~ e.g. `'key=value\nkey2=value2'`)
 * @returns `[key: string, value: string][]` entries list with unique keys
 */
export declare const _parseKeyValues: (value: any, escape?: boolean, value_delimiter?: string, entries_delimiter?: string) => [key: string, value: string][];
/**
 * Serialize key values ~ (i.e. `['key','value','key2','value2']` => `'key=value\nkey2=value2'`)
 *
 * @param values - parse values ~ (i.e. `string|string[]|[string,string][]|{[key:string]:string}[]`)
 * @param _key - specify entry `key` property name when `values` is `{[key:string]:string}[]`
 * @param _value - specify entry `value` property name when `values` is `{[key:string]:string}[]`
 * @returns `string` serialized key values
 */
export declare const _strKeyValues: (values: any, _key?: any, _value?: any, _value_delimiter?: string, _entries_delimiter?: string) => string;
/**
 * Text wrap lines on length limit
 *
 * @param text - parse text
 * @param max_length - max line length
 * @param word_break - whether to use word break (default `false`)
 * @param onAddLine - add line buffer handler callback ~ return modified line value or `undefined`|`null` to skip
 * @returns `string[]` text wrap lines
 */
export declare const _wrapLines: (text: any, max_length?: number, word_break?: boolean, onAddLine?: ((line: string, lines_buffer: string[]) => string | undefined) | undefined) => string[];
