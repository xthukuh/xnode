/**
 * Compare multiple values with shallow matching
 * - compareTarget	= `args[0]`
 * - compareWith	= `args[1*]`
 * 
 * @param a  Compare value 1
 * @returns `boolean` is match
 */
export const _compareShallow = (...args: any[]): boolean => {

	//check values
	if (args.length < 1){
		console.warn(`${args.length ? 'Less than two' : 'No'} \`_compareShallow\` arguments provided.`);
		return true;
	}

	//compare values
	for (let i = 1; i < args.length; i ++){
		if (!shallowMatch(args[0], args[i])) return false;
	}
	return true;
	
	//shallow compare two items
	function shallowMatch(a: any, b: any): boolean {
		if (a === b) return true;
		if (!(a instanceof Object) || !(b instanceof Object)) return false;
		if (a.constructor !== b.constructor) return false;
		for (let k in a){
			if (!a.hasOwnProperty(k)) continue;
			if (!b.hasOwnProperty(k)) return false;
			if (a[k] === b[k]) continue;
			if ('object' !== typeof(a[k])) return false;
			if (!shallowMatch(a[k], b[k])) return false;
		}
		return true;
	}
};