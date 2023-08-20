/**
 * Compare multiple values with deep matching
 * - compareTarget	= `args[0]`
 * - compareWith	= `args[1*]`
 * 
 * @returns `boolean` is match
 */
export const _compare = (...args: any[]): boolean => {
	let leftChain: any[] = [];
	let rightChain: any[] = [];
	
	//check arguments
	if (args.length < 1){
		console.warn(`${args.length ? 'Less than two' : 'No'} \`_compare\` arguments provided.`);
		return true;
	}

	//compare values
	for (let i = 1; i < args.length; i ++){
		leftChain = [];
		rightChain = [];
		if (!deepMatch(args[0], args[i])) return false;
	}
	return true;

	//deep compare two items
	function deepMatch(a: any, b: any): boolean {
		
		//Note that NaN === NaN returns false and isNaN(undefined) returns true
		if ('number' === typeof a && 'number' === typeof b && isNaN(a) && isNaN(b)) return true;

		//Check if both arguments link to the same object.
		if (a === b) return true;

		//Check functions in case when functions are created in constructor (i.e. dates, built-ins)
		if (
			('function' === typeof a && 'function' === typeof b)
			|| (a instanceof Date && b instanceof Date)
			|| (a instanceof RegExp && b instanceof RegExp)
			|| (a instanceof String && b instanceof String)
			|| (a instanceof Number && b instanceof Number)
		) return a.toString() === b.toString();

		//Check prototypes
		if (!(a instanceof Object && b instanceof Object)) return false;
		if (a.isPrototypeOf(b) || b.isPrototypeOf(a)) return false;
		if (a.constructor !== b.constructor) return false;
		if (a.prototype !== b.prototype) return false;

		//Check for infinitive linking loops
		if (leftChain.indexOf(a) > -1 || rightChain.indexOf(b) > -1) return false;

		//Check b props in a
		for (let key in b){
			if (b.hasOwnProperty(key) === a.hasOwnProperty(key)){
				if (typeof b[key] !== typeof a[key]) return false;
			}
		}

		//Check a props in b
		for (let key in a){
			if (b.hasOwnProperty(key) !== a.hasOwnProperty(key)) return false;
			else if (typeof b[key] !== typeof a[key]) return false;
			let val_a = a[key];
			let val_b = b[key];
			switch (typeof val_a){
				case 'object':
				case 'function':
					leftChain.push(a);
					rightChain.push(b);
					if (!deepMatch(val_a, val_b)) return false;
					leftChain.pop();
					rightChain.pop();
					break;

				default:
					if (val_a !== val_b) return false;
					break;
			}
		}

		//matched
		return true;
	}
}