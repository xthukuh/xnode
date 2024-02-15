/**
 * AlphaNum private props key
 */
declare const PROPS: unique symbol;
/**
 * Alphabetical integer
 *
 * @class AlphaNum
 */
export declare class AlphaNum {
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
     * `indexes` setter
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
     * @returns `AlphaNum` ~ instance
     */
    set(value: number): AlphaNum;
    /**
     * Add `value`
     *
     * @param value - (default: `1`) add value ~ _**absolute integer**_
     * @returns `AlphaNum` ~ instance
     */
    add(value?: number): AlphaNum;
    /**
     * Get text value
     *
     * @returns `string`
     */
    toString(): string;
    /**
     * Parse value to `AlphaNum` instance
     * - accepts `number` ~ integers (e.g. `1999` => `'BXX'`; `-1999` => `'-BXX'`)
     * - accepts `text` `/-?[A-Z]+/` (e.g. `'BXX'` => `1999`; `'-BXX'` => `-1999`)
     * - accepts indexes `array` (e.g. `[1,23,23]` => `'BXX'`|`1999`; `[-1,1,23,23]` => `'-BXX'`|`-1999`)
     *
     * @param value - parse value _**(see method docs for acceptable values)**_
     * @returns `AlphaNum` instance
     * @throws `TypeError` on failure
     */
    static parse(value: any): AlphaNum;
    /**
     * Parse value to `AlphaNum` text ~ `/-?[A-Z]+/` (e.g. `49` => `'AX'`; `49` => `'-AX'`)
     *
     * @param value - parse value _**(see parse() docs)**_
     * @returns `string`
     * @throws `TypeError` on failure
     */
    static text(value: any): string;
}
export {};
