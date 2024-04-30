import { bool } from '../types';
import { _jsonCopy, _jsonParse, _jsonStringify } from './_json';
import { _int, _num, _posInt } from './_number';
import { _errorText, _str, _string, _stringable, _textMaxLength, _wrapLines } from './_string';
import { _isBuffer } from '../3rd-party';

/**
 * Get all property descriptors
 * - API ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
 * 
 * @param value - parse value object
 * @returns `{[key: string|number|symbol]: any}` ~ {property => descriptors} object
 */
export const _getAllPropertyDescriptors = (value: any): {[key: string|number|symbol]: any} => {
	if ([null, undefined].includes(value)) return {};
	const proto = Object.getPrototypeOf(value);
	return {..._getAllPropertyDescriptors(proto), ...Object.getOwnPropertyDescriptors(value)};
};

/**
 * Get all value properties
 * 
 * @param value - parse value object
 * @param statics - include `static` class properties
 * @returns `(string|number|symbol)[]` - found own/prototype/symbol properties | `[]` when none found
 */
export const _getAllProperties = (value: any, statics: boolean = false): (string|number|symbol)[] => {
	if ([null, undefined].includes(value)) return []; //ignore null/undefined
	const props = new Set<string|number|symbol>(); //properies

	//add own property names
	for (const v of Object.getOwnPropertyNames(value)) props.add(v); //own
	
	//fn => get keys helper
	const __get_keys = (obj: any): (string|number|symbol)[] => {
		const keys: (string|number|symbol)[] = [];
		for (let key in obj) keys.push(key);
		return keys;
	};

	//fn => get properties helper
	const __get_props = (val: any): (string|number|symbol)[] => __get_keys(_getAllPropertyDescriptors(val)).concat(Object.getOwnPropertySymbols(val));

	//excluded default props
	const excluded_props: (string|number|symbol)[] = [...new Set([
		
		//Function
		...__get_props(Function.prototype),
		...(!statics ? [] : __get_props(Function)),

		//Object
		...__get_props(Object.prototype),
		...(!statics ? [] : __get_props(Object)),
	])];

	//fn => add props helper
	const __add_props = (val: any): void => {
		for (const v of __get_props(val)){
			if (!excluded_props.includes(v)) props.add(v);
		}
	}

	//add props
	__add_props(value);
	if (statics) __add_props(Object(value).constructor);

	//result
	return [...props];
};

/**
 * Check if value has property
 * 
 * @param value - parse `object` value
 * @param prop - property name
 * @param own  [default: `false`] As own property
 * @returns `boolean`
 */
export const _hasProp = (value: any, prop: any, own: bool = false): boolean => {
	if (!('object' === typeof value && !!value)) return false;
	return Object.prototype.hasOwnProperty.call(value, prop) || (own ? false : prop in value);
};

/**
 * Check if object has properties
 * 
 * @param value - parse `object` value
 * @param props - property names
 * @returns `boolean`
 */
export const _hasProps = (value: any, ...props: any[]): boolean => {
	if (!('object' === typeof value && !!value)) return false;
	if (!props.length) return false;
	for (const key of props){
		if (!_hasProp(value, key)) return false;
	}
	return true;
};

/**
 * Check if object has any of the properties
 * 
 * @param value - parse `object` value
 * @param props - property names
 * @returns `false|any[]`
 */
export const _hasAnyProps = (value: any, ...props: any[]): false|any[] => {
	if (!('object' === typeof value && !!value)) return false;
	if (!props.length) return false;
	const found: Set<any> = new Set();
	for (const key of props){
		if (_hasProp(value, key)) found.add(key);
	}
	return found.size ? [...found] : false;
};

/**
 * Property interface ~ see `_getProp()`
 */
export interface IProperty {
	
	/**
	 * - property match
	 */
	match: any;

	/**
	 * - found property
	 */
	key: any;

	/**
	 * - property value
	 */
	value: any;

	/**
	 * - property exists state
	 * - `0` = not found
	 * - `1` = own property
	 * - `2` = not own property
	 */
	exists: 0|1|2|false;
}

/**
 * Get value property
 * 
 * @param value - parse value
 * @param match - match property
 * @param ignoreCase - whether to ignore property name case
 * @param own - whether property is value's own ~ `value.hasOwnProperty`
 * @returns `IProperty` ~ `{exists:boolean; name:string; value:any;}`
 */
export const _getProp = (value: any, match: any, ignoreCase: bool = false): IProperty => {
	const property: IProperty = {
		match,
		key: undefined,
		value: undefined,
		exists: 0,
	};
	const props = _getAllProperties(value, false);
	if (props.includes(match)){
		property.key = match;
		property.value = value[match];
		property.exists = value.hasOwnProperty(match) ? 1 : 2;
		return property;
	}
	const text_match = _stringable(match);
	if (text_match !== false){
		if (props.includes(match = text_match)){
			property.key = match;
			property.value = value[match];
			property.exists = value.hasOwnProperty(match) ? 1 : 2;
			return property;
		}
		if (ignoreCase){
			for (const prop of props){
				const key = _stringable(prop);
				if (key === false) continue;
				if (key.toLowerCase() === match.toLowerCase()){
					property.key = key;
					property.value = value[key];
					property.exists = value.hasOwnProperty(match) ? 1 : 2;
					return property;
				}
			}
		}
	}
	return property;
};

