import { bool } from '../types';
/**
 * Create debounced callback function
 *
 * @param handler  Throttled callback handler
 * @param delay  Callback delay milliseconds
 * @param maxWait  Maximum callback delay milliseconds
 * @param immediate  Execute callback before delay
 * @returns Throttled callback function
 */
export declare const _debouced: (handler: (...args: any) => void, delay?: number, maxWait?: number, immediate?: bool) => (...args: any) => void;
