/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
/**
 * Get existing path type
 *
 * @param path
 * @returns `0|1|2` ~> `0` = not found | `1` = file | `2` = directory
 */
export declare const _pathExists: (path: string) => 0 | 1 | 2;
/**
 * Get directory listing
 *
 * @param dir  Directory path
 * @param mode  List mode (i.e. `0` = all | `1` = only files | `2` = only subfolders)
 * @param recursive  List recursively `boolean`
 * @returns `string[]` Paths array
 */
export declare const _lsDir: (dir: string, mode?: number, recursive?: boolean) => Promise<string[]>;
/**
 * Read file content lines `callback` (Aborts if `callback` result is `false`);
 *
 * @param file  File path
 * @param callback  Read line handler
 * @returns `number` Total lines read
 */
export declare const _readLines: (file: string, handler: (lineContent: string, lineNumber?: number) => any) => Promise<number>;
/**
 * Read file contents
 *
 * @param path  File path
 * @param json  JSON decode
 * @param _default  Default result on parse failure [default: `undefined`]
 * @returns `T|undefined` Parsed data or `undefined` on failure
 */
export declare const _readSync: <T extends unknown>(path: string, json?: boolean, _default?: T | undefined) => T | undefined;
/**
 * Write file contents
 *
 * @param path  File path
 * @param content  Write content
 * @param append  [default: `false` (overwrite)] Append content
 * @param abortController  `AbortController`
 * @returns `void`
 */
export declare const _writeSync: (path: string, content: string | NodeJS.ArrayBufferView, append?: boolean, abortController?: AbortController | undefined) => void;
/**
 * Parse `process.argv` options
 *
 * @returns `{[key: string]: string|boolean}`
 */
export declare const _processArgs: () => {
    [key: string]: string | boolean;
};
/**
 * Delete directory - returns (1 = success, 0 = failure, -1 = invalid path/not found)
 *
 * @param path  Directory path
 * @param recursive  Delete directory contents
 * @returns `number` 1 = success, 0 = failure, -1 = invalid path/not found
 */
export declare const _removeDir: (path: string, recursive?: boolean) => number;
/**
 * Delete file - returns (1 = success, 0 = failure, -1 = invalid path/not found)
 *
 * @param path
 * @returns `number` 1 = success, 0 = failure, -1 = invalid path/not found
 */
export declare const _removeFile: (path: string) => number;
