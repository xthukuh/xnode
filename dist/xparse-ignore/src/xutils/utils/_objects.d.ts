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
 * @param value - parse `object` value
 * @param prop - property name
 * @param own  [default: `false`] As own property
 * @returns `boolean`
 */
export declare const _hasProp: (value: any, prop: any, own?: bool) => boolean;
/**
 * Check if object has properties
 *
 * @param value - parse `object` value
 * @param props - property names
 * @returns `boolean`
 */
export declare const _hasProps: (value: any, ...props: any[]) => boolean;
/**
 * Check if object has any of the properties
 *
 * @param value - parse `object` value
 * @param props - property names
 * @returns `false|any[]`
 */
export declare const _hasAnyProps: (value: any, ...props: any[]) => false | any[];
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
    exists: 0 | 1 | 2 | false;
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
 * @param value - parse value
 */
export declare const _isClass: (value: any) => boolean;
/**
 * Check if value is a `function`
 *
 * @param value - parse value
 * @param orClass - (default: `false`) include `class` objects
 * @returns `boolean`
 */
export declare const _isFunc: (value: any, orClass?: boolean) => boolean;
/**
 * Get `[min, max]` compared and arranged in order
 * - Example: `_minMax(20, 10)` => `[10, 20]`
 * - Example: `_minMax(0.23, null)` => `[null, 0.23]`
 *
 * @param a - first value
 * @param b - second value
 * @returns `[min, max]`
 */
export declare const _minMax: (a: any, b: any) => [min: any, max: any];
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
export declare const _dotFlat: (value: any, omit?: string[]) => {
    [key: string]: any;
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
export declare const _dotInflate: (value: any) => {
    [key: string]: any;
};
/**
 * Get validated object dot path (i.e. `'a.b.c'` to refer to `{a:{b:{c:1}}}`)
 *
 * @param dot_path - dot separated keys
 * @param operations - supports operations (i.e. '!reverse'/'!slice=0') ~ tests dot keys using `/^[-_0-9a-zA-Z]+\=([^\=\.]*)$/` instead of default `/^[-_0-9a-zA-Z]+$/`
 * @param _failure - `FailError` mode ~ `0` = silent (default) | `1` = logs warning | `2` = logs error | `3` = throws error
 * @returns `string` valid dot path
 */
export declare const _validDotPath: (dot_path: string, operations?: boolean, _failure?: 0 | 1 | 2 | 3) => string;
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
 * @param _failure - `FailError` mode ~ `0` = silent (default) | `1` = logs warning | `2` = logs error | `3` = throws error
 * @param _default - default result on failure
 * @returns `any` dot path match result
 */
export declare const _dotGet: (path: string, target: any, ignoreCase?: boolean, _failure?: 0 | 1 | 2 | 3, _default?: any) => any;
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
 * Validate `Object` value
 *
 * @param value - parse value
 * @param _filled - must not be empty `{}`
 * @returns `boolean`
 */
export declare const _isObject: (value: any, _filled?: boolean) => boolean;
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
export declare const _isArray: (value: any, _filled?: boolean, _mode?: 0 | 1 | 2) => boolean;
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
 * Sort mode `type` ~ `1|-1|'asc'|'desc'|'ascending'|'descending'`
 */
export type TSortMode = 1 | -1 | 'asc' | 'desc' | 'ascending' | 'descending';
/**
 * Sort order `type` ~ `-1` (before) | `1` (after) | `0` (equal)
 */
export type TSortOrder = -1 | 1 | 0;
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
export declare const _sort: <T = any>(array: T[], mode?: TSortMode | {
    [key: string]: TSortMode;
} | [string, TSortMode] | [string, TSortMode][] | undefined, onCompare?: ((a: any, b: any, key?: string) => TSortOrder | [a: any, b: any]) | undefined, localeCompareConfig?: {
    locales?: any;
    options?: any;
}) => T[];
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
/**
 * Parse iterable values array list
 *
 * @param values - parse values
 * @returns `T[]` array list
 */
export declare const _arrayList: <T = any>(values: any) => T[];
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
export declare const _mapValues: <T = any>(values: T[], prop?: string, _lowercase?: boolean, _texts?: 0 | 1 | 2, _silent?: boolean) => {
    [id: string]: T;
};
/**
 * @class `FailError` _extends `Error`_
 */
export declare class FailError extends Error {
    /**
     * - error message
     */
    message: string;
    /**
     * - error mode
     */
    mode: 0 | 1 | 2 | 3;
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
    constructor(reason: any, mode?: 0 | 1 | 2 | 3, debug?: any, name?: string);
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
export declare const _propsObj: (value: any, props?: any[], _omit?: boolean, _undefined?: boolean) => {
    [key: string]: any;
    [key: number]: any;
    [key: symbol]: any;
};
/**
 * Split `T[]` array values into `T[][]` chunks array
 *
 * @param array - parse iterable/spreadable array
 * @param size - split array chunk length (default: `1`) ~ **_(`0` returns `[[...array]]`)_**
 * @returns `T[][]`
 */
export declare const _chunks: <T = any>(array: T[], size?: number) => T[][];
/**
 * Get objects array with keys selection
 *
 * @param array - parse iterable/spreadable objects array `{[key:string]:any}[]`
 * @param keys - select keys `string[]`
 * @param omit - (default: `false`) `false` disabled, `true` omit select keys, `string[]` omit keys
 * @param filled_only - (default: `false`) omit keys that are empty values in all `array` items or omit item that have empty values in all keys
 * @returns `{[key:string]:any}[]` selection
 */
export declare const _selectKeys: (array: {
    [key: string]: any;
}[], keys: string[], omit?: string[] | boolean, filled_only?: boolean) => {
    [key: string]: any;
}[];
