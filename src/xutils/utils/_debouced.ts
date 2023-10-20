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
export const _debouced = (handler: (...args: any)=>void, delay: number = 200, maxWait: number = 0, immediate: bool = false): ((...args: any)=>void) => {
	delay = !isNaN(delay = parseFloat(delay as any)) && delay >= 0 ? delay : 200;
	maxWait = !isNaN(maxWait = parseFloat(maxWait as any)) && maxWait >= 0 && maxWait > delay ? maxWait : 0;
	immediate = !!immediate;
	let immediateTimer: any, callTimer: any, waitTimer: any, nextCall: [context: any, args: any[]] | undefined;
	const execute = (is_immediate?:bool) => {
		let next = nextCall;
		nextCall = undefined;
		if (waitTimer){
			clearTimeout(waitTimer);
			waitTimer = undefined;
		}
		if (callTimer && !is_immediate){
			clearTimeout(callTimer);
			callTimer = undefined;
		}
		if (next?.length && 'function' === typeof handler) handler.apply(...next);
		if (delay && immediate && !is_immediate){
			immediateTimer = setTimeout(() => {
				clearTimeout(immediateTimer);
				immediateTimer = undefined;
			}, delay);
		}
	};
	const wrapper = function(this: any, ...args: any[]){
		nextCall = [this, args];
		if (!delay) return execute();
		const _next = (no_wait=0) => {
			clearTimeout(callTimer);
			callTimer = setTimeout(() => execute(), delay);
			if (!no_wait && maxWait && !waitTimer) waitTimer = setTimeout(() => execute(), maxWait);
		};
		if (!(immediate && !immediateTimer && !callTimer)) return _next();
		_next(1)
		execute(1);
	};
	Object.defineProperties(wrapper, {
		length: {value: handler.length},
		name: {value: `${handler.name||'anonymous'}__debounced__${delay}`},
	});
	return wrapper;
};