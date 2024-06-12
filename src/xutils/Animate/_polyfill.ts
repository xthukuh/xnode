/**
 * Export polyfill for `window.requestAnimationFrame` and `window.cancelAnimationFrame`.
 * 
 * This polyfill provides compatibility for browsers that do not support `requestAnimationFrame`
 * and `cancelAnimationFrame` by default. It checks for vendor-prefixed implementations and
 * falls back to a timeout-based solution if necessary.
 * 
 * @constant {[(callback: (time: number) => void) => number, (handle: number) => void]}
 */
export const [requestAnimationFrame, cancelAnimationFrame] = (() => {
	let _requestAnimationFrame: any = undefined;
	let _cancelAnimationFrame: any = undefined;
	if ('undefined' !== typeof window){
		const vendors = ['ms', 'moz', 'webkit', 'o'];
		_requestAnimationFrame = window.requestAnimationFrame;
		_cancelAnimationFrame = window.cancelAnimationFrame;
		for (let i = 0; i < vendors.length && !_requestAnimationFrame; i ++){
			const vendor: any = vendors[i];
			_requestAnimationFrame = window[`${vendor}RequestAnimationFrame` as any];
			_cancelAnimationFrame = window[`${vendor}CancelAnimationFrame` as any] || window[`${vendor}CancelRequestAnimationFrame` as any];
		}
	}
	let requestAnimationFrame: (callback: ((time: number)=>void)) => number;
	if (_requestAnimationFrame) requestAnimationFrame = _requestAnimationFrame as ((callback: ((time: number)=>void)) => number);
	else {
		let prev = 0;
		requestAnimationFrame = function(callback: ((time: number)=>void)){
			let curr = new Date().getTime(),
			timeout = Math.max(0, 16 - (curr - prev)),
			time = curr + timeout;
			let id: number = setTimeout(() => 'function' === typeof callback ? callback(time) : null, timeout) as any;
			prev = time;
			return id;
		};
	}
	let cancelAnimationFrame: ((handle: number) => void);
	if (_cancelAnimationFrame) cancelAnimationFrame = _cancelAnimationFrame as ((handle: number) => void)
	else cancelAnimationFrame = function(handle: number){
		clearTimeout(handle);
	};
	if ('undefined' !== typeof window){
		if (!window.requestAnimationFrame) window.requestAnimationFrame = requestAnimationFrame;
		if (!window.cancelAnimationFrame) window.cancelAnimationFrame = cancelAnimationFrame;
	}
	return [requestAnimationFrame, cancelAnimationFrame];
})();