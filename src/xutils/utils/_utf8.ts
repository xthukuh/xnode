import { _str } from './_string';

/**
 * The [escape()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/escape) function ~ _**deprecation-alt**_
 * - Replaces all characters with escape sequences, with the exception of ASCII word characters `(A–Z, a–z, 0–9, _)` and `@\*_+-./`.
 * - [EcmaScript spec](https://262.ecma-international.org/5.1/#sec-B.2.1)
 * 
 * @param value - parse text
 * @returns `string` escaped text
 */
export const _escape = (value: any): string => {
	const text: string = _str(value);
	if (!text.length) return text;
	let buffer: string = '';
	const skip: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@*_+-./,';
	for (let i = 0; i < text.length; i ++){
		let char: string = text[i];
		if (skip.indexOf(char) < 0){
			const ord: number = text.charCodeAt(i);
			char = ord < 256 ? '%' + ('00' + ord.toString(16)).toUpperCase().slice(-2) : '%u' + ('0000' + ord.toString(16)).toUpperCase().slice(-4);
		}
		buffer += char;
	}
	return buffer;
};


/**
 * The [unescape()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/unescape) function ~ _**deprecation-alt**_
 * - Computes a new string in which hexadecimal escape sequences are replaced with the characters that they represent ~ _see `_escape()`_
 * - [EcmaScript spec](https://262.ecma-international.org/5.1/#sec-B.2.2)
 * 
 * @param value - parse text
 * @returns `string` unescaped text
 */
export const _unescape = (value: any): string => {
	const text: string = _str(value), len: number = text.length;
	if (!len) return text;
	let buffer: string = '', k: number = 0;
	while (k < len){
		let char: string = text[k];
		if (char === '%'){ //7
			let chars: string = k <= (len - 6) && text[k + 1] === 'u' ? text.substring(k + 2, k + 6) : (k <= (len - 3) ? text.substring(k + 1, k + 3) : '');
			if (!/^[0-9A-F]+$/i.test(chars)) chars = '';
			if (chars.length === 4){
				char = String.fromCharCode(parseInt(chars, 16));
				k += 5;
			}
			else if (chars.length === 2){
				char = String.fromCharCode(parseInt('00' + chars, 16));
				k += 2;
			}
		}
		buffer += char; //18
		k += 1;
	}
	return buffer;
};

/**
 * UTF8 encode text ~ [REF](https://ecmanaut.blogspot.com/2006/07/encoding-decoding-utf8-in-javascript.html)
 * 
 * @param value - parse text
 * @returns `string` UTF8 encoded text
 */
export const _utf8Encode = (value: any): string => _unescape(encodeURIComponent(_str(value)));

/**
 * UTF8 decode text
 * 
 * @param value - parse text
 * @returns `string` UTF8 decoded text
 */
export const _utf8Decode = (value: any): string => decodeURIComponent(_escape(value));