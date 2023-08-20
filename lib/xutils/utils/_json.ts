/**
 * Custom `JSON.stringify` with extended custom replacer
 * - Default value for `undefined` value argument
 * - Fix `Error`, `Set`, `Map` stringify
 * - Circular reference fixes
 * 
 * @param value  Parse value (`undefined` value is replaced with `_undefined` argument substitute value)
 * @param space  Indentation space
 * @param _undefined  Default `undefined` argument `value` substitute (default `null`)
 * @returns
 */
export const _jsonStringify = (value: any, space?: string|number|null|undefined, _undefined: any = null): string => {
	const _space: string|number|undefined = space === null ? undefined : space;
	const parents: any = [];
	const path: any[] = ['this'];
	const refs = new Map<any, any>();
	const _clear = (): void => {
		refs.clear();
		parents.length = 0;
		path.length = 1;
	};
	const _parents = (key: any, value: any): void => {
		let i = parents.length - 1, prev = parents[i];
		if (prev[key] === value || i === 0){
			path.push(key);
			parents.push(value);
			return;
		}
		while (i-- >= 0) {
			prev = parents[i];
			if (prev?.[key] === value){
				i += 2;
				parents.length = i;
				path.length = i;
				--i;
				parents[i] = value;
				path[i] = key;
				break;
			}
		}
	};
	const _replacer = function(this :any, key: string, value: any): any {
		if (value === null) return value;
		if (value instanceof Error){
			try {
				value = String(value);
			}
			catch (e){
				const error = '[FAILURE] Parse Error to String failed!';
				console.warn(error, {value, e});
				value = error;
			}
		}
		if (value instanceof Set) value = [...value];
		if (value instanceof Map) value = [...value];
		if (value instanceof RegExp) value = value + '';
		if ('object' === typeof value){
			if (key) _parents(key, value);
			const other = refs.get(value);
			if (other) return '[Circular Reference]' + other;
			else refs.set(value, path.join('.'));
		}
		return value;
	};
	try {
		if (value === undefined) value = _undefined !== undefined ? _undefined : _undefined = null;
		parents.push(value);
		return JSON.stringify(value, _replacer, _space);
	}
	finally {
		_clear();
	}
};

/**
 * Custom `JSON.parse` with error catch and default result on parse failure
 * 
 * @param value
 * @param _default
 * @returns
 */
export const _jsonParse = (value: string, _default?: any): any => {
	try {
		return JSON.parse(value);
	}
	catch (e){
		return _default;
	}
};

/**
 * Clone value via json stringify and parse
 * 
 * @param value  Parse value
 * @param space  Indentation space
 * @param _undefined  Default `undefined` argument `value` substitute (default `null`)
 */
export const _jsonClone = <TReturn extends any>(value: any, space?: string|number|undefined, _undefined: any = null): TReturn => {
	let val: any = _jsonStringify(value, space, _undefined);
	if (val !== undefined) val = _jsonParse(val);
	return val as TReturn;
};