/**
 * Check if value is a class function
 * 
 * @param value - parse value
 */
export const _isClass = (value: any): boolean => {
	if (!(value && value.constructor === Function) || value.prototype === undefined) return false;
	if (Function.prototype !== Object.getPrototypeOf(value)) return true;
	return Object.getOwnPropertyNames(value.prototype).length > 1;
};

/**
 * Check if value is a `function`
 * 
 * @param value - parse value
 * @param orClass - (default: `false`) include `class` objects
 * @returns `boolean`
 */
export const _isFunc = (value: any, orClass: boolean = false): boolean => {
	return value && 'function' === typeof value && (orClass ? true : !_isClass(value));
};

/**
 * Get `[min, max]` compared and arranged in order
 * - Example: `_minMax(20, 10)` => `[10, 20]`
 * - Example: `_minMax(0.23, null)` => `[null, 0.23]`
 *  
 * @param a - first value
 * @param b - second value
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
 * Flatten `object` values recursively to dot paths
 * 
 * @example
 * _dotFlat({a:{x:1},b:{y:2,z:[5,6]}}) //{'a.x':1,'b.y':2,'b.z.0':5,'b.z.1':6}
 * 
 * @param value - parse `object` value
 * @param omit - omit entry keys/dot paths
 * @returns `{[key: string]: any}`
 */
export const _dotFlat = (value: any, omit: string[] = []):{[key: string]: any} => {
	if (!(value && 'object' === typeof value)) return {};
	const _entries: [key: string, val: any][] = [];
	const _addEntries = (obj: any, _p_key: string) => {
		for (const entry of Object.entries(obj)){
			const [k, v] = entry;
			const _key = `${(_p_key ? `${_p_key}.` : '')}${k}`;
			if (omit && Array.isArray(omit) && omit.length && (omit.includes(`${k}`) || omit.includes(_key))) continue;
			if (v && 'object' === typeof v) _addEntries(v, _key);
			else _entries.push([_key, v]);
		}
	};
	_addEntries(value, '');
	return Object.fromEntries(_entries);
};

/**
 * Unflatten dot flattened `object` ~ reverse of `_dotFlat`
 * 
 * @example
 * _dotInflate({'a.x':1,'b.y':2,'b.z.0':5,'b.z.1':6}) //{a:{x:1},b:{y:2,z:[5,6]}}
 * 
 * @param value - parse value ~ `{[dot_path: string]: any}`
 * @returns `{[key: string]: any}` parsed result | `{}` when value is invalid
 */
export const _dotInflate = (value: any): {[key: string]: any} => {
	const entries: [string, any][] = Object.entries(_dotFlat(value));
	const buffer: {[key: string]: any} = {};
	for (const [path, path_value] of entries){
		const keys = path.split('.');
		if (keys.length === 1){
			const key = keys[0];
			buffer[key] = path_value;
			continue;
		}
		const item = keys.slice().reverse().reduce((prev, key) => ({[key]: prev}), path_value);
		let keys_item: any = item;
		let keys_buffer: any = buffer;
		for (let i = 0; i < keys.length; i ++){
			const key = keys[i];
			const val = keys_item = keys_item[key];
			if (!keys_buffer.hasOwnProperty(key)) keys_buffer[key] = val;
			keys_buffer = keys_buffer[key];
		}
	}
	const _norm = (val: any): any => {
		if (Object(val) !== val) return val;
		let keys: any, len = 0;
		if ((len = (keys = Object.keys(val)).length) && Object.keys([...Array(len)]).join(',') === keys.join(',')) val = Object.values(val);
		for (const key in val) val[key] = _norm(val[key]);
		return val;
	};
	return _norm(buffer);
};

/**
 * Get validated object dot path (i.e. `'a.b.c'` to refer to `{a:{b:{c:1}}}`)
 * 
 * @param dot_path - dot separated keys
 * @param operations - supports operations (i.e. '!reverse'/'!slice=0') ~ tests dot keys using `/^[-_0-9a-zA-Z]+\=([^\=\.]*)$/` instead of default `/^[-_0-9a-zA-Z]+$/`
 * @param _failure - `FailError` mode ~ `0` = silent (default) | `1` = logs warning | `2` = logs error | `3` = throws error
 * @returns `string` valid dot path
 */
