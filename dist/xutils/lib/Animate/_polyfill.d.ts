/**
 * Export polyfill for `window.requestAnimationFrame` and `window.cancelAnimationFrame`.
 *
 * This polyfill provides compatibility for browsers that do not support `requestAnimationFrame`
 * and `cancelAnimationFrame` by default. It checks for vendor-prefixed implementations and
 * falls back to a timeout-based solution if necessary.
 *
 * @constant {[(callback: (time: number) => void) => number, (handle: number) => void]}
 */
export declare const requestAnimationFrame: (callback: (time: number) => void) => number, cancelAnimationFrame: (handle: number) => void;
