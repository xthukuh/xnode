/**
 * Split `array` into batches `T[][]` of specified size.
 * - i.e. `_batchValues<number>([1,2,3,4,5,6,7,8], 3)` => `[[1,2,3],[4,5,6],[7,8]]`
 * 
 * @param array  Batch values
 * @param batchSize  Batch size `x > 0`.
 * @returns  `T[][]`
 */
export const _batchValues = <T extends any>(array: T[], batchSize: number): T[][] => {
	if (!(Number.isInteger(batchSize) && batchSize > 0)) throw new Error('Invalid batch size.');
	const _array = array.slice(0), _buffer: T[][] = [];
	while (_array.length) _buffer.push(_array.splice(0, batchSize));
	return _buffer;
};