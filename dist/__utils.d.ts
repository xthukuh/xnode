export declare const _print: (text: string, _error?: boolean) => void;
export declare const _isWin: () => boolean;
export declare const _dirPath: (dir: string, silent?: boolean, type?: string) => string;
export declare const _normSep: (v: string) => string;
/**
 * ProgTerm props key
 */
declare const PROG_TERM_PROPS: unique symbol;
/**
 * @class `ProgTerm` ~ process logger with progress
 */
export declare class ProgTerm {
    /**
     * Progress line
     */
    static PROGRESS_LINE: string;
    /**
     * Instance props
     */
    [PROG_TERM_PROPS]: {
        percent: number;
        label: string;
        format: string | string[];
        mode: -1 | 0 | 1;
        _clear: number;
    };
    /**
     * Get/set progress percent ~ `0-100`
     */
    get percent(): number;
    set percent(value: any);
    /**
     * Get/set progress label
     */
    get label(): string;
    set label(value: any);
    /**
     * Get/set progress format
     */
    get format(): string | string[];
    set format(value: any);
    /**
     * Get/set print progress mode ~ `-1` - disabled, `0` - (default) auto, `1` - enabled
     */
    get mode(): -1 | 0 | 1;
    set mode(value: any);
    /**
     * New instance
     *
     * @param percent - progress percent (default: `0`)
     * @param label - progress label (default: `''`)
     * @param format - progress format (default: `'dump'`)
     */
    constructor(percent?: number, label?: string, format?: string | string[]);
    /**
     * Handle print
     *
     * @param method - `Term` method
     * @param args - method args
     */
    print(method?: 'log' | 'debug' | 'error' | 'warn' | 'info' | 'success' | 'clear' | 'table', args?: any[]): void;
    /**
     * Set progress values
     *
     * @param percent - progress percent
     * @param label - progress label
     * @param format - progress format
     * @returns `ProgTerm` - this instance
     */
    set(percent?: number, label?: string, format?: string | string[]): ProgTerm;
    /**
     * Print log
     *
     * @param args - log args
     */
    log(...args: any[]): void;
    /**
     * Print debug
     *
     * @param args - print args
     */
    debug(...args: any[]): void;
    /**
     * Print error
     *
     * @param args - print args
     */
    error(...args: any[]): void;
    /**
     * Print warn
     *
     * @param args - print args
     */
    warn(...args: any[]): void;
    /**
     * Print info
     *
     * @param args - print args
     */
    info(...args: any[]): void;
    /**
     * Print success
     *
     * @param args - print args
     */
    success(...args: any[]): void;
    /**
     * Print clear
     *
     * @param args - print args
     */
    clear(): void;
    /**
     * Print table
     *
     * @param args - print args
     */
    table(data: any, cellMaxLength?: number, divider?: boolean): void;
}
export {};
