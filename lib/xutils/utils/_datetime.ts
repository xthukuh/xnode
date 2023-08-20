/**
 * Validate `Date` instance
 * 
 * @param value
 */
export const _isDate = (value: any): boolean => value instanceof Date && !isNaN(value.getTime());

/**
 * Get/create `Date` instance
 * 
 * @param value  Parse value ~ `value instanceOf Date ? value : new Date(value)`
 * @param _default  Parse default on failure [default: `undefined` => `new Date()`]
 */
export const _getDate = (value?: any, _default?: Date|string|number|null|undefined): Date => {
	if (!_isDate(value) && !_isDate(value = new Date(value))){
		if (_default instanceof Date) value = _default;
		else if (_default === undefined) value = new Date();
		else value = new Date(_default as any);
	}
	return value;
};

/**
 * Convert `Date` value to datetime format (i.e. `2023-05-27 22:11:57` ~ `YYYY-MM-DD HH:mm:ss`)
 * 
 * @param value  Parse value ~ `value instanceOf Date ? value : new Date(value)`
 * @param _default  Parse default on failure [default: `undefined` => `new Date()`]
 */
export const _datetime = (value?: any, _default?: Date|string|number|null|undefined): string => {
	const date = _getDate(value, _default), _pad = (v: number) => `${v}`.padStart(2, '0');
	return !_isDate(date) ? `${date}` : `${date.getFullYear()}-${_pad(date.getMonth() + 1)}-${_pad(date.getDate())} ${_pad(date.getHours())}:${_pad(date.getMinutes())}:${_pad(date.getSeconds())}`;
};

/**
 * Convert `Date` value to ISO format (i.e. `new Date().toISOString()` ~ `2023-05-27T19:30:44.575Z`)
 * 
 * @param value  Parse value ~ `value instanceOf Date ? value : new Date(value)`
 * @param _default  Parse default on failure [default: `undefined` => `new Date()`]
 */
export const _timestamp = (value?: any, _default?: Date|string|number|null|undefined): string => {
	const date = _getDate(value, _default);
	return !_isDate(date) ? `${date}` : date.toISOString();
};


//TODO: (from yup) parse ISO date string
//var isoReg = /^(\d{4}|[+\-]\d{6})(?:-?(\d{2})(?:-?(\d{2}))?)?(?:[ T]?(\d{2}):?(\d{2})(?::?(\d{2})(?:[,\.](\d{1,}))?)?(?:(Z)|([+\-])(\d{2})(?::?(\d{2}))?)?)?$/;
// function parseISO(str, utcMode, xdate) {
// 	var m = str.match(/^(\d{4})(-(\d{2})(-(\d{2})([T ](\d{2}):(\d{2})(:(\d{2})(\.(\d+))?)?(Z|(([-+])(\d{2})(:?(\d{2}))?))?)?)?)?$/);
// 	if (m) {
// 					var d = new Date(UTC(
// 									m[1],
// 									m[3] ? m[3] - 1 : 0,
// 									m[5] || 1,
// 									m[7] || 0,
// 									m[8] || 0,
// 									m[10] || 0,
// 									m[12] ? Number('0.' + m[12]) * 1000 : 0
// 					));
// 					if (m[13]) { // has gmt offset or Z
// 									if (m[14]) { // has gmt offset
// 													d.setUTCMinutes(
// 																	d.getUTCMinutes() +
// 																	(m[15] == '-' ? 1 : -1) * (Number(m[16]) * 60 + (m[18] ? Number(m[18]) : 0))
// 													);
// 									}
// 					}else{ // no specified timezone
// 									if (!utcMode) {
// 													d = coerceToLocal(d);
// 									}
// 					}
// 					return xdate.setTime(d.getTime());
// 	}
// }
// XDate.locales = {
// 	'': {
// 					monthNames: ['January','February','March','April','May','June','July','August','September','October','November','December'],
// 					monthNamesShort: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
// 					dayNames: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
// 					dayNamesShort: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
// 					amDesignator: 'AM',
// 					pmDesignator: 'PM'
// 	}
// };