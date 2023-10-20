import { bool } from '../types';
import { _jsonCopy, _jsonParse, _jsonStringify } from './_json';
import { _int, _num } from './_number';
import { _str, _string, _stringable } from './_string';
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
export const _hasProps = (value: any, ...props: any): boolean => {
	if (!props.length) return false;
	for (const key of props){
		if (!_hasProp(value, key)) return false;
	}
	return true;
};

/**
 * Check if object has any of the properties
 * 
 * @param value  Search `object` value
 * @param props  Spread find properties
 * 
 */
export const _hasAnyProps = (value: any, ...props: any): boolean => {
	if (!props.length) return false;
	for (const key of props){
		if (_hasProp(value, key)) return true;
	}
	return false;
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
	 * - property exists state ~ `0` = not found, `1` = own property, `2` = not own property
	 */
	exists: 0|1|2;
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
 * Get `[min, max]` compared and arranged in order
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
 * Parse dot flattened object to [key => value] object ~ reverse `_dotFlat()`
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
 * @param _failure - error handling ~ `0` = (default) disabled, '1' = warn error, `2` = warn and throw error
 * @returns `string` valid dot path
 */
export const _validDotPath = (dot_path: string, operations: boolean = false, _failure: 0|1|2 = 0): string => {
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
		if (_failure){
			if (_failure === 1) console.warn(e, {dot_path, operations});
			else if (_failure === 2) throw e;
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
 * @param _failure - error handling ~ `0` = (default) disabled, `1` = warn error, `2` = throw error
 * @param _default - default result on failure
 * @returns `any` dot path match result
 */
export const _dotGet = (path: string, target: any, ignoreCase: boolean = false, _failure: 0|1|2 = 0, _default?: any): any => {
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
		if (_failure){
			if (_failure === 1) console.warn(e, {path, target});
			else if (_failure === 2) throw e;
		}
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
			if (arr.length || (_empty(value) && Object.getPrototypeOf(value) === Object.prototype)){
				if (!entries && arr.length){
					const values: any[] = [];
					for (const v of arr) values.push(v[1]);
					items = values; 
				}
				else items = arr;
			}
		}
		else if (_empty(value) && Object.getPrototypeOf(value) === Object.prototype) items = []; //{}
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
 * Sort array values
 * 
 * @param array - array values
 * @param sort - sort (default: `asc`) ~ `1|-1|'asc'|'desc'|{[key: string]: 1|-1|'asc'|'desc'}`
 * @returns Sorted `T[]`
 */
export const _sortValues = <T = any>(array: T[], sort?: 1|-1|'asc'|'desc'|{[key:string]:1|-1|'asc'|'desc'}): T[] => {
	const _compare = (a: any, b: any): number => {
		if ('string' === typeof a && 'string' === typeof b && 'function' === typeof a?.localeCompare) return a.localeCompare(b);
		return a > b ? 1 : (a < b ? -1 : 0);
	};
	const _direction = (val: any): number => {
		if ('number' === typeof val) return val >= 0 ? 1 : -1;
		if ('string' === typeof val){
			val = val.trim().toLowerCase();
			if (val.startsWith('asc')) return 1;
			if (val.startsWith('desc')) return -1;
		}
		return 1;
	};
	const _method = (): ((a: any, b: any)=>number) => {
		if (Object(sort) === sort){
			const entries = Object.entries(sort as any);
			if (entries.length) return (a, b) => {
				let i, result;
				for (result = 0, i = 0; result === 0 || i < entries.length; i ++){
					const [key, val] = entries[i];
					result = _compare(a?.[key], b?.[key]) * _direction(val);
				}
				return result;
			};
		}
		return (a, b) => _compare(a, b) * _direction(sort);
	};
	return array.sort(_method());
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