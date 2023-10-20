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
 * Basename error interface
 */
export interface IMimeTypeError extends Error {
    name: string;
    item: IMimeType;
}
/**
 * Get normalized file mime type (i.e. 'application/json; charset=utf-8' => 'application/json')
 *
 * @param  string	$value	- Parse value (mime|ext|file-path)
 * @param  string	$ext		- ByRef file extension (i.e. 'txt', 'png')
 * @param  string	$error	- ByRef error message
 * @return string|false
 */
export declare const _mime: (value: any, _failure?: 0 | 1 | 2) => IMimeType;
