/**
 * Split `array` into batches `T[][]` of specified size.
 *
 * @example
 * _batchValues<number>([1,2,3,4,5,6,7,8], 3) => [[1,2,3],[4,5,6],[7,8]]
 *
 * @param array  Batch values
 * @param batchSize  Batch size `x > 0`.
 * @returns `<T = any>[][]`
 */
export declare const _batchValues: <T = any>(array: T[], batchSize: number) => T[][];
