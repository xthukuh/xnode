/**
 * Term format result interface
 */
export interface ITermFormat {
    method: (value: undefined | 'log' | 'debug' | 'warn' | 'error' | 'info') => ITermFormat;
    format: (formats: string | string[], ...args: any[]) => ITermFormat;
    values: (...args: any[]) => any[];
    clean: (...args: any[]) => any[];
    log: (message?: any, ...optionalParams: any[]) => void;
    debug: (message?: any, ...optionalParams: any[]) => void;
    warn: (message?: any, ...optionalParams: any[]) => void;
    error: (message?: any, ...optionalParams: any[]) => void;
    info: (message?: any, ...optionalParams: any[]) => void;
}
/**
 * Term `console.*` logger
 */
export declare class Term {
    /**
     * Format disabled
     */
    static get FORMAT_DISABLED(): boolean;
    static set FORMAT_DISABLED(value: any);
    /**
     * Console log methods
     */
    static get LOG_METHODS(): string[];
    /**
     * Preferred console log method
     */
    static get LOG_METHOD(): undefined | 'log' | 'debug' | 'warn' | 'error' | 'info';
    static set LOG_METHOD(value: any);
    /**
     * Text formats
     */
    static get FORMATS(): {
        [key: string]: string;
    };
    /**
     * Predefined text formats
     */
    static get PREDEFINED_FORMATS(): {
        [key: string]: string | string[];
    };
    /**
     * Parse standard text formats
     *
     * @param formats - text formats
     * @returns `string[]`
     */
    static getFormats(formats: string | string[]): string[];
    /**
     * Format text items
     *
     * @param formats - text formats
     * @param args - parse items (arguments)
     * @returns `ITermFormat`
     */
    static format(formats: string | string[], ...args: any[]): ITermFormat;
    /**
     * Clean/remove text formatting
     *
     * @param args - parse items (arguments)
     * @returns `any[]`
     */
    static clean(...args: any[]): any[];
    /**
     * Format text
     *
     * @param value - format text
     * @param formats - text formats
     * @returns `string`
     */
    static text(value: string, formats?: string | string[]): string;
    /**
     * Print line ~ `console.log(' ')`
     */
    static br(): void;
    /**
     * Print log ~ `console.log(..)`
     *
     * @param args - log arguments
     */
    static log(...args: any[]): void;
    /**
     * Print debug ~ `console.debug(..)`
     *
     * @param args - log arguments
     */
    static debug(...args: any[]): void;
    /**
     * Print error ~ `console.error(..)`
     *
     * @param args - log arguments
     */
    static error(...args: any[]): void;
    /**
     * Print warning ~ `console.warn(..)`
     *
     * @param args - log arguments
     */
    static warn(...args: any[]): void;
    /**
     * Print info ~ `console.info(..)`
     *
     * @param args - log arguments
     */
    static info(...args: any[]): void;
    /**
     * Print success ~ `console.log('..')`
     *
     * @param args - log arguments
     */
    static success(...args: any[]): void;
    /**
     * Parse list items
     *
     * @param value - parse value
     * @param _entries - (default: `false`) whether to parse entries ~ `Object.entries(value)`
     * @returns `[list: any[], type:'values'|'entries']`
     */
    static list(value: any, _entries?: boolean): [list: any[], type: 'values' | 'entries'];
    /**
     * ### Print table ~ `console.table`
     *
     * _uses process argument options as default values for params:_
     * - `cellMaxLength` = `--cellMaxLength=##` (where `##` is positive integer)
     * - `divider` = `--divider` | `--divider=false`
     * - `noIndex` = `--noIndex` | `--noIndex=false`
     *
     * @param data - log data
     * @param cellMaxLength - (default: `250`) table max cell length (width)
     * @param divider - (default: `false`) whether to add row divider
     * @param noIndex - (default: `false`) whether to remove index column ([#])
     */
    static table(data: any, cellMaxLength?: number, divider?: boolean, noIndex?: boolean): void;
    /**
     * Console clear logs
     */
    static get clear(): () => void;
}
