/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
/**
 * Check if path exists
 *
 * @param path - file path
 * @returns `string` real path | `''` on failure
 */
export declare const _exists: (path: string) => boolean;
/**
 * Get path realpath
 *
 * @param path - file path
 * @returns `string` result | `''` on error
 */
export declare const _realpath: (path: string, target?: boolean) => string;
/**
 * Get symbolic link target path
 *
 * @param path - link path
 * @returns `string|undefined`
 */
export declare const _target: (path: string) => string;
/**
 * Get path basename
 *
 * @param path - file path
 * @param suffix - optionally, an extension to remove from the result.
 * @returns `string` result | `''` on error
 */
export declare const _filename: (path: string, suffix?: string) => string;
/**
 * Get path dirname
 *
 * @param path - parse path
 * @param absolute - resolve absolute path
 * @returns `string` result | `''` on error
 */
export declare const _dirname: (path: string, absolute?: boolean) => string;
/**
 * Create directory if not exist
 *
 * @param path - directory path
 * @param mode - (default: `0o777`) create permission
 * @param recursive - (default: `true`) create recursively ~ create parent folders if they dont exist
 * @returns `string` created directory realpath | `''` on error
 */
export declare const _mkdir: (path: string, mode?: string | number, recursive?: boolean) => string;
/**
 * Path info interface
 */
export interface IPathInfo {
    /**
     * 0 - unknown, 1 = file, 2 = directory, 3 = dir link, 4 = file link
     */
    type: number;
    path: string;
    path_full: string;
    dir: string;
    dir_full: string;
    target: string;
    dev: number;
    mode: number;
    nlink: number;
    uid: number;
    gid: number;
    rdev: number;
    blksize: number;
    ino: number;
    size: number;
    blocks: number;
    atimeMs: number;
    mtimeMs: number;
    ctimeMs: number;
    birthtimeMs: number;
    atime: Date;
    mtime: Date;
    ctime: Date;
    birthtime: Date;
    isDirectory: boolean;
    isFile: boolean;
    isBlockDevice: boolean;
    isCharacterDevice: boolean;
    isSymbolicLink: boolean;
    isFIFO: boolean;
    isSocket: boolean;
}
/**
 * Get file path stats
 *
 * @param path - parse path
 * @param mode - parse mode ~ [`0`] - fs.statSync (follows links), `1` - fs.lstatSync, `2` - merged
 * @returns `IPathInfo|undefined`
 */
export declare const _pathinfo: (path: string, mode?: 0 | 1 | 2) => IPathInfo | undefined;
/**
 * Get directory content paths
 *
 * @param dir - root directory path
 * @param mode - parse mode (i.e. `0` = all | `1` = only files | `2` = only subfolders)
 * @param recursive - whether to parse subbolders recursively
 * @returns `string[]` root directory content paths
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
 * @param parse  Parse content to string or JSON decode (default Buffer)
 * @param _default  Default result on parse failure [default: `undefined`]
 * @returns `T|undefined` Parsed data or `undefined` on failure
 */
export declare const _readSync: <T extends unknown>(path: string, parse?: boolean | 'json', _default?: T | undefined) => T;
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
 * Get process working directory (`process.cwd()`)
 *
 * @returns `string`
 */
export declare const _processCwd: () => string;
/**
 * Get parsed process arguments (`process.argv`) as options
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
/**
 * Get hash algorithms
 *
 * @returns `string[]` ~ `RSA-MD5`, `RSA-RIPEMD160`, `RSA-SHA1`, `RSA-SHA1-2`, `RSA-SHA224`, `RSA-SHA256`, `RSA-SHA3-224`, `RSA-SHA3-256`, `RSA-SHA3-384`, `RSA-SHA3-512`, `RSA-SHA384`, `RSA-SHA512`, `RSA-SHA512/224`, `RSA-SHA512/256`, `RSA-SM3`, `blake2b512`, `blake2s256`, `id-rsassa-pkcs1-v1_5-with-sha3-224`, `id-rsassa-pkcs1-v1_5-with-sha3-256`, `id-rsassa-pkcs1-v1_5-with-sha3-384`, `id-rsassa-pkcs1-v1_5-with-sha3-512`, `md5`, `md5-sha1`, `md5WithRSAEncryption`, `ripemd`, `ripemd160`, `ripemd160WithRSA`, `rmd160`, `sha1`, `sha1WithRSAEncryption`, `sha224`, `sha224WithRSAEncryption`, `sha256`, `sha256WithRSAEncryption`, `sha3-224`, `sha3-256`, `sha3-384`, `sha3-512`, `sha384`, `sha384WithRSAEncryption`, `sha512`, `sha512-224`, `sha512-224WithRSAEncryption`, `sha512-256`, `sha512-256WithRSAEncryption`, `sha512WithRSAEncryption`, `shake128`, `shake256`, `sm3`, `sm3WithRSAEncryption`, `ssl3-md5`, `ssl3-sha1`
 */
export declare const _hashes: () => string[];
/**
 * Get file checksum hash
 *
 * @param path - file path
 * @param algo - hash algorithm (default: `'sha256'`) ~ see `_hashes()`
 * @returns `Promise<string>` ~ hash result | `''` on error
 */
export declare const _hashFile: (path: string, algo?: string) => Promise<string>;
/**
 * Rename existing file path
 *
 * @param path - file path
 * @param dupes - allow duplicates (default: `false` ~ appends number)
 * @param prefix - basename prefix text
 * @param append - basename append text
 * @returns `string` ~ renamed path
 */
export declare const _renamePath: (path: string, dupes?: boolean, prefix?: string, append?: string) => string;
/**
 * Copy file with progress
 *
 * @param from_path - copy file source
 * @param to_path  - copy file destination
 * @param overwrite - whether to overwrite existing
 * @returns `Promise<any>`
 */
export declare const _copyFile: (from_path: string, to_path: string, overwrite?: boolean, onProgress?: ((percent: number, copied_size: number, total_size: number) => void) | undefined) => Promise<any>;
