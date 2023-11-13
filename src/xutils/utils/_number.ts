import { bool } from '../types';

/**
 * Check if value is numeric
 * 
 * @param value  Parse value
 * @param booleans  Pass `boolean` values as numeric
 * @param blanks  Pass empty `string` values (because `!isNaN('') === true`)
 * @returns `boolean` is numeric
 */
export const _numeric = (value: any, booleans: bool = false, blanks: bool = false): boolean => {
	if ('number' === typeof value) return !isNaN(value);
	if ('boolean' === typeof value) return !!booleans;
	const v = String(value).trim();
	if (v === '') return !!blanks;
	return /(^[+-]?[0-9]+([.][0-9]+)?([eE][+-]?[0-9]+)?$)|(^[+-]?\.[0-9]+$)|(^[+-]?[0-9]+\.$)/.test(v);
};

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
export const _num = (value: any, _default: number = NaN): number => {
	
	//parse string value
	if ('string' === typeof value){
		
		//parse filled, single line text
		if ((value = value.trim()) && /^.*$/.test(value)){
			
			//match leading +/- operator prefix
			let prefix = '';
			let match = value.trim().match(/^([\+-])\s*(\d.*)$/);
			if (match){
				prefix = match[1]; //+|-
				value = match[2]; //value
			}

			//remove whitespace around [\d,\.]
			value = value.replace(/\s*([\.,])\s*/g, '$1');

			//match & remove "," thousand separator
			if (value.match(/^\d{1,3}(,\d{3})*(\.|(\.\d+))?$/)) value = value.replace(/,/g, '').trim();
			
			//validate number format - allow (#/#.#/.#/#.)
			if (/^\d+\.$|^\.\d+$|^\d+(\.\d+){0,1}$/.test(value)){
				
				//parse number & restore +/- operator prefix
				if (!isNaN(value = parseFloat(value)) && prefix) value = parseFloat(prefix + value);
			}
			else value = NaN;
		}
		else value = NaN; //invalid number string
	}
	else value = Number(value); //coerce number

	//valid safe number => result
	if (!isNaN(value = Number(value)) && value >= Number.MIN_SAFE_INTEGER && value <= Number.MAX_SAFE_INTEGER){
		
		//check & normalize float `3+` last zeros from 5th place ~ 0.011000000000000001 => 0.011
		let match = String(value).match(/^([\+-]?\d+\.\d{5,})(0{3,}\d*)$/);
		if (match) value = Number(match[1]);
		
		//result
		return value;
	}

	//invalid => default result
	return Number(_default);
};

/**
 * Get parsed safe positive `number` with optional within min/max limit check
 * 
 * @param value - parse number value
 * @param min - set min limit ~ enabled when `min` is a valid positive number
 * @param max - set max limit ~ enabled when `max` is a valid positive number
 * @returns `number` positive | `undefined` when invalid or out of `min/max` bounds
 */
export const _posNum = (value: any, min?: number, max?: number): number|undefined => {
	const val = _num(value);
	if (!(!isNaN(val) && val >= 0)) return undefined;
	if ('number' === typeof min && !isNaN(min) && min >= 0 && val < min) return undefined;
	if ('number' === typeof max && !isNaN(max) && max >= 0 && val > max) return undefined;
	return val;
};

/**
 * Get parsed safe `integer` value
 * 
 * @param value - parse number value
 * @param _default - result `number` when invalid (default `NaN`)
 * @returns `number` integer
 */
export const _int = (value: any, _default: number = NaN): number => {
	const val = Math.floor(_num(value, _default));
	return !isNaN(val) ? val : _default;
};

/**
 * Get parsed safe positive `integer` value with optional within min/max limit check
 * 
 * @param value - parse number value
 * @param min - set min limit ~ enabled when `min` is a valid positive number
 * @param max - set max limit ~ enabled when `max` is a valid positive number
 * @param _limit_default - (default: `false`) use min/max value when value goes beyond limit (e.g. `_posInt(150,0,100,true)` => `100`)
 * @returns `number` positive | `undefined` when invalid or out of `min/max` bounds
 */
export const _posInt = (value: any, min?: number, max?: number, _limit_default: boolean = false): number|undefined => {
	const val = _int(value);
	if (!(!isNaN(val) && val >= 0)) return undefined;
	if ('number' === typeof min && !isNaN(min) && min >= 0 && val < min) return _limit_default ? min : undefined;
	if ('number' === typeof max && !isNaN(max) && max >= 0 && val > max) return _limit_default ? max : undefined;
	return val;
};

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