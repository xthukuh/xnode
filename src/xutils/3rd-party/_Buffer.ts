import { Buffer as _Buffer } from 'buffer';
import { BufferString, BufferEncoding } from '../types';

/**
 * Buffer object
 */
export const Buffer = _Buffer;

/**
 * Check if value is valid length
 * 
 * @param value
 * @returns `boolean`
 */
export const _isBuffer = (value: any): boolean => Buffer.isBuffer(value);

/**
 * Base64 encode
 * - Example: `_base64Encode('Hello world!')` => `'SGVsbG8gd29ybGQh'`
 * 
 * @param buffer
 * @param bufferEncoding
 * @returns base64 encoded `string`
 */
export const _base64Encode = (buffer: BufferString, bufferEncoding?: BufferEncoding): string => {
	return Buffer.from(buffer, bufferEncoding).toString('base64');
};

/**
 * Base64 decode
 * - Example: `_base64Decode('SGVsbG8gd29ybGQh')` => `<Buffer 48 65 6c 6c 6f 20 77 6f 72 6c 64 21>`
 * - Example: `_base64Decode('SGVsbG8gd29ybGQh').toString()` => `'Hello world!'`
 * 
 * @param base64
 * @returns decoded `Buffer`
 */
export const _base64Decode = (base64: string): Buffer => {
	return Buffer.from(base64, 'base64');
};