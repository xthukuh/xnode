import { FailError, _str } from '../utils';

/**
 * File extension mime types
 */
export const EXT_MIMES: {[ext: string]: string} = require('./__mimes.json');

/**
 * Mime type object interface 
 */
export interface IMimeType {
	
	/**
	 * - parse value
	 */
	value: any;

	/**
	 * - mime type (e.g. `'image/png'`)
	 */
	type: string;

	/**
	 * - file extension (e.g. `'png'`)
	 */
	ext: string;

	/**
	 * - parse error text
	 */
	error: string;

	/**
	 * - get `string` cast
	 * 
	 * @param prop - get property (default: `'type'`)
	 * @returns `string`
	 */
	toString: (
		
		/**
		 * - get property (default `'type'`)
		 */
		prop?: 'type'|'ext'|'error'
	)=>string;
}

/**
 * Parse file mime type
 * 
 * @example String(_mime('application/json; charset=utf-8')) => 'application/json'
 * 
 * @param value - parse mime type
 * @param _failure - `FailError` mode ~ `0` = silent (default) | `1` = logs warning | `2` = logs error | `3` = throws error
 * @returns `IMimeType` stringable mime type object
 */
export const _mime = (value: any, _failure: 0|1|2|3 = 0): IMimeType => {
	
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
		new FailError(e, _failure, {item}, 'MimeTypeError');
		return item; //result
	}
}