"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._removeFile = exports._removeDir = exports._processArgs = exports._writeSync = exports._readSync = exports._readLines = exports._lsDir = exports._pathExists = void 0;
const Fs = require("fs");
const Path = require("path");
const Readline = require("readline");
const xutils_1 = require("xutils");
/**
 * Get existing path type
 *
 * @param path
 * @returns `0|1|2` ~> `0` = not found | `1` = file | `2` = directory
 */
const _pathExists = (path) => {
    try {
        const stats = Fs.statSync(path);
        if (stats.isFile())
            return 1;
        if (stats.isDirectory())
            return 2;
    }
    catch (e) { }
    return 0;
};
exports._pathExists = _pathExists;
/**
 * Get directory listing
 *
 * @param dir  Directory path
 * @param mode  List mode (i.e. `0` = all | `1` = only files | `2` = only subfolders)
 * @param recursive  List recursively `boolean`
 * @returns `string[]` Paths array
 */
const _lsDir = (dir, mode = 0, recursive = false) => __awaiter(void 0, void 0, void 0, function* () {
    if ((0, exports._pathExists)(dir) !== 2)
        throw new Error(`List directory path not found: "${dir.replace(/\\/g, '/')}".`);
    if (![0, 1, 2].includes(mode))
        mode = 0;
    recursive = !!recursive;
    const items = yield Fs.promises.readdir(dir, { withFileTypes: true });
    return items.reduce((promise, item) => __awaiter(void 0, void 0, void 0, function* () {
        return promise.then((prev) => __awaiter(void 0, void 0, void 0, function* () {
            const path = Path.resolve(dir, item.name);
            if (item.isDirectory()) {
                if ([0, 2].includes(mode))
                    prev.push(path);
                if (!recursive)
                    return prev;
                const _files = yield (0, exports._lsDir)(path, mode, recursive);
                prev.push(..._files);
            }
            else if ([0, 1].includes(mode))
                prev.push(path);
            return prev;
        }));
    }), Promise.resolve([]));
});
exports._lsDir = _lsDir;
/**
 * Read file content lines `callback` (Aborts if `callback` result is `false`);
 *
 * @param file  File path
 * @param callback  Read line handler
 * @returns `number` Total lines read
 */
const _readLines = (file, handler) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_1, _b, _c;
    if ((0, exports._pathExists)(file) !== 1)
        throw new Error(`Read lines file path not found: "${file.replace(/\\/g, '/')}".`);
    const fileStream = Fs.createReadStream(file);
    const rl = Readline.createInterface({ input: fileStream, crlfDelay: Infinity });
    let n = 0;
    try {
        for (var _d = true, rl_1 = __asyncValues(rl), rl_1_1; rl_1_1 = yield rl_1.next(), _a = rl_1_1.done, !_a; _d = true) {
            _c = rl_1_1.value;
            _d = false;
            let line = _c;
            n++;
            const res = yield (() => __awaiter(void 0, void 0, void 0, function* () { return handler(line, n); }))();
            if (res === false)
                break;
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (!_d && !_a && (_b = rl_1.return)) yield _b.call(rl_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return n;
});
exports._readLines = _readLines;
/**
 * Read file contents
 *
 * @param path  File path
 * @param json  JSON decode
 * @param _default  Default result on parse failure [default: `undefined`]
 * @returns `T|undefined` Parsed data or `undefined` on failure
 */
const _readSync = (path, json = false, _default = undefined) => {
    try {
        if ((0, exports._pathExists)(path) !== 1)
            throw new Error('Read file path is invalid.');
        const contents = Fs.readFileSync(path).toString();
        return json ? (0, xutils_1._jsonParse)(contents, _default) : contents;
    }
    catch (e) {
        return _default;
    }
};
exports._readSync = _readSync;
/**
 * Write file contents
 *
 * @param path  File path
 * @param content  Write content
 * @param append  [default: `false` (overwrite)] Append content
 * @param abortController  `AbortController`
 * @returns `void`
 */
const _writeSync = (path, content, append = false, abortController = undefined) => {
    const _options = {};
    if (abortController instanceof AbortController) {
        const { signal } = abortController;
        _options.signal = signal;
    }
    if (append)
        _options.flag = 'a+';
    return Fs.writeFileSync(path, content, _options);
};
exports._writeSync = _writeSync;
/**
 * Parse `process.argv` options
 *
 * @returns `{[key: string]: string|boolean}`
 */
const _processArgs = () => {
    if (!(Array.isArray(process === null || process === void 0 ? void 0 : process.argv) && process.argv.length > 2))
        return {};
    const args = process.argv.slice(2), options = {};
    let key = undefined, opts = 0;
    args.forEach((val, i) => {
        let matches;
        if (!(matches = val.match(/(^|\s)(--([_0-9a-zA-Z][-_0-9a-zA-Z]*[_0-9a-zA-Z]))($|([ =])(.*)$)/)))
            matches = val.match(/(^|\s)(-([a-zA-Z]))($|([ =])(.*)$)/);
        if (matches && matches.length >= 7) {
            const k = matches[2];
            const e = 'string' === typeof matches[5] ? matches[5] : '';
            const v = 'string' === typeof matches[6] ? (e !== '=' ? e : '') + matches[6] : '';
            if (e === '=' || v.length) {
                options[k] = v === 'false' ? false : v;
                key = undefined;
            }
            else
                options[key = k] = true;
            if (!opts)
                opts = 1;
            return;
        }
        if (key !== undefined) {
            options[key] = val === 'false' ? false : val;
            key = undefined;
            return;
        }
        key = undefined;
        if (opts)
            return console.warn(`[W] _processArgs: Ignored "${val}" option. Invalid argument format.`);
        options[`${i}`] = val;
    });
    return options;
};
exports._processArgs = _processArgs;
/**
 * Delete directory - returns (1 = success, 0 = failure, -1 = invalid path/not found)
 *
 * @param path  Directory path
 * @param recursive  Delete directory contents
 * @returns `number` 1 = success, 0 = failure, -1 = invalid path/not found
 */
const _removeDir = (path, recursive = false) => {
    try {
        if ((0, exports._pathExists)(path = path.trim()) !== 2)
            return -1;
        Fs.rmSync(path, { recursive, force: true });
        return 1;
    }
    catch (e) {
        console.warn('[W] _removeDir:', e);
        return 0;
    }
};
exports._removeDir = _removeDir;
/**
 * Delete file - returns (1 = success, 0 = failure, -1 = invalid path/not found)
 *
 * @param path
 * @returns `number` 1 = success, 0 = failure, -1 = invalid path/not found
 */
const _removeFile = (path) => {
    try {
        if ((0, exports._pathExists)(path = path.trim()) !== 1)
            return -1;
        Fs.unlinkSync(path);
        return 1;
    }
    catch (e) {
        console.warn('[W] _removeFile:', e);
        return 0;
    }
};
exports._removeFile = _removeFile;
