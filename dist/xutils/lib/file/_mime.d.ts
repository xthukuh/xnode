/**
 * File extension mime types
 */
export declare const EXT_MIMES: {
    [ext: string]: string;
};
/**
 * Mime type object interface
 */
export interface IMimeType {
    /**
     * - parse value
     */
    value: any;
    /**
     * - mime type (e.g. `'image/png'`)
     */
    type: string;
    /**
     * - file extension (e.g. `'png'`)
     */
    ext: string;
    /**
     * - parse error text
     */
    error: string;
    /**
     * - get `string` cast
     *
     * @param prop - get property (default: `'type'`)
     * @returns `string`
     */
    toString: (
    /**
     * - get property (default `'type'`)
     */
    prop?: 'type' | 'ext' | 'error') => string;
}
/**
 * Parse file mime type
 *
 * @example String(_mime('application/json; charset=utf-8')) => 'application/json'
 *
 * @param value - parse mime type
 * @param _failure - `FailError` mode ~ `0` = silent (default) | `1` = logs warning | `2` = logs error | `3` = throws error
 * @returns `IMimeType` stringable mime type object
 */
export declare const _mime: (value: any, _failure?: 0 | 1 | 2 | 3) => IMimeType;
