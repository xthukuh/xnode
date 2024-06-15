import { bool } from '../types';
import { _jsonStringify } from './_json';

/**
 * Get unique string of random characters
 * 
 * @example
 * _xuid() => 'zt7eg4eu3b6mf66jga' 18
 * 
 * @returns `string` ~ alphanumeric lowercase
 */
export const _xuid = (): string => Math.random().toString(36).substring(2) + (new Date()).getTime().toString(36);

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
export const _uuid = (length?: number, template?: string): string => {
	const len: number = length !== undefined && !isNaN(parseInt(length + '')) && Number.isInteger(length) && length >= 7 && length <= 64 ? length : 16;
	const _get_uuid = () => {
		let buffer = '';
		while (buffer.length < len) buffer += _xuid();
		return buffer.substring(0, len);
	};
	let uuid: string = '';
	if ('string' === typeof template && (template = template.trim())){
		let append: boolean = true;
		const tmp = template.replace(/\{uuid\}/g, () => {
			if (append) append = false;
			return _get_uuid();
		});
		uuid = append ? tmp + _get_uuid() : tmp;
	}
	else uuid = _get_uuid();
	return uuid;
};

/**
 * Safely `string` cast value
 * - Returns ISO format timestamp for valid Date value
 * 
 * @param value  Cast value
 * @param _default  [default: `''`] Default result on failure
 * @returns `string`
 */
export const _string = (value: any, _default: string = ''): string => {
	let val: string = '';
	try {
		if (value instanceof Date && !isNaN(value.getTime())) val = value.toISOString();
		else val = String(value);
	}
	catch (e){
		val = _default;
	}
	return val;
};

/**
 * Safely `string` cast value if possible.
 * 
 * @param value
 * @returns `false|string` Cast result or `false` on failure
 * @returns value `string` | `false` on failure
 */
export const _stringable = (value: any): false|string => {
	const failed = `!${Date.now()}!`, val = _string(value, failed), pattern = /\[object \w+\]/;
	return !(val === failed || pattern.test(val)) ? val : false;
};

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
export const _str = (value: any, trim: boolean = false, stringify: boolean = false): string => {
	if ('string' !== typeof value){
		if (value === null || value === undefined) return '';
		else if ('object' === typeof value){
			if (Array.isArray(value)) return stringify ? _jsonStringify(value) : '';
			const tmp = _stringable(value);
			if (tmp === false) return stringify ? _jsonStringify(value) : '';
			else value = tmp;
		}
		else value = _string(value);
	}
	return trim ? _trim(value) : value;
};

/**
 * Normalize string by removing accents (i.e. "Amélie" => "Amelie")
 * 
 * @param value
 * @returns normalized `string`
 */