export const _validDotPath = (dot_path: string, operations: boolean = false, _failure: 0|1|2|3 = 0): string => {
	try {
		if (!(dot_path = _str(dot_path, true))) throw new TypeError('Invalid dot path value.');
		const parts: string[] = [];
		for (let v of dot_path.split('.')){
			if (!!(v = v.trim())) parts.push(v);
		}
		if (!parts.length) throw new TypeError(`Invalid dot path format "${dot_path}".`);
		const buffer = [];
		for (let i = 0; i < parts.length; i ++){
			let part = parts[i];
			let valid: boolean = /^[-_0-9a-zA-Z]+$/.test(part);
			if (!valid && operations){
				if (['!reverse', '!slice'].includes(part)) valid = true;
				else if (part.indexOf('=') > -1){
					const _invalid: string[] = [];
					for (let v of part.split(',')){
						if ((v = v.trim()) && !/^[-_0-9a-zA-Z]+\=([^\=\.]*)$/.test(v)) _invalid.push(v);
					}
					if (!_invalid.length) valid = true;
				}
			}
			if (!valid) throw new TypeError(`Invalid dot path key "${part}".`);
			buffer.push(part);
		}
		return buffer.join('.');
	}
	catch (e){
		new FailError(e, _failure, {dot_path, operations});
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
 * _dotGet('x', {'x':1}) => 1
 * _dotGet('a.b.c', {'a':{'b':{'c':1}}}) => 1
 * _dotGet('a.b.d', {'a':{'b':{'c':1}}}) => null
 * _dotGet('a.0', {'a':['x','y']}) => 'x'
 * 
 * //array reverse operation (done slice copy)
 * _dotGet('0.!reverse', [[3,2,1]]) => [3,2,1]
 * 
 * //array slice operation
 * _dotGet('0.!slice', [[1,2,3]]) => [1,2,3]
 * 
 * //array slice negative `-number`
 * _dotGet('0.-2', [[1,2,3]]) => [2,3]
 * 
 * //array `key=value` searching
 * _dotGet('0.a=2', [[{'a':1,'b':2},{'a':2,'b':3}]]) => {'a':2,'b':3}
 * _dotGet('0.a=1,b=2', [[{'a':1,'b':2,'c':3},{'a':2,'b':3,'c':4}]]) => {'a':1,'b':2,'c':3}
 * 
 * @param path - dot separated keys ~ optional array operations
 * @param target - traverse object
 * @param ignoreCase - whether to ignore case when matching keys (default: `false`)
 * @param _failure - `FailError` mode ~ `0` = silent (default) | `1` = logs warning | `2` = logs error | `3` = throws error
 * @param _default - default result on failure
 * @returns `any` dot path match result
 */
export const _dotGet = (path: string, target: any, ignoreCase: boolean = false, _failure: 0|1|2|3 = 0, _default?: any): any => {
	try {
		const keys = (path = _validDotPath(path, true, _failure)).split('.');
		if (!keys.length) throw new TypeError('Invalid resolve dot path format.');
		let abort: boolean = false, value: any = keys.reduce((prev: any, key: string) => {
			if (abort) return prev; //not found
			if (prev && 'object' === typeof prev){
				const prop = _getProp(prev, key, ignoreCase);
				if (prop.exists) return prop.value; //key value
				if (Array.isArray(prev)){
					if (key === '!reverse') return prev.slice().reverse(); //array reverse (slice)
					if (key === '!slice') return prev.slice(); //array slice
					
					//array slice `-number`
					let tmp: any;
					if ((tmp = _num(key, 0)) < 0 && Number.isInteger(tmp)) return prev.slice(tmp);
					
					//array search
					if (prev.length && key.indexOf('=') > -1){
						const search_entries: [key: string, val: string][] = [];
						for (let val of key.split(',')){
							if (!(val = val.trim())) continue;
							let arr = val.split('=');
							if (arr.length !== 2) return [];
							let k = arr[0].trim();
							let v = decodeURIComponent(arr[1]);
							if (k) search_entries.push([k, _jsonParse(v, v)]);
						}
						let index = -1;
						if (search_entries.length){
							for (let i = 0; i < prev.length; i ++){
								const entry = prev[i];
								const matches: [key: string, val: string][] = [];
								for (const v of search_entries){
									const prop = _getProp(entry, v[0], ignoreCase);
									if (prop.exists && prop.value === v[1]) matches.push(v);
								}
								if (matches.length && matches.length === search_entries.length){
									index = i;
									break;
								}
							}
						}
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
		new FailError(e, _failure, {path, target, ignoreCase, _default}, 'DotGetError');
		return _default;
	}
};

/**
 * @deprecated
 * Get coerced `number/string/JSON` value ~ `value.valueOf()`
 * 
 * @param value - parse value
 * @returns `any` ~ `object`|`undefined`|`boolean`|`number`|`bigint`|`string`|`symbol`
 */
export const _valueOf = (value: any): any => {
	if (!(value && 'object' === typeof value)) return value;
	let val: any = value.valueOf();
	if (val === value){
		if (Object(value[Symbol.toPrimitive]) === value[Symbol.toPrimitive] && !isNaN(val = Number(value))) return val; //hint number
		if ((val = _stringable(value)) !== false) return val; //hint string | value.toString()
		if ('function' === typeof value.toJSON && (val = value.toJSON()) !== value) return val; //value.toJSON()
	}
	return val; //value.valueOf()
};

/**
 * Check if value is empty ~ `null`/`undefined`/`NaN`/`''`/`{}`/`![...value]`
 * 
 * @param value - parse value
 * @param trim - trim whitespace ~ when value is `string/Buffer`
 * @returns `boolean`
 */
export const _empty = (value: any, trim: boolean = false): boolean => {
	if ([null, undefined, NaN, ''].includes(value)) return true; //default empty
	if (['function', 'boolean', 'number'].includes(typeof value)) return false; //function/boolean/number - ignore
	if ('string' === typeof value || _isBuffer(value)) return !_str(value, trim).length; //string/Buffer - !length
	if ('object' !== typeof value) return false; //non object - ignore
	if (value instanceof Map || value instanceof Set) return !value.size; //Map/Set - !size
	if (Array.isArray(value)) return !value.length; //Array - !length
	if (Object(value[Symbol.iterator]) === value[Symbol.iterator]) return ![...value].length; //value[Symbol.iterator] - !length
	if (!_getAllProperties(value).length) return true; //has no self properties
	return false; //ignore
};

/**
 * Check if value can be iterated ~ `[...value]`
 * 
 * @param value - parse value
 * @param _async - using `[Symbol.asyncIterator]` (default `false` ~ `[Symbol.iterator]`)
 * @returns `boolean`
 */
export const _iterable = (value: any, _async: boolean = false): boolean => 'function' === typeof value?.[_async ? Symbol.asyncIterator : Symbol.iterator];

/**
 * Validate `Object` value
 * 
 * @param value - parse value
 * @param _filled - must not be empty `{}`
 * @returns `boolean`
 */
export const _isObject = (value: any, _filled: boolean = false): boolean => !!value && 'object' === typeof value && Object.getPrototypeOf(value) === Object.prototype && (_filled ? !_empty(value) : true);

/**
 * Validate values iterable array list
 * 
 * @param value - parse value
 * @param _mode - parse mode
 * - `0` = (default) `[Symbol.iterator].name` is 'values'|'[Symbol.iterator]'
 * - `1` = `Array.isArray`
 * - `2` = is iterable `[Symbol.iterator]`
 * @param _filled - must not be empty `[]`
 * @returns `boolean`
 */
export const _isArray = (value: any, _filled: boolean = false, _mode: 0|1|2 = 0): boolean => {
	_mode = [0, 1, 2].includes(_mode = parseInt(_mode as any) as any) ? _mode : 0;
	if (!Array.isArray(value)){
		if (_mode === 1) return false;
		const it = value?.[Symbol.iterator];
		if (Object(it) !== it) return false;
		if (_mode !== 2 && !['values', '[Symbol.iterator]'].includes(it.name)) return false;
	}
	try {
		const len = value.length ?? [...value].length;
		if (!(Number.isInteger(len) && len >= 0)) return false;
		return _filled ? !!len : true;
	}
	catch (e) {
		return false;
	}
};

/**
 * Object array values
 * 
 * @param value - parse array value
 * @param entries - enable get entries (i.e. `[key: any, value: any][]`) instead of default values (i.e. `any[]`)
 * @param object - enable get `Object.values(value)`/`Object.entries(value)`
 * @param flatten - flatten depth ~ `Array.flat` depth (alias: `-1` => `Array.flat(Infinity)`, `true|null` => `Array.flat()`)
 * @returns
 * - `any[]` values or `[key: any, value: any][]` when `entries` argument is `true`
 * - `[value]` when `value` argument is not iterable or arrayable
 * - `[]` when `value` argument is empty ~ `[]`/`{}`/`undefined`
 */
export const _values = (value: any, entries: boolean = false, object: boolean = false, flatten?: number|boolean|null): any[] => {
	let items: any[] = value === undefined ? [] : entries ? [['0', value]] : [value];
	if (value && 'object' === typeof value && 'function' !== typeof value){
		if (Object(value[Symbol.iterator]) === value[Symbol.iterator]){
			const has_entries = (items = [...value]).length && items.findIndex(v => !(Array.isArray(v) && v.length === 2 && Object.keys(v) + '' === '0,1')) < 0;
			if (entries) items = has_entries ? items : Object.entries(items);
			else if (has_entries){
				const values: any[] = [];
				for (const v of items) values.push(v[1]);
				items = values;
			}
		}
		else if (object){
			const arr = Object.entries(value);
			if (arr.length || (_empty(value) && _isObject(value))){
				if (!entries && arr.length){
					const values: any[] = [];
					for (const v of arr) values.push(v[1]);
					items = values; 
				}
				else items = arr;
			}
		}
		else if (_empty(value) && _isObject(value)) items = []; //{}
	}
	if ('undefined' !== typeof flatten){
		let depth: any = flatten;
		if (flatten === -1) depth = Infinity;
		else if ([null, true].includes(depth)) depth = undefined;
		items = items.flat(depth);
	}
	return items;
};

/**
 * Get dump value with limit max string length
 * 
 * @param value - parse value
 * @param maxStrLength - max string length [default: `200`]
 * @param first - summarize object array to count and first entry (i.e. `{count:number,first:any}`) 
 * @returns `any` - dump value
 */
export const _dumpVal = (value: any, maxStrLength: number = 200, first: boolean = false): any => {
	const minStrLength = 20;
	value = _jsonCopy(value);
	maxStrLength = !(maxStrLength = _int(maxStrLength, 200)) ? 0 : (maxStrLength >= minStrLength ? maxStrLength : 200);
	const _maxStr = (v: any): any => {
		if (!('string' === typeof v && v.length > maxStrLength)) return v;
		const append = `...(${v.length})`;
		return v.substring(0, maxStrLength - append.length) + append;
	};
	const _get_first = (val: any): any => {
		if (Array.isArray(val)){
			let same_keys = 1, prev_keys = '';
			for (let i = 0; i < val.length; i ++){
				const v = val[i];
				if (Object(v) !== v){
					same_keys = 0;
					break;
				}
				const keys = Object.keys(v);
				if (keys.length){
					same_keys = 0;
					break;
				}
				const keys_val = keys.join(',');
				if (!i) prev_keys = keys_val;
				else if (keys_val !== prev_keys){
					same_keys = 0;
					break;
				}
			}
			if (same_keys && val.length) return {count: val.length, first: _get_first(val[0])};
		}
		return val;
	};
	const _parse = (val: any): any => {
		if ('object' === typeof val && val){
			for (let k in val){
				if (!val.hasOwnProperty(k)) continue;
				val[k] = _parse(val[k]);
			}
		}
		else val = _maxStr(val);
		return val;
	};
	return _parse(first ? _get_first(value) : value);
};

/**
 * Sort mode `type` ~ `1|-1|'asc'|'desc'|'ascending'|'descending'`
 */
export type TSortMode = 1|-1|'asc'|'desc'|'ascending'|'descending';

/**
 * Sort order `type` ~ `-1` (before) | `1` (after) | `0` (equal)
 */
export type TSortOrder = -1|1|0;

/**
 * Sort `Array` **slice** values
 * - returns new array (i.e. `array.slice().sort(...)` does not affect original arrangement)
 * 
 * @param array - sort `Array`
 * @param mode - sort mode
 * @param onCompare - custom compare callback
 * @param localeCompareConfig - method config [`String.localeCompare`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare) (default: `{locales:'en',options:{sensitivity:'base'}}`) ~ [options.sensitivity](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare)
 * @returns Sorted `T[]`
 */
export const _sort = <T = any>(
	array: T[],
	mode?: TSortMode|{[key:string]:TSortMode}|[string,TSortMode]|[string,TSortMode][],
	onCompare?: (a:any,b:any,key?:string)=>TSortOrder|[a:any,b:any],
	localeCompareConfig?: {locales?:any,options?:any}
): T[] => {

	try {
		
		// parse args
		const items = [...array].slice();
		if (!items.length) return items; //<< cancel ~ empty
		const sort_mode: any = mode;
		const locale_compare_config: {locales?:any,options?:any} = {
			locales: localeCompareConfig?.locales || 'en',
			options: {sensitivity: 'base', ...Object(localeCompareConfig?.options)},
		};

		// onCompare callback
		const _on_compare: undefined|((a:any,b:any,key?:string)=>TSortOrder|[a:any,b:any]) = 'function' === typeof onCompare ? onCompare : undefined;
		
		// fn => helper ~ sort compare
		const _sort_compare = (a: any, b: any, key?: string): number => {
			let x: any = a, y: any = b;
			if (_on_compare){
				const result: any = _on_compare(a, b, key);
				const val: any = parseInt(result);
				if ([-1,1,0].includes(val)) return val;
				x = result?.[0] ?? x;
				y = result?.[1] ?? y;
			}
			let val = 0, str = 0;
			if ('string' === typeof x && 'string' === typeof y && 'function' === typeof x.localeCompare){
				str = 1;
				val = x.localeCompare(y, locale_compare_config.locales, locale_compare_config.options);
			}
			else val = x > y ? 1 : x < y ? -1 : 0;
			return val;
		};

		// fn => helper ~ sort mode order
		const _sort_order = (smode: any): number => {
			let val: any = smode ?? 1;
			if ('string' === typeof val){
				if (!(val = val.trim())) return 1;
				if (val.toLowerCase().startsWith('asc')) return 1;
				if (val.toLowerCase().startsWith('desc')) return -1;
			}
			if ((val = parseInt(val)) === -1) return -1;
			if (val !== 1) console.warn(`[-] unsupported _sort \`mode\` value (${smode}).`);
			return 1;
		};

		// fn => helper ~ do compare
		const _do_compare = (a: any, b: any, smode: any, key?: string): number => {
			const scompare = _sort_compare(a, b, key);
			const sorder = _sort_order(smode);
			return scompare * sorder;
		};

		// fn => helper ~ create sort method
		const _sort_method = ():((a:any,b:any)=>number) => {
			const sort_map: Map<string, string> = new Map();
			let entry:[string,string]|undefined = undefined;
			if (Object(sort_mode) === sort_mode){
				const _sort_entry = (v: any[], k=''): [string,string]|undefined => Array.isArray(v) && 'string' === typeof v[0] && !!(k = v[0].trim()) ? [k, (v[1] ?? '').trim() || 'asc'] : undefined;
				if ('function' === typeof sort_mode[Symbol.iterator]){
					const items: any[] = [...sort_mode];
					if (!!(entry = _sort_entry(items))) sort_map.set(entry[0], entry[1]); // [string,TSortMode]
					else for (const item of items){ // [string,TSortMode][]
						if (!!(entry = _sort_entry(item))) sort_map.set(entry[0], entry[1]);
					}
				}
				else for (const item of Object.entries(sort_mode)){ // {[string]: TSortMode}
					if (!!(entry = _sort_entry(item))) sort_map.set(entry[0], entry[1])
				}
			}
			if (!sort_map.size) return (a, b) => _do_compare(a, b, sort_mode);
			const sort_entries: [string,string][] = [...sort_map];
			return (a, b) => {
				let after: number = 0; // 1
				let before: number = 0; // -1
				let last: number = 0;
				for (const [key, key_order] of sort_entries){
					if (!(Object(a).hasOwnProperty(key) || Object(b).hasOwnProperty(key))) continue;
					const x = a?.[key];
					const y = b?.[key];
					const val = _do_compare(x, y, key_order, key);
					if (val) last = val;
					if (val === 1) after ++;
					else if (val === -1) before ++;
				}
				if (after && before && after === before) return last;
				return after > before ? 1 : after < before ? -1 : 0;
			};
		};
		
		//<< result ~ sorted items
		return items.sort(_sort_method());
	}
	catch (err){
		throw new Error(`[-] _sort error: ${err}`);
	}
};

/**
 * Parse transform text template context values
 * 
 * - template must be in dot path pattern where first delimited value is the context key name.
 * - template values must be put in curly brackets when within mixed text.
 * - dot path matching is case insensitive.
 * 
 * @example
 * _trans('My name is {user.name}.', {User: {Name: 'Root'}}, 'NULL') => 'My name is Root.'
 * _trans('My phone number is {user.phone}.', {User: {Name: 'Root'}}, 'NULL') => 'My phone number is NULL.'
 * _trans('address.city', {Address: {City: 'Nairobi'}}, 'NULL') => 'Nairobi'
 * _trans('address.town', {Address: {City: 'Nairobi', town: undefined}}, 'NULL') => 'undefined'
 * _trans('No template.', {foo: 'bar'}, 'NULL') => 'No template.'
 * _trans('KES {item.amount}/=', {item: {amount: 4500}}, 'NULL', (value:string,path:string,name:string) => _commas(value, true, 2)) => 'No template.'
 *  
 * 
 * @param template - parse template ~ text with value template (e.g. `'My name is {user.name}'`)
 * @param context - values context ~ `{[name: string]: any}`
 * @param _default - default value when unable to resolve template value (default: `'NULL'`)
 * @param _format - format resolved value callback (this allows you to further edit resolved template context values)
 * @returns `string` transformed text where template values are replaced with resolved context values (see examples)
 */
export const _trans = (template: string, context: {[name: string]: any}, _default: string = 'NULL', _format?: (value:string,path:string,name:string)=>any): string => {
	const pattern: RegExp = /\{([_0-9a-zA-Z]+)((\.[_0-9a-zA-Z]+)*)\}/g;
	const value: string = _str(template);
	if (!value.trim()) return value; //-- ignores blank
	const missing = `!!_${Date.now()}_!!`;
	const _trans_format: ((value:string,path:string,name:string)=>any)|undefined = 'function' === typeof _format ? _format : undefined;
	const _trans_get = (name: string, path: string = ''): string => {
		let val: any = _dotGet(name, context, true, 0, missing);
		if (val === missing) return missing;
		if (!!(path = _str(path, true))) val = _dotGet(path, val, true, 0, missing);
		if (val === missing) return missing;
		if (_trans_format) val = _trans_format(val, path, name);
		const text = Array.isArray(val) ? false : _stringable(val);
		return text !== false ? text : _str(val, false, true);
	};
	if (!pattern.test(value)){
		const val = _trans_get(value);
		return val !== missing ? val : value;
	}
	let default_val: string = _str(_default);
	return value.replace(pattern, (...args): string => {
		const name = args[1];
		const path = args[2].replace(/^\./, '');
		let val = _trans_get(name, path);
		if (val === missing) val = default_val;
		return val;
	});
};

/**
 * Parse iterable values array list
 * 
 * @param values - parse values
 * @returns `T[]` array list
 */
export const _arrayList = <T = any>(values: any): T[] => _isArray(values, true) ? [...values] : [];

/**
 * Map values (`object[]`) by key property ID value
 * - ID value is a trimmed `string` (lowercase when argument `_lowercase` is `true`)
 * 
 * @param values - parse values array ~ `<T = any>[]`
 * @param prop - ID property name (default: `''` ~ uses `string` entry value as ID for scalar values array)
 * @param _lowercase - (default: `false`) use lowercase ID value for uniform ID value case
 * @param _texts - (default: `0`) parse text entry mode ~ **enabled when `prop` argument is blank**
 * - `0` => disabled
 * - `1` => trim text values
 * - `2` => stringify and trim text values
 * @param _silent - (default: `true`) do not log warnings when values entry with invalid ID is skipped 
 * @returns `{[id: string]: T}` object with {ID=entry} mapping
 */
export const _mapValues = <T = any>(values: T[], prop: string = '', _lowercase: boolean = false, _texts: 0|1|2 = 0, _silent: boolean = true): {[id: string]: T} => {
	const buffer: {[key: string]: T} = {}, items: any[] = _arrayList(values), key = _str(prop, true);
	for (let i = 0; i < items.length; i ++){
		let entry: any = items[i], id: string = '';
		if (!key){
			if ((id = _str(entry, true)) && [1, 2].includes(_texts)){
				if (_texts === 2) entry = _str(entry, true);
				else if ('string' === typeof entry) entry = _str(entry, true);
			}
		}
		else id = _str(entry?.[key], true);
		if (!id){
			if (!_silent) console.warn('Invalid map values entry. The ID value is blank.', {i, key, entry});
			continue;
		}
		if (_lowercase) id = id.toLowerCase();
		buffer[id] = entry;
	}
	return buffer;
};

/**
 * @class `FailError` _extends `Error`_
 */
export class FailError extends Error
{
	/**
	 * - error message
	 */
	message: string;

	/**
	 * - error mode
	 */
	mode: 0|1|2|3;

	/**
	 * - error debug
	 */
	debug: any;

	/**
	 * - error name
	 */
	name: string;

	/**
	 * Failure error instance/handler
	 * 
	 * @param reason - parse error message
	 * @param mode - error mode ~ `0` = silent (default) | `1` = logs warning | `2` = logs error | `3` = throws error
	 * @param debug - error debug
	 * @param name - error name
	 */
	constructor(reason: any, mode: 0|1|2|3 = 0, debug: any = Symbol('undefined'), name?: string){
		const err_message: string = _errorText(reason) || 'Blank error message.';
		const err_mode: 0|1|2|3 = [0, 1, 2, 3].includes(mode = _posInt(mode, 0, 3) ?? 0 as any) ? mode : 0;
		const err_debug: any[] = 'symbol' === typeof debug && String(debug) === 'Symbol(default)' ? [] : [debug];
		const err_name: string = _str(name, true) || _str(reason?.name, true) || 'FailError';
		super(err_message);
		this.message = err_message;
		this.mode = err_mode;
		this.debug = err_debug[0];
		this.name = err_name;
		if (err_mode === 1 || err_mode === 2) console[err_mode === 1 ? 'warn' : 'error'](_str(this, true), ...err_debug);
		else if (err_mode === 3) throw this;
	}
}

/**
 * Extract `object` value property entries
 * 
 * @param value - parse `object` value
 * @param props - extract property names
 * @param _omit - (default: `false`) **exclude** property names extract mode
 * @param _undefined - (default: `false`) include `undefined` property names
 * @returns `{[prop: any]: any}`
 */
export const _propsObj = (value: any, props?: any[], _omit: boolean = false, _undefined: boolean = false): {[key:string|number|symbol]: any} => {
	const item: {[key: string|number|symbol]: any} = Object(value), keys: any[] = _arrayList(props);
	if (_omit) return Object.fromEntries(Object.entries(item).filter(v => !keys.includes(v[0])));
	return keys.reduce((prev: {[key: string|number|symbol]: any}, key: any): {[key: string|number|symbol]: any} => {
		if (!_empty(key, true)){
			if (item.hasOwnProperty(key)) prev[key] = item[key];
			else if (_undefined) prev[key] = undefined;
		}
		return prev;
	}, {});
};

/**
 * Split `T[]` array values into `T[][]` chunks array
 * 
 * @param array - parse iterable/spreadable array
 * @param size - split array chunk length (default: `1`) ~ **_(`0` returns `[[...array]]`)_**
 * @returns `T[][]`
 */
export const _chunks = <T = any>(array: T[], size: number = 1): T[][] => {
	const items: T[] = [...array], chunks: T[][] = [], len: number = parseInt(size as any) || 0;
	if (len < 0) throw new TypeError(`Invalid \`_chunks\` \`chunk_length\` argument value (${size}).`);
	if (!len) return [items];
	for (let i = 0; i < items.length; i += len) chunks.push(items.slice(i, i + len));
	return chunks;
};

/**
 * Get objects array with keys selection
 * 
 * @param array - parse iterable/spreadable objects array `{[key:string]:any}[]`
 * @param keys - select keys `string[]`
 * @param omit - (default: `false`) `false` disabled, `true` omit select keys, `string[]` omit keys
 * @param filled_only - (default: `false`) omit keys that are empty values in all `array` items or omit item that have empty values in all keys
 * @returns `{[key:string]:any}[]` selection
 */
export const _selectKeys = (array: {[key:string]:any}[], keys: string[], omit: string[]|boolean = false, filled_only: boolean = false): {[key:string]:any}[] => {
	
	//fn => helper - get keys
	const _get_keys = (val: any, label: string = 'keys'): string[] => {
		if (!('object' === typeof val && val)) return [];
		try {
			return [...new Set([...val])];
		} catch (error) {
			console.warn(`[-] invalid \`_selectKeys\` ${label} string array object.`);
			return [];
		}
	};

	//normalize args
	array = [...array];
	keys = _get_keys(keys);
	const omits: string[] = [];
	if (!!omit){
		if (omit === true){
			omits.push(...keys);
			keys = [];
		}
		else omits.push(..._get_keys(omit, 'omit'));
	}
	filled_only = !!filled_only;

	//parse array > check unfilled > skip ommited keys
	const items: {[key:string]:any}[] = [];
	const filled: Set<string> = new Set(), unfilled: {[key: string]: number} = {};
	const keys_object: {[key:string]:any} = keys.length ? Object.fromEntries(keys.map(k => [k, undefined])) : {};
	for (const obj of array){
		if (Object(obj) !== obj) continue;
		const item: {[key:string]:any} = {};
		for (const [key, val] of Object.entries({...keys_object, ...obj})){
			if (filled_only && !filled.has(key)){ //filled check
				if (_empty(val, true)){
					if (!unfilled.hasOwnProperty(key)) unfilled[key] = 1;
				}
				else {
					if (unfilled.hasOwnProperty(key)) delete unfilled[key];
					filled.add(key);
				}
			}
			if (omits.includes(key)) continue; //skip omitted
			item[key] = val;
		}
		items.push(item); //+buffer add
	}

	//set selected > omit unfilled
	const selected: {[key:string]:any}[] = [];
	const unfilled_keys: string[] = Object.keys(unfilled);
	for (const item of items){
		if (keys.length){
			let unfilled: number = 0;
			const entries: [string,any][] = [];
			for (const k of keys){
				if (omits.includes(k)) continue; //skip omitted
				if (unfilled_keys.includes(k)) continue; //skip unfilled
				if (filled_only && _empty(item[k], true)) unfilled ++;
				entries.push([k, item[k]]);
			}
			if (entries.length && entries.length !== unfilled) selected.push(Object.fromEntries(entries));
			continue;
		}
		let unfilled: number = 0;
		const entries: [string,any][] = [];
		const item_entries: [string,any][] = Object.entries(item);
		for (const [key, val] of item_entries){
			if (unfilled_keys.includes(key)) continue; //skip unfilled
			if (filled_only && _empty(val, true)) unfilled ++;
			entries.push([key, val]);
		}
		if (entries.length && entries.length !== unfilled) selected.push(Object.fromEntries(entries));
	}

	//<< result - selected
	return selected;
};

/**
 * Tree options interface
 */
export interface ITreeOptions {
	
	/**
	 * Tree name ~ root node label
	 */
	name?: string;

	/**
	 * String line start padding length
	 */
	pad?: number;

	/**
	 * ignore blank key values ~ i.e. `null|undefined|''` (default: `false`)
	 */
	blanks?: boolean;

	/**
	 * max text value length (default: `200`)
	 */
	max_length?: number;

	/**
	 * text value wrap break length (default: `56`)
	 */
	wrap_length?: number;

	/**
	 * whether to use word break (default `false`)
	 */
	word_break?: boolean;
}

/**
 * Dump tree structure
 * 
 * @param value - parse value
 * @param options - `ITreeOptions` ~ _(see ITreeOptions docs)_
 * @returns `string`
 */
export const _tree = (value: any, options?: ITreeOptions): string => {
	const {
		name: _name = '',
		pad: _pad = 0,
		blanks = false,
		max_length = 200,
		wrap_length = 80,
		word_break = false,
	} = Object(options);
	let pad: number = _posInt(_pad, 0) ?? 0, name: string = _str(_name, true);
	if (name.length){
		name = `[${name}]`;
		pad += 3;
	}
	const _parse = (val: any): string|{[key: string]: any} => {
		if ([null, undefined].includes(val)) return String(val);
		if (['boolean', 'number'].includes(typeof val)) return String(val);
		if (Object(val) !== val) return _jsonStringify(_str(val, true));
		const it: any = val[Symbol.iterator], iterable: boolean = Object(it) === it;
		if (!iterable && _stringable(val)) return _str(val, true);
		if (!Object.entries(val = _jsonCopy(val)).length) return iterable ? '[]' : '{}';
		return val;
	};
	const _lines = (val: any): {type:'node'|'value',lines:string[]} => {
		const node = '├───', node_end = '└───', node_space = '    ', node_border = '│   ', reg_quotes = /^\"(.*)\"$/gs;
		const lines: string[] = [];
		if ('string' === typeof (val = _parse(val))) return {type: 'value', lines: [val]};
		const entries: [string, any][] = Object.entries(val), len = entries.length;
		const it: any = val[Symbol.iterator], iterable: boolean = Object(it) === it;
		for (let i = 0; i < len; i ++){
			const [k, v] = entries[i] as [string, any], last: boolean = i + 1 === len;
			let skip: boolean = false;
			if (!blanks && [undefined, null, k].includes(v)) skip = true;
			let type: 'node'|'value' = 'value', v_lines: string[] = [], v_len: number = 0;
			if (!skip){
				const res = _lines(v);
				type = res.type;
				v_lines = res.lines;
				v_len = v_lines.length;
				if (!blanks && type === 'value' && !v_lines[0]) skip = true;
			}
			const is_list: boolean = iterable && it.name !== 'entries' && Number.isInteger(Number(k)) && Number(k) >= 0;
			const key = is_list ? `[${k}]` : k, list_value: boolean = is_list && type === 'value';
			if (!(skip && list_value)) lines.push(list_value ? `${last ? node_end : node}${key}` : `${last ? node_end : node}${key}`);
			if (skip) continue;
			const key_pad: string = list_value ? ''.padStart(`[${k}]`.length + 1) : '';
			const key_node: string = (last ? node_space : node_border) + key_pad;
			const proc_len: number = typeof process !== 'undefined' && Number.isInteger(process?.stdout?.columns) && key_node.length < (process.stdout.columns/2) ? process.stdout.columns : 0;
			for (let x = 0; x < v_len; x ++){
				const v_last = x + 1 === v_len;
				let text: string = v_lines[x];
				if (type === 'value'){
					let quoted = reg_quotes.test(text);
					if (quoted) text = text.replace(reg_quotes, '$1');
					text = _textMaxLength(text, max_length, 2);
					if (quoted) text = `"${text}"`;
					const wrap_len: number = proc_len ? (proc_len-key_node.length)/2 : wrap_length;
					const wrap_lines: string[] = _wrapLines(text, wrap_len, word_break);
					const text_node: string = v_last ? node_end : node;
					for (let n = 0; n < wrap_lines.length; n ++){
						const wrap_node: string = list_value ? (!n ? ' ' : key_node) : (!n ? text_node : (v_last ? node_space : node_border));
						const wrap_line: string = wrap_lines[n];
						if (list_value){
							if (!n) lines.push(lines.pop() + wrap_node + wrap_line);
							else lines.push(wrap_node + wrap_line);
						}
						else lines.push(key_node + wrap_node + wrap_line);
					}
				}
				else lines.push(`${key_node}${text}`);
			}
		}
		return {type: 'node', lines};
	};
	const {lines} = _lines(value);
	return '\n' + (name ? `${name}\n` : '') + lines.map(line => pad > 0 ? ''.padStart(pad) + line : line).join('\n');
};