/**
 * Type boolean equivalent
 */
export type bool = boolean|1|0;

/**
 * With implicit coercion type
 */
export type WithImplicitCoercion<T> = T | {
	valueOf(): T;
};

/**
 * Buffer string type
 */
export type BufferString = WithImplicitCoercion<string> | {
	[Symbol.toPrimitive](hint: 'string'): string;
}

/**
 * Buffer encoding
 */
export type BufferEncoding = 'ascii'|'utf8'|'utf-8'|'utf16le'|'ucs2'|'ucs-2'|'base64'|'base64url'|'latin1'|'binary'|'hex';
