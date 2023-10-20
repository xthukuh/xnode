/**
 * Exception error interface
 */
export interface IExceptionError {
    message: string;
    name: string;
    code: string | number;
    data: any;
    time: number;
    toString: () => string;
}
/**
 * `Symbol` private props key name
 */
declare const PROPS: unique symbol;
/**
 * `Exception` extends `Error` ~ like `DOMException`
 *
 * - message: `string`
 * - name: `string`
 * - code: `number`
 * - toString: `()=>string`
 */
export declare class Exception extends Error implements IExceptionError {
    /**
     * Private props
     */
    [PROPS]: {
        message: string;
        name: string;
        code: string | number;
        data: any;
        time: number;
    };
    /**
     * Error message (default: `'Unspecified exception message.'`)
     */
    get message(): string;
    /**
     * Error name (default: `'Exception'`)
     */
    get name(): string;
    /**
     * Error code - `string` | finite/parsed `integer` (default: `0`)
     */
    get code(): string | number;
    /**
     * Error data
     */
    get data(): any;
    /**
     * Error data
     */
    get time(): any;
    /**
     * New `IExceptionError` instance
     *
     * @param message - error message (default: `'Unspecified exception message.'`)
     * @param name - error name (default: `'Exception'`)
     * @param code - error code - `string` | finite/parsed `integer` (default: `0`)
     * @param data - error data
     * @param time - error timestamp milliseconds (default: `Date.now()`)
     * @returns `IExceptionError`
     */
    constructor(message?: string, name?: string, code?: string | number, data?: any, time?: number);
    /**
     * Get error `string`
     */
    toString(): string;
    /**
     * Create new `Exception`
     *
     * @param message - error message (default: `'Unspecified exception message.'`)
     * @param name - error name (default: `'Exception'`)
     * @param code - error code - `string` | finite/parsed `integer` (default: `0`)
     * @param data - error data
     * @param time - error timestamp milliseconds (default: `Date.now()`)
     * @returns `IExceptionError`
     */
    static error(message?: string, name?: string, code?: string | number, data?: any, time?: number): IExceptionError;
    /**
     * Create new `Exception` from parsed error
     *
     * @param error - parse error value (i.e. `string` message or Error/object/values {message: `string`, name: `string|undefined`, code: `string|number|undefined`, data: `any`, time: `number` ?? `Date.now()`})
     * @returns `IExceptionError`
     */
    static parse(error?: any): IExceptionError;
}
export {};
