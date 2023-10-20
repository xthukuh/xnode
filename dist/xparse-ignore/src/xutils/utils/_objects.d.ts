import { bool } from '../types';
/**
 * Get all property descriptors
 * - API ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty
 *
 * @param value - parse value object
 * @returns `{[key: string|number|symbol]: any}` ~ {property => descriptors} object
 */
export declare const _getAllPropertyDescriptors: (value: any) => {
    [key: string]: any;
    [key: number]: any;
    [key: symbol]: any;
};
/**
 * Get all value properties
 *
 * @param value - parse value object
 * @param statics - include `static` class properties
 * @returns `(string|number|symbol)[]` - found own/prototype/symbol properties | `[]` when none found
 */
export declare const _getAllProperties: (value: any, statics?: boolean) => (string | number | symbol)[];
/**
 * Check if value has property
 *
 * @param value  Search `object` value
 * @param prop  Find property
 * @param own  [default: `false`] As own property
 *
 */
export declare const _hasProp: (value: any, prop: any, own?: bool) => boolean;
/**
 * Check if object has properties
 *
 * @param value  Search `object` value
 * @param props  Spread find properties
 *
 */
export declare const _hasProps: (value: any, ...props: any) => boolean;
/**
 * Check if object has any of the properties
 *
 * @param value  Search `object` value
 * @param props  Spread find properties
 *
 */
export declare const _hasAnyProps: (value: any, ...props: any) => boolean;
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
    exists: 0 | 1 | 2;
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
export declare const _getProp: (value: any, match: any, ignoreCase?: bool) => IProperty;
/**
 * Check if value is a class function
 *
 * @param value  Test value
 */
export declare const _isClass: (value: any) => boolean;
/**
 * Check if value is a function (or class optionally)
 *
 * @param value  Test value
 * @param orClass  [default: `false`] Includes class function
 */
export declare const _isFunc: (value: any, orClass?: boolean) => boolean;
/**
 * Get `[min, max]` compared and arranged in order
 * - Example: `_minMax(20, 10)` => `[10, 20]`
 * - Example: `_minMax(0.23, null)` => `[null, 0.23]`
 *
 * @param a  Compare value 1
 * @param b  Compare value 2
 * @returns `[min, max]`
 */
export declare const _minMax: (a: any, b: any) => [min: any, max: any];
/**
 * Flatten object values recursively to dot paths (i.e. `{a:{x:1},b:{y:2,z:[5,6]}}` => `{'a.x':1,'b.y':2,'b.z.0':5,'b.z.1':6}`)
 *
 * @param value  Parse object
 * @param omit  Omit entry keys/dot paths
 * @returns `{[key: string]: any}`
 */
export declare const _dotFlat: (value: any, omit?: string[]) => {
    [key: string]: any;
};
/**
 * Parse dot flattened object to [key => value] object ~ reverse `_dotFlat()`
 *
 * @param value - parse value ~ `{[dot_path: string]: any}`
 * @returns `{[key: string]: any}` parsed result | `{}` when value is invalid
 */
export declare const _dotInflate: (value: any) => {
    [key: string]: any;
};
/**
 * Get validated object dot path (i.e. `'a.b.c'` to refer to `{a:{b:{c:1}}}`)
 *
 * @param dot_path - dot separated keys
 * @param operations - supports operations (i.e. '!reverse'/'!slice=0') ~ tests dot keys using `/^[-_0-9a-zA-Z]+\=([^\=\.]*)$/` instead of default `/^[-_0-9a-zA-Z]+$/`
 * @param _failure - error handling ~ `0` = (default) disabled, '1' = warn error, `2` = warn and throw error
 * @returns `string` valid dot path
 */
export declare const _validDotPath: (dot_path: string, operations?: boolean, _failure?: 0 | 1 | 2) => string;
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
export declare const _bool: (value: any, strict?: boolean, trim?: boolean) => boolean | undefined;
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
export declare const _dotGet: (path: string, target: any, ignoreCase?: boolean, _failure?: 0 | 1 | 2, _default?: any) => any;
/**
 * @deprecated
 * Get coerced `number/string/JSON` value ~ `value.valueOf()`
 *
 * @param value - parse value
 * @returns `any` ~ `object`|`undefined`|`boolean`|`number`|`bigint`|`string`|`symbol`
 */
export declare const _valueOf: (value: any) => any;
/**
 * Check if value is empty ~ `null`/`undefined`/`NaN`/`''`/`{}`/`![...value]`
 *
 * @param value - parse value
 * @param trim - trim whitespace ~ when value is `string/Buffer`
 * @returns `boolean`
 */
export declare const _empty: (value: any, trim?: boolean) => boolean;
/**
 * Check if value can be iterated ~ `[...value]`
 *
 * @param value - parse value
 * @param _async - using `[Symbol.asyncIterator]` (default `false` ~ `[Symbol.iterator]`)
 * @returns `boolean`
 */
export declare const _iterable: (value: any, _async?: boolean) => boolean;
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
export declare const _values: (value: any, entries?: boolean, object?: boolean, flatten?: number | boolean | null) => any[];
/**
 * Get dump value with limit max string length
 *
 * @param value - parse value
 * @param maxStrLength - max string length [default: `200`]
 * @param first - summarize object array to count and first entry (i.e. `{count:number,first:any}`)
 * @returns `any` - dump value
 */
export declare const _dumpVal: (value: any, maxStrLength?: number, first?: boolean) => any;
/**
 * Sort array values
 *
 * @param array - array values
 * @param sort - sort (default: `asc`) ~ `1|-1|'asc'|'desc'|{[key: string]: 1|-1|'asc'|'desc'}`
 * @returns Sorted `T[]`
 */
export declare const _sortValues: <T = any>(array: T[], sort?: 1 | -1 | "asc" | "desc" | {
    [key: string]: 1 | -1 | "asc" | "desc";
} | undefined) => T[];
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
export declare const _trans: (template: string, context: {
    [name: string]: any;
}, _default?: string, _format?: ((value: string, path: string, name: string) => any) | undefined) => string;
