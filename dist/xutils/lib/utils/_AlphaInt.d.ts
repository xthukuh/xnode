/**
 * AlphaPos private props key
 */
declare const PROPS: unique symbol;
/**
 * Alphabetical integer
 *
 * @class AlphaInt
 */
export declare class AlphaInt {
    /**
     * Alphabet characters
     */
    static get CHARS(): string;
    /**
     * instance props
     */
    [PROPS]: {
        value: number;
        sign: 1 | -1;
    };
    /**
     * `value` getter
     */
    get value(): number;
    /**
     * `value` setter
     */
    set value(value: number);
    /**
     * `indexes` getter
     */
    get indexes(): number[];
    /**
     * `indexes` getter
     */
    set indexes(value: number[]);
    /**
     * `text` getter
     */
    get text(): string;
    /**
     * New `AlphaNum` instance
     *
     * @param value - (default: `0`) initial value ~ _**absolute integer**_
     */
    constructor(value?: number);
    /**
     * Set `value`
     *
     * @param value - add value ~ _**absolute integer**_
     * @returns `AlphaInt` ~ instance
     */
    set(value: number): AlphaInt;
    /**
     * Add `value`
     *
     * @param value - (default: `1`) add value ~ _**absolute integer**_
     * @returns `AlphaInt` ~ instance
     */
    add(value?: number): AlphaInt;
    /**
     * Get text value
     *
     * @returns `string`
     */
    toString(): string;
    /**
     * Parse `AlphaInt` text (i.e. 'BXX')
     * @param value
     * @returns
     */
    static parse(value: any): AlphaInt;
}
export {};