export const _strNorm = (value: any): string => _str(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/**
 * Escape regex operators from string
 * - i.e. `'\\s\n\r\t\v\x00~_!@#$%^&*()[]\\/,.?"\':;{}|<>=+-'` => `'\\s\n\r\t\v\x00\s~_!@#\\$%\\^&\\*\\(\\)\\[\\]\\\\/,\\.\\?"\':;\\{\\}\\|<>=\\+-'`
 * 
 * @param value
 * @returns escaped `string`
 */
export const _regEscape = (value: any): string => _str(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Escape string special characters
 * - i.e. `'\r\n\t\f\v\x00-\u00f3-\u1234-\xb4-\u000b-/\\'` => `'\\r\\n\\t\\f\\v\\x00-ó-ሴ-´-\\v-/\\\\'`
 * 
 * @param value
 * @returns escaped `string`
 */
export const _strEscape = (value: any): string => JSON.stringify(_str(value))
.replace(/\\u([\d\w]{4})/g, (m, s) => {
	const h = parseInt(s, 16);
	return h > 255 ? m : '\\' + encodeURIComponent(String.fromCharCode(h)).replace('%', 'x').replace('x0B', 'v');
})
.replace(/^"|"$/g, '')
.replace(/\\"/g, '"');

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
export const _sqlEscape = (value: any): string|number|boolean|null => {
	if (undefined === value || null === value) return null;
	else if ('boolean' === typeof value) return value;
	else if ('number' === typeof value) return !isNaN(value) ? value : null;
	if (!(value = _str(value, false, true))) return value;
	return value.replace(/\\/g, '\\\\')
	.replace(/\0/g, '\\0')
	.replace(/\n/g, '\\n')
	.replace(/\r/g, '\\r')
	.replace(/'/g, "\\'")
	.replace(/"/g, '\\"')
	.replace(/\x1a/g, '\\Z')
};

/**
 * Regex string trim characters
 * 
 * @param value  Trim value
 * @param chars  Strip characters [default: `' \r\n\t\f\v\x00\u200B\u200C\u200D\u200E\u200F\uFEFF'` (template `'{default}'`)]
 * @param rl  Trim mode (`''` => (default) trim right & left, `'r'|'right'` => trim right, `'l'|'left'` => trim left)
 * @returns trimmed `string`
 */
export const _trim = (value: any, chars: string = ' \r\n\t\f\v\x00\u200B\u200C\u200D\u200E\u200F\uFEFF', rl: ''|'r'|'l'|'right'|'left' = ''): string => {
	if (!(value = _str(value)) || !((chars = _str(chars)))) return value;
	chars = chars.replace(/\{default\}/, ' \r\n\t\f\v\x00\u200B\u200C\u200D\u200E\u200F\uFEFF');
	let trim_chars: string[] = [], d1 = 0, d2 = 0;
	for (const v of [...new Set([...chars])]){
		if (!v) continue;
		if (v === '-'){
			d1 = 1;
			continue;
		}
		if (v === '_'){
			d2 = 1;
			continue;
		}
		trim_chars.push(v);
	}
	if (d2) trim_chars.unshift('_');
	if (d1) trim_chars.unshift('-');
	const p = `[${_regEscape(trim_chars.join(''))}]+`;
	let pattern = `^${p}|${p}$`;
	if (['l', 'left'].includes(rl)) pattern = `^${p}`;
	else if (['r', 'right'].includes(rl)) pattern = `${p}$`;
	return value.replace(new RegExp(pattern, 'gs'), '');
};

/**
 * Regex string trim leading characters (left)
 * 
 * @param value Trim value
 * @param chars Strip characters [default: `' \n\r\t\f\v\x00'`] - use `'{default}'` to include defaults (i.e `'-{defaults}'` == `'- \n\r\t\f\v\x00'`)
 * @returns left trimmed `string`
 */
export const _ltrim = (value: any, chars: string = ' \r\n\t\f\v\x00'): string => _trim(value, chars, 'left');

/**
 * Regex string trim trailing characters (right)
 * 
 * @param value Trim value
 * @param chars Strip characters [default: `' \n\r\t\f\v\x00'`] - use `'{default}'` to include defaults (i.e `'-{defaults}'` == `'- \n\r\t\f\v\x00'`)
 * @returns right trimmed `string`
 */
export const _rtrim = (value: any, chars: string = ' \r\n\t\f\v\x00'): string => _trim(value, chars, 'right');

/**
 * Convert string to title case (i.e. "heLLo woRld" => "Hello World")
 * 
 * @param value  Parse string
 * @param keepCase  Disable lowercasing uncapitalized characters
 * @returns Title Case `string`
 */
export const _toTitleCase = (value: any, keepCase: bool = false): string => _str(value)
.replace(/\w\S*/g, match => match[0].toUpperCase()
+ (keepCase ? match.substring(1) : match.substring(1).toLowerCase()));

/**
 * Convert string to sentence case
 * 
 * @param value  Parse string
 * @param keepCase  Disable lowercasing uncapitalized characters
 * @returns Sentence case `string`
 */
export const _toSentenceCase = (value: any, keepCase: bool = false): string => {
	let buffer: string = '';
	for (let val of _str(value).split(/((?:\.|\?|!)\s*)/)){
		if (val.length){
			const first = val.charAt(0).toUpperCase();
			const rest = val.length > 1 ? val.slice(1) : '';
			val = first + (keepCase ? rest : rest.toLowerCase());
		}
		buffer += val;
	}
	return buffer;
};

/**
 * Convert value to snake case (i.e. 'HelloWorld' => 'hello_world')
 * - accents are normalized (i.e. "Test Amélie" => "test_amelie")
 * 
 * @param value  Parse string
 * @param trimTrailing  Trim trailing "_" (`false` = (default) disabled, `true` => trim right & left, `'r'|'right'` => trim right, `'l'|'left'` => trim left)
 * @returns snake_case `string`
 */
export const _toSnakeCase = (value: any, trimTrailing: boolean|'l'|'left'|'r'|'right' = false): string => {
	let res = _strNorm(_trim(value))
	.replace(/[A-Z]+/g, m => m[0].toUpperCase() + m.substring(1).toLowerCase())
	.replace(/\W+/g, ' ')
	.split(/ |\B(?=[A-Z])/).join('_').replace(/_+/g, '_').toLowerCase();
	if (res === '_') return '';
	if (/^_|_$/.test(res) && trimTrailing) res = _trim(res, '_', (['l','left','r','right'].includes(trimTrailing as any) ? trimTrailing : '') as any);
	return res;
};

/**
 * Convert value to slug case (i.e. 'HelloWorld' => 'hello-world')
 * 
 * @param value  Parse string
 * @returns slug-case `string`
 */
export const _toSlugCase = (value: any, trimTrailing: boolean|'l'|'left'|'r'|'right' = false): string => _toSnakeCase(value, trimTrailing).replace(/_/g, '-');

/**
 * Convert value to studly case (i.e. 'hello-world' => 'HelloWorld')
 * 
 * @param value  Parse string
 * @returns StudlyCase `string`
 */
export const _toStudlyCase = (value: any): string => {
	let buffer: string = '';
	for (const word of _toSnakeCase(value).split('_')){
		if (!word.length) continue;
		buffer += word[0].toUpperCase() + word.substring(1).toLowerCase();
	}
	return buffer;
};

/**
 * Convert value to camel case (i.e. 'hello-world' => 'helloWorld')
 * 
 * @param value  Parse string
 * @returns camelCase `string`
 */
export const _toCamelCase = (value: any): string => {
	let res = _toStudlyCase(value);
	if (res.length) res = res[0].toLowerCase() + res.substring(1);
	return res;
};

/**
 * Convert value to lower case sting
 * 
 * @param value
 * @returns lowercase `string`
 */
export const _toLowerCase = (value: any): string => _str(value).toLowerCase();

/**
 * Convert value to lower case sting
 * 
 * @param value
 * @returns UPPERCASE `string`
 */
export const _toUpperCase = (value: any): string => _str(value).toUpperCase();

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
export const _hashCode = (value: any): number => {
  let hash = 0;
  if (!(value = _str(value))) return hash;
  for (let i = 0; i < value.length; i ++){
    let chr = value.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; //Convert to 32bit integer
  }
  return hash;
};

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
export const _hashCodeStr = (value: any): string => {
	const code: string = _hashCode(value) + '', re = /^-/;
	return re.test(code) ? code.replace(re, 'n') : 'x' + code;
};

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
export const _hash53 = (value: any, seed: number = 0): number => {
	if (!(value = _str(value))) return 0;
	if (isNaN(seed)) seed = 0;
	let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
	for (let i = 0, ch; i < value.length; i++){
		ch = value.charCodeAt(i);
		h1 = Math.imul(h1 ^ ch, 2654435761);
		h2 = Math.imul(h2 ^ ch, 1597334677);
	}
	h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
	h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
	return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

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
export const _parseDataUri = (value: any): IDataUri|undefined => {
	if (!(value = _str(value, true))) return undefined;
	const re = /data:(?<mime>[\w/\-\.]+);(?<encoding>(charset=)?([^,]+)),(?<data>[^\s]+)/;
	const res: RegExpExecArray|null = re.exec(value);
	if (!res) return undefined;
	return {
		mime: res[1],
		encoding: res[2],
		charset: res[3] && res[4] || '',
		data: res[5],
	};
};

/**
 * Validate URL `string` (uniform resource locator)
 * - includes IP (v4) addresses
 * 
 * @param value - parse url `string` value
 * @param matchDataURI - validation includes data URI (i.e. 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAZABkAAD')
 * @returns `boolean` - valid url
 */
export const _isUrl = (value: any, matchDataURI: boolean = false): boolean => {
	if (!(value && 'string' === typeof value && value.trim())) return false;
	if (matchDataURI && _parseDataUri(value)) return true;
	const pattern = '^(https?:\\/\\/)?'  // protocol
	+ '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'  // domain name
	+ '((\\d{1,3}\\.){3}\\d{1,3}))'  // or IP (v4) address
	+ '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'  // port and path
	+ '(\\?[;&a-z\\d%_.~+=-]*)?' // query string
	+ '(\\#[-a-z\\d_]*)?$'; // fragment locator
	return new RegExp(pattern, 'i').test(value);
}
//REF: (yup url validation regex)
//let rUrl = /^((https?|ftp):)?\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;

/**
 * Validate email address `string`
 * 
 * @param value
 * @returns `boolean`
 */
export const _isEmail = (value: any): boolean => {
	if (!(value && 'string' === typeof value && value.trim())) return false;
	return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value.toLowerCase());
};
//REF: (yup email validation regex)
// let rEmail = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Parse csv data into 2d string array
 * 
 * @param text - parse text
 * @param delimiter - delimiter character (default: `','`)
 * @param br - new line (default: `'\n'`)
 * @returns `string[][]` ~ `[[...cols], ...rows]`
 */
export const _parseCsv = (text: string, delimiter?: string, br?: string): string[][] => {
	const n_sep = '\x1D'; const n_sep_re = new RegExp(n_sep, 'g');
	const q_sep = '\x1E'; const q_sep_re = new RegExp(q_sep, 'g');
	const c_sep = '\x1F'; const c_sep_re = new RegExp(c_sep, 'g');
	const delim: string = (delimiter = _str(delimiter, true)).length === 1 ? delimiter : ',';
	const field_re = new RegExp('(^|[' + delim + '\\n])"([^"]*(?:""[^"]*)*)"(?=($|[' + delim + '\\n]))', 'g');
	const lines: string[] = _str(text, true)
	.replace(/\r/g, '')
	.replace(/\n+$/, '')
	.replace(field_re, (_: string, p1: string, p2: string) => p1 + p2.replace(/\n/g, n_sep).replace(/""/g, q_sep).replace(/,/g, c_sep))
	.split(/\n/);
	const rows: string[][] = [];
	for (const line of lines){
		if (!line.length) continue;
		const row: string[] = [];
		for (const cell of line.split(delim)){
			row.push(cell.replace(n_sep_re, br ?? '\n').replace(q_sep_re, '"').replace(c_sep_re, ','));
		}
		rows.push(row);
	}
	return rows;
};

/**
 * Convert data to csv text
 * 
 * @param data - parse data
 * @param delimiter - delimiter character (default: `','`)
 * @param br - new line replace (default: `'\n'`)
 * @returns `string` csv text
 */
export const _toCsv = (data: string|string[]|string[][], delimiter?: string, br?: string): string => {
	const delim: string = (delimiter = _str(delimiter, true)).length === 1 ? delimiter : ',';
	const rows: string[][] = [];
	const _cell = (value: any): string => {
		let val: string = _str(value);
		if (!val.length) return val;
		if ('string' === typeof br && val.indexOf(br) > -1 && br !== '\n') val = val.replace(new RegExp(br, 'g'), '\n');
		val = val.replace(/\r/g, '').replace(/\n+$/, '').replace(/"/g, '""');
		if (val.indexOf(delim) > -1 || val.indexOf('"') > -1 || val.indexOf('\n') > -1 || /^\s+|\s+$/.test(val)) val = `"${val}"`;
		return val;
	};
	if (data && 'object' === typeof data && data[Symbol.iterator]){
		const iterables: any[] = [], values = Object.values([...data]);
		for (const v of values){
			if ('object' === typeof v && v[Symbol.iterator]) iterables.push(v);
		}
		if (iterables.length){
			for (const val of values){
				const v_row: string[] = [];
				for (const cell of val){
					v_row.push(_cell(cell as any));
				}
				rows.push(v_row);
			}
		}
		else {
			const v_row: string[] = [];
			for (const val of values){
				v_row.push(_cell(val as any));
			}
			rows.push(v_row);
		}
	}
	else if (data = _str(data, true)){
		const data_rows: string[][] = _parseCsv(data, delim, br);
		for (const data_row of data_rows){
			const d_row: string[] = [];
			for (const val of data_row){
				d_row.push(_cell(val));
			}
			rows.push(d_row);
		}
	}
	let csv: string = '', div = 0;
	for (let i = 0; i < rows.length; i ++){
		const line: string = rows[i].join(delim).trim();
		if (!line) continue;
		if (!div){
			div = 1;
			csv += line;
		}
		else csv += '\n' + line;
	}
	return csv;
};

/**
 * Split `string` value into parts ~ part and separator array (last entry's separator is `''`)
 * 
 * @param value - split string
 * @param separator - split separator (default: `undefined`)
 * @param limit - split items limit/count (default: `undefined`)
 * @returns `[part: string, separator: string | ''][]` split parts
 */
export const  _split = (value: any, separator?: string|RegExp, limit?: number): [part: string, separator: string | ''][] => {
	let val = _str(value);
	let re: RegExp|undefined = undefined;
	if ('string' === typeof separator) re = new RegExp(_regEscape(_str(separator)));
	else if (separator instanceof RegExp) re = separator;
	if (re) re = new RegExp(re, [...new Set(('g' + re.flags).split(''))].join(''));
	limit = limit && !isNaN(limit = parseInt(limit + '')) && limit >= 0 ? limit : undefined;
	const parts: string[] = re ? val.split(re, limit) : val.split(undefined as any, limit);
	const matches: string[] = re ? val.match(re) || [] : val.match(undefined as any) || [];
	const items: [part: string, separator: string | ''][] = [];
	for (let i = 0; i < parts.length; i ++){
		const part: string = parts[i];
		const separator: string = matches[i] ?? '';
		items.push([part, separator]);
	}
	return items;
};

/**
 * Get error text
 * 
 * @param error - parse error value
 * @returns `string`
 */
export const _errorText = (error: any): string => {
	const errors: {[key: string]: string} = {};
	const _parse = (item: any): void => {
		if (!('object' === typeof item && item)){
			const val = _str(item, true);
			if (val) errors[val.toLowerCase()] = val;
			return;
		}
		if (Array.isArray(item)){
			for (const val of item) _parse(val);
			return;
		}
		if (item instanceof Error){
			let name: string = _str(error.name, true);
			if (['Error', 'TypeError'].includes(name)) name = '';
			const message = _str(error.message, true);
			const val = message ? (name ? name + ' ': '') + message : '';
			if (val) errors[val.toLowerCase()] = val;
			return;
		}
		if (item.response) return _parse(item.response);
		if (item.body) return _parse(item.body);
		if (item.error) return _parse(item.error);
		if (item.message) return _parse(item.message);
		const val = _str(item, true, true);
		if (val) errors[val.toLowerCase()] = val;
	};
	_parse(error);
	return Object.values(errors).join('\n');
};

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
export const _textMaxLength = (value: any, max: number = 1000, mode: 0|1|2 = 0): string => {
	const len = (value = _str(value)).length, max_len = !isNaN(max = parseInt(max as any)) && max > 0 ? max : 1000;
	if (len <= max_len) return value;
	const append = mode === 2 ? `...(${value.length})` : mode === 1 ? '...' : '';
	const append_len = append.length, text_len = max_len - append_len;
	if (text_len > append_len && len > text_len) return value.substring(0, text_len) + append;
	return value.substring(0, max_len);
};

/**
 * Custom text encrypt/decrypt cypher ~ `v20231027232850`
 * 
 * @param value - text value ~ `string`
 * @param index - index offset ~ `integer` (default: `0`)
 * @param key - parse key ~ `string` (default: `'QWxvaG9tb3JhIQ'`)
 * @returns `string` buffer | `'ERROR'` on failure
 */
export const _cr = (value: any, index?: any, key?: any): string => {
	const text: string = [null, undefined].includes(value) ? '' : String(value);
	const offset: number = Number.isInteger(index = parseInt(index as any)) && index >= 0 ? index : 0;
	const pass: string = ([null, undefined].includes(key as any) ? '' : String(key)) || 'QWxvaG9tb3JhIQ';
	let buffer: string = '';
	for (let i = 0; i < text.length; i ++){
		const char: string = String.fromCharCode(text[i].charCodeAt(0) ^ (pass[(offset + i) % pass.length].charCodeAt(0) ** 2));
		buffer += char;
	}
	return buffer;
};

/**
 * Parse key value text ~ escapes/restores values delimiter (i.e. `'='`) and entries delimiter (i.e. `'\n'`)
 * 
 * @param value - parse value text (`string`)
 * @param escape - whether to escape delimiters (default: `false` ~ restore)
 * @param value_delimiter - value delimiter (default: `'='` ~ e.g. `'key=value'`)
 * @param entries_delimiter - entries delimiter (default: `'\n'` ~ e.g. `'key=value\nkey2=value2'`)
 * @returns `string`
 */
export const _keyValue = (value: any, escape: boolean = false, value_delimiter: string = '=', entries_delimiter: string = '\n'): string => {
	if (!(value = _str(value, true))) return value;
	const vd = '\x1E', value_delim = _str(value_delimiter) || '=';
	const ed = '\x1D', entries_delim = _str(entries_delimiter) || '\n';
	if (escape) return value.replace(new RegExp(value_delim, 'g'), vd).replace(new RegExp(entries_delim, 'g'), ed);
	return value.replace(new RegExp(vd, 'g'), value_delim).replace(new RegExp(ed, 'g'), entries_delim);
};

/**
 * Parse serialized key values ~ (i.e. `'key=value\nkey2=value2'`)
 * 
 * @param value - parse serialized text
 * @param escape - whether to escape delimiters (default: `false` ~ restore)
 * @param value_delimiter - value delimiter (default: `'='` ~ e.g. `'key=value'`)
 * @param entries_delimiter - entries delimiter (default: `'\n'` ~ e.g. `'key=value\nkey2=value2'`)
 * @returns `[key: string, value: string][]` entries list with unique keys
 */
export const _parseKeyValues = (value: any, escape: boolean = false, value_delimiter: string = '=', entries_delimiter: string = '\n'): [key: string, value: string][] => {
	let buffer: {[key: string]: [string, string]} = {}, parse_entries: -1|0|1 = -1; //-1 = undefined, 0 = disabled, 1 = enabled
	for (let item of _str(value, true).split('\n')){
		if (!(item = _str(item, true))) continue;
		const parts: string[] = item.trim().split('=');
		if (parse_entries < 0) parse_entries = parts.length >= 2 ? 1 : 0;
		const key: string = _keyValue(parts[0], escape, value_delimiter, entries_delimiter);
		const value: string = !parse_entries ? key : _keyValue(parts[1], escape, value_delimiter, entries_delimiter);
		if (key && value) buffer[key.toLowerCase()] = [key, value];
	}
	return Object.values(buffer);
};

/**
 * Serialize key values ~ (i.e. `['key','value','key2','value2']` => `'key=value\nkey2=value2'`)
 * 
 * @param values - parse values ~ (i.e. `string|string[]|[string,string][]|{[key:string]:string}[]`)
 * @param _key - specify entry `key` property name when `values` is `{[key:string]:string}[]`
 * @param _value - specify entry `value` property name when `values` is `{[key:string]:string}[]`
 * @returns `string` serialized key values
 */
export const _strKeyValues = (values: any, _key?: any, _value?: any, _value_delimiter: string = '=', _entries_delimiter: string = '\n'): string => {
	const buffer: {[key: string]: [string, string]} = {};
	const value_delimiter = _str(_value_delimiter) || '=';
	const entries_delimiter = _str(_entries_delimiter) || '\n';
	let key_prop: any = undefined, val_prop: any = undefined, mode: -1|0|1 = -1, same: boolean = true;
	const _set_mode = (item: any): void => {
		_key = _str(key_prop = _key, true);
		_value = _str(val_prop = _value, true);
		if (_key && !_value){
			_value = _key;
			val_prop = key_prop;
		}
		else if (_value && !_key){
			_key = _value;
			key_prop = val_prop;
		}
		if (Object(item) === item){
			if (!_key && !_value && Object(item) === item){
				if (item.hasOwnProperty('key')) val_prop = _value = key_prop = _key = 'key';
				if (item.hasOwnProperty('value')){
					if (!_key && item.hasOwnProperty('label')){
						val_prop = _value = 'label';
						key_prop = _key = 'value';
					}
					else key_prop = _key = val_prop = _value = 'value';
				}
			}
			mode = _str(key_prop, true) && _str(val_prop, true) && item.hasOwnProperty(key_prop) && item.hasOwnProperty(val_prop) ? 1 : 0;
		}
	};
	const _str_value = (val: any): string => _keyValue(val, true, value_delimiter, entries_delimiter);
	const _add_item = (item: any, _recurse: boolean): void => {
		if (Object(item) === item){
			if (Object(item[Symbol.iterator]) === item[Symbol.iterator]){
				const entries: any[] = [...item];
				if (!entries.length) return;
				if (_recurse && Object(entries[0]) === entries[0]) return void entries.forEach(v => _add_item(v, false));
				if (mode < 0) _set_mode(entries);
				const key: string = _str_value(entries[mode ? key_prop : 0]);
				const val: string = _str_value(entries[mode ? val_prop : 1]);
				if (key && val){
					if (key.toLowerCase() !== val.toLowerCase()) same = false;
					buffer[key.toLowerCase()] = [key, val];
				}
			}
			else {
				if (mode < 0) _set_mode(item);
				if (!mode) return;
				const key: string = _str_value(item[key_prop]);
				const val: string = _str_value(item[val_prop]);
				if (key && val){
					if (key.toLowerCase() !== val.toLowerCase()) same = false;
					buffer[key.toLowerCase()] = [key, val];
				}
			}
		}
		else if (_recurse){
			const text: string = _str(item, true);
			if (!text) return;
			const entries: any[] = _parseKeyValues(text, false, value_delimiter, entries_delimiter);
			return void (entries.length ? entries.forEach(v => _add_item(v, false)) : null);
		}
	};
	const items: any[] = Object(values) === values && Object(values[Symbol.iterator]) === values[Symbol.iterator] ? [...values] : [values];
	_add_item(items, true);
	return Object.values(buffer)
	.map(entry => same ? entry[0] : entry.join(value_delimiter))
	.join(entries_delimiter);
};

/**
 * Text wrap lines on length limit
 * 
 * @param text - parse text
 * @param max_length - max line length
 * @param word_break - whether to use word break (default `false`)
 * @param onAddLine - add line buffer handler callback ~ return modified line value or `undefined`|`null` to skip
 * @returns `string[]` text wrap lines
 */
export const _wrapLines = (text: any, max_length: number = 0, word_break: boolean = false, onAddLine?: (line:string,lines_buffer:string[])=>string|undefined): string[] => {
	const _onAddLine: ((line:string,lines_buffer:string[])=>string|undefined)|undefined = 'function' === typeof onAddLine ? onAddLine : undefined;
	const max: number = Number.isInteger(max_length = parseInt(max_length as any)) && max_length >= 0 ? max_length : 0;
	let lines_buffer: string[] = [], line_buffer: string[] = [];
	const _add_line = (line: string): void => {
		if (_onAddLine){
			const res: any = _onAddLine(line, lines_buffer);
			if ([undefined, null].includes(res)) return;
			line = _str(res);
		}
		lines_buffer.push(line);
	};
	const _parse_line = (line: string) => {
		if (!max) return _add_line(line);
		const _line_buffer_add = (word: string) => {
			const line_text: string = [...line_buffer, word].join(' ');
			if (line_text.length > max){
				if (word_break){ //-- word break
					let val: string = '', offset: number = 0;
					while ((val = line_text.substring(offset, offset + max)).length === max){
						_add_line(val);
						offset += max;
					}
					line_buffer = [val];
				}
				else {
					if (word.length > max){ //-- word break ~ longer than max
						let val: string = '', offset: number = 0;
						while ((val = line_text.substring(offset, offset + max)).length === max){
							_add_line(val);
							offset += max;
						}
						line_buffer = [val];
					}
					else { //-- wrap word
						if (line_buffer.length) _add_line([...line_buffer, ''].join(' '));
						if ((line_buffer = [word]).join(' ').length === max){
							_add_line(line_buffer.join(' '));
							line_buffer = [];
						}
					}
				}
			}
			else if (line_text.length === max){
				_add_line(line_text);
				line_buffer = [];
			}
			else line_buffer = [line_text];
		};
		for (const word of line.split(' ')) _line_buffer_add(word);
	};
	for (const line of _str(text).split('\n')) _parse_line(line);
	if (line_buffer) _add_line(line_buffer.join(' '));
	return lines_buffer;
};