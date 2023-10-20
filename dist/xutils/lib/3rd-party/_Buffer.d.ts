/// <reference types="node" />
import { BufferString, BufferEncoding } from '../types';
/**
 * Buffer object
 */
export declare const Buffer: BufferConstructor;
/**
 * Check if value is valid length
 *
 * @param value
 * @returns `boolean`
 */
export declare const _isBuffer: (value: any) => boolean;
/**
 * Base64 encode
 * - Example: `_base64Encode('Hello world!')` => `'SGVsbG8gd29ybGQh'`
 *
 * @param buffer
 * @param bufferEncoding
 * @returns base64 encoded `string`
 */
export declare const _base64Encode: (buffer: BufferString, bufferEncoding?: BufferEncoding) => string;
/**
 * Base64 decode
 * - Example: `_base64Decode('SGVsbG8gd29ybGQh')` => `<Buffer 48 65 6c 6c 6f 20 77 6f 72 6c 64 21>`
 * - Example: `_base64Decode('SGVsbG8gd29ybGQh').toString()` => `'Hello world!'`
 *
 * @param base64
 * @returns decoded `Buffer`
 */
export declare const _base64Decode: (base64: string) => Buffer;
