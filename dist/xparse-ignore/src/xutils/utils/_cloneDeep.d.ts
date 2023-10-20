/**
 * Clone prototype
 *
 * @param parent
 */
export declare const clonePrototype: (parent: any) => any;
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
}
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
export declare function _cloneDeep<T = any>(value: T, options?: IDeepCloneOptions): T;
