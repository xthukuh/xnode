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
export const _bytesVal = (bytes: number, mode: 0|1 = 0, unit?: 'B'|'KB'|'MB'|'GB'|'TB'|'PB'|'EB'|'ZB'|'YB', places: number = 2, commas: boolean = false): number|string => {
	mode = _posInt(mode, 0, 1) ?? 0 as any;
	if (!(bytes = _posInt(bytes, 0) ?? 0)) return mode === 1 ? 0 : '0 B'; //-- zero
	const kb = 1024, units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
	const u: string = 'string' === typeof unit && units.includes(unit = unit.trim().toUpperCase() as any) ? unit as any : '';
	const i: number = u ? units.findIndex(v => v.toLowerCase() === u.toLowerCase()) : Math.floor(Math.log(bytes)/Math.log(kb));
	if (!(i >= 0 && i < units.length)) return mode === 1 ? bytes : bytes + ' B'; //-- unsupported size (defaults to bytes)
	let val: string|number = bytes/Math.pow(kb, i);
	if (mode === 1) return _round(val, places);
	return (commas ? _commas(val, places) : _round(val, places)) + ' ' + units[i];
};

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
export const _dec2base = (decimal: number, base: 2|8|16 = 2, group: number = 0): string => {
	let dec: number = _posInt(decimal, 0) ?? 0;
	if (dec === 0) return '0';
	base = [2, 8, 16].includes(base = _posInt(base, 2) ?? 2 as any) ? base : 2;
	const hex_chars: string[] = base === 16 ? '0123456789ABCDEF'.split('') : [];
	let val: string = '';
	while (dec > 0){
		let remainder = dec % base;
		val = (base === 16 ? hex_chars[remainder] : remainder) + val;
		dec = Math.floor(dec / base);
	}
	if ([2, 16].includes(base) && !!(group = _posInt(group, 0) ?? 0)){
		let buffer: string = '';
		while (val.length){
			let i = val.length - group;
			buffer = val.substring(i).padStart(group, '0') + (buffer ? ' ' : '') + buffer;
			val = val.substring(0, i);
		}
		val = buffer;
	}
	return val;
};

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
export const _dec2bin = (decimal: number, group: number = 0): string => _dec2base(decimal, 2, group);

/**
 * Parse binary to decimal
 * 
 * @example
 * _bin2dec('0111 1110') // 126
 * 
 * @param binary - parse binary text
 * @returns `number|undefined` ~ parsed decimal integer | `undefined` when invalid
 */
export const _bin2dec = (binary: string): number|undefined => {
	if (!('string' === typeof binary && /^[01]+$/.test(binary = binary.replace(/\s/g, '')))) return undefined; //-- invalid binary text
	let dec: number = 0, pow: number = 0;
	for (let i = binary.length - 1; i >= 0; i--){
		dec += parseInt(binary[i]) * Math.pow(2, pow);
		pow ++;
	}
	return dec;
};

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
export const _dec2hex = (decimal: number, group: number = 0): string => _dec2base(decimal, 16, group);

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
export const _hex2dec = (hex: string): number|undefined => {
	if (!('string' === typeof hex && /^[0-9A-F]+$/.test(hex = hex.replace(/0x/ig, '').replace(/\s/g, '').toUpperCase()))) return undefined; //-- invalid hexadecimal text
	const hex_map: {[key:string]: number} = Object.fromEntries('0123456789ABCDEF'.split('').map((v, i) => [v, i]));
	let dec = 0;
	for (let i = 0; i < hex.length; i ++){
		const val: number = hex_map[hex[i]];
		dec = dec * 16 + val;
	}
	return dec;
};

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
export const _dec2oct = (decimal: number): string => _dec2base(decimal, 8);

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
export const _oct2dec = (octal: string): number|undefined => {
	if (!('string' === typeof octal && /^[0-7]+$/.test(octal = octal.replace(/0o/ig, '').replace(/\s/g, '').toUpperCase()))) return undefined; //-- invalid octal text
	let dec = 0;
	for (let i = 0; i < octal.length; i ++){
		const val = (octal[i] as any) - 0;
		dec = dec * 8 + val;
	}
	return dec;
};

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
export const _base2dec = (value: string, base: 2|8|16 = 2): number|undefined => {
	base = [2, 8, 16].includes(base = _posInt(base, 2) ?? 2 as any) ? base : 2;
	if (base === 2) return _bin2dec(value);
	else if (base === 8) return _oct2dec(value);
	return _hex2dec(value);
};

/**
 * Convert degree to [radian](https://en.wikipedia.org/wiki/Radian)
 * - `2π rad = 360°` ∴ `radian = degree * π/180`
 * 
 * @param degrees - angle in degrees (i.e. 0 - 360°)
 * @returns `number` - radian
 */
export const _deg2rad = (degrees: number): number => {
	if (isNaN(degrees = _num(degrees))) throw new TypeError('The _deg2rad `degrees` argument is not a valid angle number value.');
	return degrees * (Math.PI / 180);
};

/**
 * Convert radian to [degree](https://en.wikipedia.org/wiki/Degree_(angle))
 * - `2π rad = 360°` ∴ `radian = degree * π/180`
 * 
 * @param radians - angle in radians (i.e. 0 - 360°)
 * @returns `number` - degree
 */
export const _rad2deg = (radians: number): number => {
	if (isNaN(radians = _num(radians))) throw new TypeError('The _rad2deg `radians` argument is not a valid angle number value.');
	return radians * (180 / Math.PI);
};

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
export const _distance = (latitude1: number, longitude1: number, latitude2: number, longitude2: number): number => {
	if (isNaN(latitude1 = _num(latitude1))) throw new TypeError('The _latLonDistance `latitude1` argument is not a valid latitude number value.');
	if (isNaN(longitude1 = _num(longitude1))) throw new TypeError('The _latLonDistance `longitude1` argument is not a valid longitude number value.');
	if (isNaN(latitude2 = _num(latitude2))) throw new TypeError('The _latLonDistance `latitude2` argument is not a valid latitude number value.');
	if (isNaN(longitude2 = _num(longitude2))) throw new TypeError('The _latLonDistance `longitude2` argument is not a valid longitude number value.');
	// const R = 6371e3; // Earth radius in meters
	const R = 6.378e+6; // Earth radius in meters
	const φ1 = latitude1 * Math.PI / 180; // φ, λ in radians
	const φ2 = latitude2 * Math.PI / 180;
	const Δφ = (latitude2 - latitude1) * Math.PI / 180;
	const Δλ = (longitude2 - longitude1) * Math.PI / 180;
	const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
						Math.cos(φ1) * Math.cos(φ2) *
						Math.sin(Δλ / 2) * Math.sin(Δλ / 2); // square of half the chord length between the points using the Haversine formula.
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); // angular distance in radians.
	return R * c; // distance in meters
};