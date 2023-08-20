import { bool } from '../types';
import { _jsonParse, _jsonStringify } from './_json';
import { _int, _num } from './_number';
import { _str } from './_string';

/**
 * Flatten array recursively
 * 
 * @param values
 */
export const _flatten = (values: any[]): any[] => values.flat(Infinity);

/**
 * Check if value has property
 * 
 * @param value  Search `object` value
 * @param prop  Find property
 * @param own  [default: `false`] As own property
 * 
 */
export const _hasProp = (value: any, prop: any, own: bool = false): boolean => {
	if (!('object' === typeof value && value)) return false;
	return Object.prototype.hasOwnProperty.call(value, prop) || (own ? false : prop in value);
};

/**
 * Check if object has properties
 * 
 * @param value  Search `object` value
 * @param props  Spread find properties
 * 
 */
export const _hasProps = (value: any, ...props: any): boolean => !props.length ? false : !props.filter((k: any) => !_hasProp(value, k)).length;

/**
 * Check if object has any of the properties
 * 
 * @param value  Search `object` value
 * @param props  Spread find properties
 * 
 */
export const _hasAnyProps = (value: any, ...props: any): boolean => !props.length ? false : !!props.filter((k: any) => _hasProp(value, k)).length;

/**
 * Check if value is a class function
 * 
 * @param value  Test value
 */
export const _isClass = (value: any): boolean => {
	if (!(value && value.constructor === Function) || value.prototype === undefined) return false;
	if (Function.prototype !== Object.getPrototypeOf(value)) return true;
	return Object.getOwnPropertyNames(value.prototype).length > 1;
};

/**
 * Check if value is a function (or class optionally)
 * 
 * @param value  Test value
 * @param orClass  [default: `false`] Includes class function
 */
export const _isFunc = (value: any, orClass: boolean = false): boolean => {
	return value && 'function' === typeof value && (orClass ? true : !_isClass(value));
};


/**
 * Get `[min, max]` compared and arranged
 * - Example: `_minMax(20, 10)` => `[10, 20]`
 * - Example: `_minMax(0.23, null)` => `[null, 0.23]`
 *  
 * @param a  Compare value 1
 * @param b  Compare value 2
 * @returns `[min, max]`
 */
export const _minMax = (a: any, b: any): [min: any, max: any] => {
	let min: any = a, max: any = b;
	if (a > b){
		min = b;
		max = a;
	}
	return [min, max];
};

/**
 * Flatten object values recursively to dot paths (i.e. `{a:{x:1},b:{y:2,z:[5,6]}}` => `{'a.x':1,'b.y':2,'b.z.0':5,'b.z.1':6}`)
 * 
 * @param value  Parse object
 * @param omit  Omit entry keys/dot paths
 * @returns `{[key: string]: any}`
 */
export const _dotFlat = (value: any, omit: string[] = []):{[key: string]: any} => {
	if (!(value && 'object' === typeof value)) return {};
	const _entries: [key: string, val: any][] = [];
	const _addEntries = (obj: any, _p_key: string) => {
		Object.entries(obj).forEach(entry => {
			const [k, v] = entry;
			const _key = `${(_p_key ? `${_p_key}.` : '')}${k}`;
			if (omit && Array.isArray(omit) && omit.length && (omit.includes(`${k}`) || omit.includes(_key))) return;
			if (v && 'object' === typeof v) _addEntries(v, _key);
			else _entries.push([_key, v]);
		});
	};
	_addEntries(value, '');
	return Object.fromEntries(_entries);
};

/**
 * Get validated object dot path (i.e. `'a.b.c'` to refer to `{a:{b:{c:1}}}`)
 * 
 * @param dot_path - dot separated keys
 * @param operations - supports operations (i.e. '!reverse'/'!slice=0') ~ tests dot keys using `/^[-_0-9a-zA-Z]+\=([^\=\.]*)$/` instead of default `/^[-_0-9a-zA-Z]+$/`
 * @param _failure - error handling ~ `0` = (default) disabled, '1' = warn error, `2` = warn and throw error
 * @returns `string` valid dot path
 */
export const _validDotPath = (dot_path: string, operations: boolean = false, _failure: 0|1|2 = 0): string => {
	try {
		if (!(dot_path = _str(dot_path, true))) throw new TypeError('Invalid dot path value.');
		const parts: string[] = dot_path.split('.').map(v => v.trim()).filter(v => v.length);
		if (!parts.length) throw new TypeError(`Invalid dot path format "${dot_path}".`);
		const buffer = [];
		for (let i = 0; i < parts.length; i ++){
			let tmp, part = parts[i];
			let valid: boolean = /^[-_0-9a-zA-Z]+$/.test(part);
			if (!valid && operations){
				if (['!reverse', '!slice'].includes(part)) valid = true;
				else if (part.indexOf('=') > -1){
					const _invalid = part.split(',')
					.filter(v => v.trim())
					.filter(v => !/^[-_0-9a-zA-Z]+\=([^\=\.]*)$/.test(v));
					if (!_invalid.length) valid = true;
				}
			}
			if (!valid) throw new TypeError(`Invalid dot path key "${part}".`);
			buffer.push(part);
		}
		return buffer.join('.');
	}
	catch (e){
		if (_failure){
			console.warn(e, {dot_path, operations});
			if (_failure === 2) throw e;
		}
		return '';
	}
};

/**
 * Get parsed `boolean` value
 * 
 * @param value - parse value
 * @param strict - strict mode ~ support only `boolean-like` value (i.e. `'true'|'false'|true|false|1|0`) returns `undefined` if unsupported when enabled.
 * @param trim - trim `string` value (default `true`)
 * @returns
 * - `boolean`
 * - `undefined` when invalid if `strict` is enabled
 * - `'false' => false` | `!!value` when strict is disabled
 */
