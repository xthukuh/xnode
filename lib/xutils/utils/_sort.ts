/**
 * Sort direction type
 */
export type SortDirection = 1|-1|'asc'|'desc'|'ascending'|'descending';

/**
 * Sort order type
 */
export type SortOrder = SortDirection|{[key: string]: SortDirection};

/**
 * Sort array values
 * 
 * @param array
 * @param sort
 * @returns Sorted `array`
 */
export const _sortValues = <T extends any>(array: T[], sort?: SortOrder): T[] => {
	const _compare = (a: any, b: any): number => {
		if ('string' === typeof a && 'string' === typeof b && 'function' === typeof a?.localeCompare) return a.localeCompare(b);
		return a > b ? 1 : (a < b ? -1 : 0);
	};
	const _direction = (val?: SortDirection): number => {
		if ('number' === typeof val && [1, -1].includes(val)) return val;
		if ('string' === typeof val){
			if (val.startsWith('asc')) return 1;
			if (val.startsWith('desc')) return -1;
		}
		return 1;
	};
	const _method = (): ((a: any, b: any)=>number) => {
		if (Object(sort) === sort){
			const _entries = Object.entries(sort as {[key: string]: SortDirection});
			if (_entries.length) return (a, b) => {
				let i, result;
				for (result = 0, i = 0; result === 0 || i < _entries.length; i ++){
					const [key, val] = _entries[i];
					result = _compare(a?.[key], b?.[key]) * _direction(val);
				}
				return result;
			};
		}
		return (a, b) => _compare(a, b) * _direction(sort as SortDirection);
	};
	return array.sort(_method());
};