import { bool } from '../types';

/**
 * Check if value is numeric
 * 
 * @param value  Parse value
 * @param booleans  Pass `boolean` values as numeric
 * @param blanks  Pass empty `string` values (because `!isNaN('') === true`)
 * @returns `boolean` is numeric
 */
export const _isNum = (value: any, booleans: bool = false, blanks: bool = false): boolean => {
	if ('number' === typeof value) return !isNaN(value);
	if ('boolean' === typeof value) return !!booleans;
	const v = String(value).trim();
	if (v === '') return !!blanks;
	return /(^[+-]?[0-9]+([.][0-9]+)?([eE][+-]?[0-9]+)?$)|(^[+-]?\.[0-9]+$)|(^[+-]?[0-9]+\.$)/.test(v);
};

/**
 * Convert value to normalized number
 * 
 * - Blank trimmed `string` value is considered `NaN` (i.e. "")
 * 
 * @param value  Parse value
 * @param _default  [default: `NaN`] Default result when parse result is `NaN`
 * @param fixFloat  [default: `true`] Whether to fix float zeros (i.e. `1.1/100` = `0.011000000000000001` => `0.011`)
 * @returns `number` parsed
 */
export const _toNum = (value: any, _default: number = NaN, fixFloat: bool = true): number => {
	let num = value;
	if ('number' !== typeof value){
		if ('string' === typeof value){
			let p = /^\s*([\+-])\s*/, matches = value.match(p); //match prefix +/-
			if (matches) value = value.replace(p, ''); //remove prefix +/-
			value = value.replace(/^\s*[\+-]/, '').trim(); //remove prefix +/-
			if (value.match(/^\d{1,3}(,\d{3})*(\.|(\.\d+))?$/)) value = value.replace(/,/g, '').trim(); //match and remove "," thousand separator
			if (!value.match(/^\d*(\.|(\.\d+))?$/)) value = 'x'; //invalidate invalid leading decimal (i.e. '.10')
			else if (matches) value = matches[1] + value; //restore prefix +/-
		}
		num = !isNaN(num = Number(value)) ? num : parseFloat(num); //parse number
	}
	if (!(num !== '' && num !== null && !isNaN(num = Number(num)))) return _default; //return default when value is not not numeric
	let val, matches, places = 5; //fix float - max 5 decimal places
	if (fixFloat && new RegExp(`\\.\\d*(0{${3}}\\d*)`).test(val = String(num)) && (matches = val.match(/\.(\d+)/))){ 
		let floats = matches[1], len = floats.length, n = -1, x = -1;
		for (let i = len - 1; i >= 0; i--){
			if (!Number(floats[i])){
				if (x < 0) x = i;
			}
			else if (x > -1){
				n = i;
				if (x - n >= places) break;
				else x = n = -1;
			}
		}
		if (n > -1 && x > -1 && (x - n >= places)) num = +val.substring(0, val.length - len + x + 1);
	}
	return num;
};

/**
 * Parse value to number (shorthand)
 * 
 * @param value  Parse value
 * @param _default  [default: `NaN`] Default result when parse result is `NaN`
 * @returns `number` parsed
 */
export const _num = (value: any, _default: number = NaN): number => _toNum(value, _default);

/**
 * Parse value to integer
 * 
 * @param value  Parse value
 * @param _default  [default: `NaN`] Default result when parse result is `NaN`
 * @returns `number` integer
 */
export const _int = (value: any, _default: number = NaN): number => parseInt(String(_toNum(value, _default)));

/**
 * Round number to decimal places
 * 
 * @param value  Parse value
 * @param places  [default: `2`] Decimal places
 * @returns `number` rounded
 */
export const _round = (value: number, places: number = 2): number => {
	if (isNaN(value)) return NaN;
	let p = 10 ** Math.abs(_int(places, 2));
	return Math.round((value + Number.EPSILON) * p) / p;
};

/**
 * Convert numeric value to comma thousand delimited string (i.e. `1000.4567` => `'1,000.45'`)
 * 
 * @param value  Parse value
 * @param places  [default: `2`] Round decimal places
 * @param zeros  Enable trailing `'0'` decimal places (i.e. `1000` => `'1,000.00'`)
 * @returns `string` Comma thousand delimited number (returns `""` if parsed `value` is `NaN`)
 */
export const _commas = (value: any, places: number = 2, zeros: bool = false): string => {
	const num = _round(_num(value), places = _int(places, 2));
	if (isNaN(num)){
		console.warn('[WARNING: `_commas`] NaN value:', value);
		return '';
	}
	let val = String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	if (places && zeros){
		if (val.indexOf('.') === -1) val += '.'.padEnd(places + 1, '0');
		else val = val.split('.').reduce<string[]>((prev, v, i) => {
			prev.push(i === 1 && v.length < places ? v.padEnd(places, '0') : v);
			return prev;
		}, []).join('.');
	}
	return val;
};

/**
 * Generate random `integer` number.
 * 
 * @param min  Min `integer`
 * @param max  Max `integer`
 * @returns  `number` Random `integer`
 */
export const _rand = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Convert px to rem (or reverse)
 * 
 * @param val - convert value [default: `1`]
 * @param reverse - convert rem to px
 * @param base - root px [default: `16`]
 * @returns `number`
 */
export const _px2rem = (val: number = 1, reverse: boolean =false, base: number = 16): number => {
	val = _num(val, 1);
	base = _num(base, 16);
	const unit = base === 16 ? 0.0625 : 16/base*0.0625;
	return reverse ? val/unit : val * unit;
};