/**
 * Basename (stringable) object interface
 */
export interface IBasename {
    value: any;
    basename: string;
    name: string;
    ext: string;
    error: string;
    illegal: string[];
    invalid: string[];
    /**
     * Get basename text
     *
     * @param prop - text value prop
     * @returns `string`
     */
    toString: (
    /**
     * Specify text value prop (default `'basename'`)
     */
    prop?: 'basename' | 'name' | 'ext' | 'error') => string;
}
/**
 * Basename error interface
 */
export interface IBasenameError extends Error {
    name: string;
    item: IBasename;
}
/**
 * Get validated basename from file path value
 *
 * - splits path separators `[\\/]` uses last entry
 * - trims spaces, invalidates empty
 * - invalidates illegal characters (i.e. `:?"<>|*`)
 * - invalidates invalid names (i.e. `'...', 'name.', 'name...'`)
 *
 * @param value - parse path value
 * @param dots - allow dot nav ~ `'.' | '..'` (default: `false`)
 * @param _strict - strict parsing ~ returns blank (`''`) values on error
 * @param _failure - error handling ~ `0` = ignore, '1' = warn, `2` = throw error (default `0`)
 * @returns `IBasename` basename (stringable)
 * @throws `IBasenameError`
 */
export declare const _basename: (value: any, dots?: boolean, _strict?: boolean, _failure?: 0 | 1 | 2) => IBasename;
/**
 * Normalized path (stringable) interface
 */
export interface IFilePath {
    value: any;
    root: string;
    drive: string;
    path: string;
    dir: string;
    basename: string;
    name: string;
    ext: string;
    error: string;
    illegal: string[];
    invalid: string[];
    /**
     * Get path text
     *
     * @param prop - text value prop
     * @returns `string`
     */
    toString: (
    /**
     * Specify text value prop (default: `'path'`)
     * - use `'file'` to enforce valid basename and no error
     */
    prop?: 'file' | 'root' | 'drive' | 'path' | 'dir' | 'basename' | 'name' | 'ext' | 'error') => string;
}
/**
 * Normalized path error interface
 */
export interface IFilePathError extends Error {
    name: string;
    item: IFilePath;
}
/**
 * Get normalized file/directory path (validates basename)
 *
 * - trims spaces, silently omits empty
 * - invalidates illegal path name characters (i.e. `:?"<>|*`)
 * - invalidates invalid path name dots (i.e. `'...', 'name.', 'name...'`)
 * - invalidates outbound root dot nav
 * - normalizes dot path			(i.e. `'/.'` => `'/'`, `'a/b/./c' => 'a/b/c'`, `'./a/../b/c' => './b/c'`) ignores out of bound (i.e. `'C:/a/../../b/c' => 'C:/b/c'`)
 * - normalizes drive letter	(i.e. `'c:\\a.txt' => 'C:\\a.txt'`, `'c:'` => `'C:\\'`)
 *
 * @param value - parse path value
 * @param separator - result path separator ~ `'' | '/' | '\\'` (default `''` = unchanged)
 * @param _strict - strict parsing ~ returns blank (`''`) values on error
 * @param _type - path type (default `''`) ~ name used in error message (i.e. `'The ${_type} path...'`)
 * @param _failure - error handling ~ `0` = ignore, '1' = warn, `2` = throw error (default `0`)
 * @returns `IFilePath` normalized path (stringable)
 */
export declare const _filepath: (value: any, separator?: '' | '/' | '\\', _strict?: boolean, _type?: string, _failure?: 0 | 1 | 2) => IFilePath;
