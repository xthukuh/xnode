import { Buffer } from '../3rd-party';

/**
 * Clone utils
 */
const _instanceof = (o: any, type: any): boolean => 'object' === typeof type && type && o instanceof type;
const _toString = (o: any): string => Object.prototype.toString.call(o);
const _isDate = (o: any): boolean => 'object' === typeof o && _toString(o) === '[object Date]';
const _isArray = (o: any): boolean => typeof o === 'object' && _toString(o) === '[object Array]';
const _isRegExp = (o: any): boolean => typeof o === 'object' && _toString(o) === '[object RegExp]';
const _getRegExpFlags = (regex: any): string => {
	let flags = '';
	if (regex?.global) flags += 'g';
	if (regex?.ignoreCase) flags += 'i';
	if (regex?.multiline) flags += 'm';
	return flags;
};

/**
 * Clone prototype
 * 
 * @param parent
 */
export const clonePrototype = (parent: any): any => {
	if (parent === null || parent === undefined) return parent;
	if ('object' !== typeof parent) parent = Object.getPrototypeOf(parent);
	const fn: any = function(){};
	fn.prototype = parent;
	return new fn();
};

/**
 * Deep clone options interface
 */
export interface IDeepCloneOptions {
	
	/** [default: `true`] Enable circular references (can also be object with options {circular, depth, prototype, non_enumerable}) */
	circular?: boolean;
	
	/** [default: `Infinity`] Clone depth limit (leave default to prevent references to parent). */
	depth?: number;
	
	/** [default: `undefined`] Use prototype. */
	prototype?: any;
	
	/** [default: `false`] Enable cloning non-enumerable properties (ignores prototype chain non-enumerable props) */
	non_enumerable?: boolean;
};

/**
 * Clones (copies) an Object using deep copying.
 *
 * - This function supports circular references by default, but if you are certain
 * there are no circular references in your object, you can save some CPU time
 * by calling with option `circular` = `false`.
 *
 * - CAUTION: if option `circular` is `false` and `value` contains circular references,
 * your program may enter an infinite loop and crash.
 * 
 * @param value  Clone subject `<T>`
 * @param options  Clone options
 * @returns `<T>` clone
 */
export function _cloneDeep<T = any>(value: T, options?: IDeepCloneOptions): T {
	const {
		circular: _circular = true,
		depth: _depth = Infinity,
		prototype: _prototype = undefined,
		non_enumerable: _non_enumerable = false,
	} = Object(options);
	const circular = 'undefined' === typeof _circular ? true : Boolean(_circular);
	const depth = !isNaN(_depth) && Number.isInteger(_depth) && _depth > 0 ? _depth : Infinity;
	const prototype = _prototype;
	const non_enumerable = Boolean(_non_enumerable);
	const allParents: any[] = [];
	const allChildren: any[] = [];
	const useBuffer = 'undefined' !== typeof Buffer;

	//clone
	const _clone = (parent: any, depth: number): any => {
		if (depth === 0 || !('object' === typeof parent && parent)) return parent;
		let child: any, proto: any;
		if (_instanceof(parent, Map)) child = new Map();
		else if (_instanceof(parent, Set)) child = new Set();
		else if (_instanceof(parent, Promise)){
			child = new Promise((resolve, reject) => {
				parent.then((res: any) => resolve(_clone(res, depth - 1)))
				.catch((err: any)=> reject(_clone(err, depth - 1)));
			});
		}
		else if (_isArray(parent)) child = [];
		else if (_isRegExp(parent)){
			child = new RegExp(parent.source, _getRegExpFlags(parent));
			if (parent.lastIndex) child.lastIndex = parent.lastIndex;
		}
		else if (_isDate(parent)) child = new Date(parent.getTime());
		else if (useBuffer && Buffer.isBuffer(parent)){
			if (Buffer.from) child = Buffer.from(parent); //Node.js >= 5.10.0
			else {
				child = new Buffer(parent.length); //Older Node.js versions
				parent.copy(child);
			}
			return child;
		}
		else if (_instanceof(parent, Error)) child = Object.create(parent);
		else {
			if ('object' !== typeof prototype){
				proto = Object.getPrototypeOf(parent);
				child = Object.create(proto);
			}
			else {
				child = Object.create(prototype);
				proto = prototype;
			}
		}
		if (circular){
			const index = allParents.indexOf(parent);
			if (index !== -1) return allChildren[index];
			allParents.push(parent);
			allChildren.push(child);
		}
		if (_instanceof(parent, Map)){
			for (const [key, val] of parent){
				const keyChild = _clone(key, depth - 1);
				const valChild = _clone(val, depth - 1);
				child.set(keyChild, valChild);
			}
		}
		if (_instanceof(parent, Set)){
			for (const val of parent){
				const valChild = _clone(val, depth - 1);
				child.add(valChild);
			}
		}
		for (let key in parent){
			const attrs = Object.getOwnPropertyDescriptor(parent, key);
			if (attrs) child[key] = _clone(parent[key], depth - 1);
			try {
				const objProperty = Object.getOwnPropertyDescriptor(parent, key);
				if (objProperty?.set === undefined) continue;
				child[key] = _clone(parent[key], depth - 1);
				if (objProperty) Object.defineProperty(child, key, objProperty);
			}
			catch (e){
				if (e instanceof TypeError) continue; //child[key] only has getter (strict mode)
				else if (e instanceof ReferenceError) continue; //same as above (non strict mode)
			}
		}
		if (Object.getOwnPropertySymbols){
			const symbols = Object.getOwnPropertySymbols(parent);
			for (let i = 0; i < symbols.length; i ++){
				const symbol = symbols[i]; //primitive
				const descriptor = Object.getOwnPropertyDescriptor(parent, symbol);
				if (descriptor && !descriptor.enumerable && !non_enumerable) continue;
				child[symbol] = _clone(parent[symbol], depth - 1);
				if (descriptor) Object.defineProperty(child, symbol, descriptor);
			}
		}
		if (non_enumerable){
			const allPropertyNames = Object.getOwnPropertyNames(parent);
			for (let i = 0; i < allPropertyNames.length; i ++){
				const propertyName = allPropertyNames[i];
				const descriptor = Object.getOwnPropertyDescriptor(parent, propertyName);
				if (descriptor && descriptor.enumerable) continue;
				child[propertyName] = _clone(parent[propertyName], depth - 1);
				if (descriptor) Object.defineProperty(child, propertyName, descriptor);
			}
		}
		return child;
	};

	//result
	return _clone(value, depth) as T;
};