export const _bool = (value: any, strict: boolean = false, trim: boolean = true): boolean|undefined => {
	if (trim && 'string' === typeof value) value = value.trim();
	if (strict && !['true', 'false', true, false, 1, 0].includes(value)) return undefined;
	return value === 'false' ? false : !!value;
};

/**
 * Resolve dot path object value ~ supports array operations chaining
 * 
 * @example
 * 
 * //simple usage
 * _dotGet('x', {x:1}) => 1
 * _dotGet('a.b.c', {a:{b:{c:1}}}) => 1
 * _dotGet('a.b.d', {a:{b:{c:1}}}, 'a.b.d', null) => null
 * _dotGet('a.0', {a:['x','y']}) => 'x'
 * 
 * //array reverse operation
 * _dotGet('0.!reverse', [[1,2,3]]) => [3,2,1]
 * 
 * //array slice operation
 * _dotGet('0.!slice', [[1,2,3]]) => [1,2,3]
 * 
 * //array slice negative `-number`
 * _dotGet([[1,2,3]], '0.-2') => [2,3]
 * 
 * //array `key=value` searching
 * _dotGet('0.a=2', [[{a:1,b:2},{a:2,b:3}]]) => {a:2,b:3}
 * _dotGet('0.a=1,b=2', [[{a:1,b:2,c:3}, {a:2,b:3,c:4}]]) => {a:1,b:2,c:3}
 * 
 * 
 * @param dot_path - dot separated keys ~ optional array operations
 * @param target - traverse object
 * @param _failure - error handling ~ `0` = (default) disabled, '1' = warn error, `2` = warn and throw error
 * @param _default - default result on failure
 * @returns `any` dot path match result
 */
export const _dotGet = (dot_path: string, target: any, _failure: 0|1|2 = 0, _default?: any): any => {
	try {
		const keys = (dot_path = _validDotPath(dot_path, true, _failure)).split('.');
		if (!keys.length) throw new TypeError('Invalid resolve dot path format.');
		let abort: boolean = false, value: any = keys.reduce((prev: any, key: string) => {
			if (abort) return prev; //not found
			if (prev && 'object' === typeof prev){
				if (_hasProp(prev, key)) return prev[key]; //key value
				if (Array.isArray(prev)){
					if (key === '!reverse') return prev.reverse(); //array reverse
					if (key === '!slice') return prev.slice(); //array slice
					
					//array slice `-number`
					let tmp: any;
					if ((tmp = _num(key, 0)) < 0 && Number.isInteger(tmp)) return prev.slice(tmp);

					//array search
					if (prev.length && key.indexOf('=') > -1){
						const search_entries = key.split(',')
						.filter(v => v.trim())
						.map(val => {
							let arr = val.split('=');
							if (arr.length !== 2) return [];
							let k = arr[0].trim();
							let v = decodeURIComponent(arr[1]);
							return k ? [k, _jsonParse(v, v)] : [];
						})
						.filter(v => v.length);
						let index = -1;
						if (search_entries.length) index = prev.findIndex(o => {
							const matches = search_entries.filter(v => _hasProp(o, v[0]) && o[v[0]] === v[1]);
							return matches.length && matches.length === search_entries.length;
						});
						if (index > -1) return prev[index];
						abort = true;
						return undefined;
					}
				}
			}
			
			//not found
			abort = true;
			return undefined;
		}, target);
		return !abort ? value : _default;
	}
	catch (e) {
		if (_failure){
			console.warn(e, {dot_path, target});
			if (_failure === 2) throw e;
		}
		return _default;
	}
};

/**
 * Get dot path value
 * 
 * @param dot_path - dot separated keys ~ optional array operations
 * @param target - traverse object
 * @param _failure - error handling ~ `0` = (default) disabled, '1' = warn error, `2` = warn and throw error
 * @returns ``
 */
export const _dotValue = <TResult = any>(dot_path: string, target: any, _failure: 0|1|2 = 0): TResult|undefined => {
	try {
		const keys = (dot_path = _validDotPath(dot_path, true, _failure)).split('.');
		if (!keys.length) throw new TypeError('Invalid resolve dot path format.');
		return keys.reverse().reduce((prev, key) => ({[key]: prev}), target) as (TResult|undefined);
	}
	catch (e) {
		if (_failure){
			console.warn(e, {dot_path, target});
			if (_failure === 2) throw e;
		}
		return undefined;
	}
};

// //TODO: dot path deep assign
// export const _dotAssign = (dot_path: string, target: any, value: any, array_object=false, throwable=false) => {
// 	let item = dotPathValue(path, value, throwable);
// 	return deepAssignGet(obj, [item], [], [], !!array_object);
// };

/**
 * Get dump value with limit max string length
 * 
 * @param value - parse value (`value = _jsonParse(_jsonStringify(value))`)
 * @param maxStrLength - max string length [default: `100`]
 * @returns `any` - parsed value
 */
export const _dumpVal = (value: any, maxStrLength: number = 100): any => {
	const minStrLength = 20;
	value = _jsonParse(_jsonStringify(value));
	maxStrLength = !(maxStrLength = _int(maxStrLength, 100)) ? 0 : (maxStrLength >= minStrLength ? maxStrLength : 100);
	const _maxStr = (v: any): any => {
		if (!('string' === typeof v && v.length > maxStrLength)) return v;
		const append = `...(${v.length})`;
		return v.substring(0, maxStrLength - append.length) + append;
	};
	const _parse = (val: any): any => {
		if (!!val && 'object' === typeof val){
			for (let k in val){
				if (!val.hasOwnProperty(k)) continue;
				val[k] = _parse(val[k]);
			}
		}
		else val = _maxStr(val);
		return val;
	};
	return _parse(value);
};