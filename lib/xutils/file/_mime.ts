import { _str } from '../utils';

/**
 * File extension mime types
 */
export const EXT_MIMES: {[ext: string]: string} = require('./__mimes.json');

/**
 * Mime type object interface 
 */
export interface IMimeType {
	value: any;
	type: string;
	ext: string;
	error: string;

	/**
	 * Get mime text
	 * 
	 * @param prop - text value prop
	 * @returns `string`
	 */
	toString: (
		/**
		 * Specify text value prop (default `'type'`)
		 */
		prop?: 'type'|'ext'|'error'
	)=>string;
}

/**
 * Basename error interface
 */
export interface IMimeTypeError extends Error {
	name: string;
	item: IMimeType;
}

/**
 * Get normalized file mime type (i.e. 'application/json; charset=utf-8' => 'application/json')
 * 
 * @param  string	$value	- Parse value (mime|ext|file-path)
 * @param  string	$ext		- ByRef file extension (i.e. 'txt', 'png')
 * @param  string	$error	- ByRef error message
 * @return string|false
 */
export const _mime = (value: any, _failure: 0|1|2 = 0): IMimeType => {
	const failure: 0|1|2 = [0, 1, 2].includes(_failure = parseInt(_failure + '') as any) ? _failure as (0|1|2) : 0;

	//mime type item
	const item: IMimeType = {
		value,
		type: '',
		ext: '',
		error: '',
		toString(prop?: 'type'|'ext'|'error'): string {
			const key: string = prop && ['mime', 'ext', 'error']
			.includes(prop = _str(prop, true).toLowerCase() as any) ? prop + '' : 'type';
			return this[key as 'type'|'ext'|'error'];
		}
	}
	
	//parse value
	try {
		const errors: string[] = [];
		const val: string = _str(value, true);
		if (val){
			let m: RegExpMatchArray|null = null;
			if (m = val.match(/(\.|^)([-_0-9a-zA-Z]+)$/i)){ //ext
				let ext = m[2].toLowerCase();
				if (ext === 'jpeg') ext = 'jpg';
				if (EXT_MIMES.hasOwnProperty(ext)) item.type = EXT_MIMES[item.ext = ext];
				else errors.push(`Mime file extension "${ext}" is not supported`);
			}
			else if (/^[-_a-z0-9]+\/[^\/]+$/i.test(val)){ //mime
				const found: [ext: string, type: string]|undefined = Object.entries(EXT_MIMES).find(v => v[1].startsWith(val.toLowerCase()) || val.toLowerCase().startsWith(v[1]));
				if (found){
					let [ext, type] = found;
					if (ext === 'jpeg') ext = 'jpg';
					item.ext = ext;
					item.type = type;
				}
				else errors.push(`Mime type "${val}" is not supported`);
			}
			else errors.push(`Invalid mime type or file extension string value`);
		}
		else errors.push('Blank mime type or file extension string value');
		if (errors.length) throw new Error(item.error = errors.join('; ') + '.'); //error - set, throw
		return item; //result
	}
	catch (e: any){
		if (failure){ //failure - custom error
			class MimeTypeError extends Error implements IMimeTypeError {
				name: string = 'MimeTypeError';
				item: IMimeType = item;
			}
			const error = new MimeTypeError(`${e.message || e}`);
			if (failure === 2) throw error; //throw
			else console.warn(error + '', {item}); //warn
		}
		return item; //result
	}
}