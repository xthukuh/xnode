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
     * Get standardized text formats
     *
     * @param formats Text format(s)
     * @returns `string[]`
     */
    static get getFormats(): (formats: string | string[]) => string[];
    /**
     * Text format log arguments
     *
     * @param formats  Text format(s)
     * @param args  Format values
     * @returns `ITermFormat`
     */
    static get format(): (formats: string | string[], ...args: any[]) => ITermFormat;
    /**
     * Clean text value formatting
     *
     * @param args  Formatted values
     * @returns `any[]` Clear values
     */
    static get clean(): (...args: any[]) => any[];
    /**
     * Get formatted text
     *
     * @param value  Text value
     * @param formats  Text format(s)
     * @returns `string` Formatted
     */
    static get text(): (value: string, formats?: string | string[]) => string;
    /**
     * Log empty line ~ `console.log(' ')`
     */
    static br(): void;
    /**
     * Log `console.log` format
     *
     * @param args
     */
    static log(...args: any[]): void;
    /**
     * Debug `console.debug` format
     *
     * @param args
     */
    static debug(...args: any[]): void;
    /**
     * Error `console.error` format
     *
     * @param args
     */
    static error(...args: any[]): void;
    /**
     * Warn `console.warn` format
     *
     * @param args
     */
    static warn(...args: any[]): void;
    /**
     * Info `console.info` format
     *
     * @param args
     */
    static info(...args: any[]): void;
    /**
     * Success `console.log` format
     *
     * @param args
     */
    static success(...args: any[]): void;
    /**
     * Get value list
     *
     * @param value
     * @param _entries
     */
    static get list(): (value: any, _entries?: boolean) => [list: any[], type: 'values' | 'entries'];
    /**
     * Custom `console.table` logger
     *
     * @param data
     * @param cellMaxLength
     */
    static get table(): (data: any, cellMaxLength?: number, divider?: boolean) => void;
    /**
     * Console clear logs
     */
    static get clear(): () => void;
}
