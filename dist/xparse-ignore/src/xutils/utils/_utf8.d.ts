/**
 * The [escape()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/escape) function ~ _**deprecation-alt**_
 * - Replaces all characters with escape sequences, with the exception of ASCII word characters `(A–Z, a–z, 0–9, _)` and `@\*_+-./`.
 * - [EcmaScript spec](https://262.ecma-international.org/5.1/#sec-B.2.1)
 *
 * @param value - parse text
 * @returns `string` escaped text
 */
export declare const _escape: (value: any) => string;
/**
 * The [unescape()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/unescape) function ~ _**deprecation-alt**_
 * - Computes a new string in which hexadecimal escape sequences are replaced with the characters that they represent ~ _see `_escape()`_
 * - [EcmaScript spec](https://262.ecma-international.org/5.1/#sec-B.2.2)
 *
 * @param value - parse text
 * @returns `string` unescaped text
 */
export declare const _unescape: (value: any) => string;
/**
 * UTF8 encode text ~ [REF](https://ecmanaut.blogspot.com/2006/07/encoding-decoding-utf8-in-javascript.html)
 *
 * @param value - parse text
 * @returns `string` UTF8 encoded text
 */
export declare const _utf8Encode: (value: any) => string;
/**
 * UTF8 decode text
 *
 * @param value - parse text
 * @returns `string` UTF8 decoded text
 */
export declare const _utf8Decode: (value: any) => string;
