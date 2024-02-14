/**
 * AlphaPos private props key
 */
const PROPS = Symbol('AlphaInt');

/**
 * Alphabetical integer
 * 
 * @class AlphaInt
 */
export class AlphaInt
{
	/**
	 * Alphabet characters
	 */
	static get CHARS(){
		return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	}

	/**
	 * instance props
	 */
	[PROPS]: {value: number, sign: 1|-1} = {value: 0, sign: 1};

	/**
	 * `value` getter
	 */
	get value(): number {
		return this[PROPS].value * this[PROPS].sign;
	}

	/**
	 * `value` setter
	 */
	set value(value) {
		const val: number = parseInt(value as any) || 0;
		this[PROPS].sign = val < 0 ? -1 : 1;
		this[PROPS].value = Math.abs(val);
	}

	/**
	 * `indexes` getter
	 */
	get indexes(): number[] {
		const chars = AlphaInt.CHARS, base: number = chars.length, buffer: number[] = [];
		let dec: number = this[PROPS].value;
		let n = 0;
		while (1){
			buffer.unshift(Math.max((dec%base)-n, 0));
			if (!(dec = Math.floor(dec/base))) break;
			n = 1;
		}
		if (this[PROPS].sign === -1) buffer.unshift(-1);
		return buffer;
	}
	
	/**
	 * `indexes` getter
	 */
	set indexes(value) {
		if ('object' !== typeof value && !isNaN(parseInt(value))){
			this.value = value;
			return;
		}
		const chars = AlphaInt.CHARS, base: number = chars.length;
		const indexes: number[] = [];
		if ('string' === typeof value){
			const arr: string[] = String(value).split('');
			for (let i = 0; i < arr.length; i ++){
				const c = arr[i];
				if (c === '-' && !i){
					indexes.push(-1);
					continue;
				}
				const n = chars.indexOf(c);
				if (n < 0) throw new TypeError(`Invalid AlphaInt character value "${c}" at ${i}`);
				indexes.push(n);
			}
		}
		else {
			const arr: number[] = [...value];
			for (let i = 0; i < arr.length; i ++){
				const n = arr[i];
				if (n === -1 && !i){
					indexes.push(n);
					continue;
				}
				if (!(n >= 0 && n < base)) throw new TypeError(`Invalid AlphaInt indexes value "${n}" at ${i}`);
				indexes.push(n);
			}
		}
		let dec: number = 0;
		// console.log('-- indexes', indexes);
		let sign = 1;
		for (const i of indexes){
			if (i === -1){
				sign = -1;
				continue;
			}
			dec = dec * base + i + 1;
		}
		if (dec >= base) dec -= 1;
		this.value = dec * sign;
	}

	/**
	 * `text` getter
	 */
	get text(): string {
		const chars = AlphaInt.CHARS;
		let text: string = '';
		let arr: number[] = this.indexes;
		if (arr[0] === -1){
			arr = arr.slice(1);
			if (arr.length) text = '-';
		}
		text += arr.map(v => chars[v]).join('');
		return text;
	}

	/**
	 * New `AlphaNum` instance
	 * 
	 * @param value - (default: `0`) initial value ~ _**absolute integer**_
	 */
	constructor(value: number = 0){
		this.value = value;
	}

	/**
	 * Set `value`
	 * 
	 * @param value - add value ~ _**absolute integer**_
	 * @returns `AlphaInt` ~ instance
	 */
	set(value: number): AlphaInt {
		this.value = value;
		return this;
	}

	/**
	 * Add `value`
	 * 
	 * @param value - (default: `1`) add value ~ _**absolute integer**_
	 * @returns `AlphaInt` ~ instance
	 */
	add(value: number = 1): AlphaInt {
		this.value += parseInt(value as any) || 0;
		return this;
	}

	/**
	 * Get text value
	 * 
	 * @returns `string`
	 */
	toString(): string {
		return this.text;
	}

	/**
	 * Parse `AlphaInt` text (i.e. 'BXX')
	 * @param value 
	 * @returns 
	 */
	static parse(value: any): AlphaInt {
		const instance: AlphaInt = new AlphaInt();
		instance.indexes = value;
		return instance;
	}
}