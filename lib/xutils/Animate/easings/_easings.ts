export type EasingFunction = (time: number, begin: number, change: number, duration: number) => number;

export const easeLinear:EasingFunction = (time: number, begin: number, change: number, duration: number): number => change * time / duration + begin;

export const easeInQuad:EasingFunction = (time: number, begin: number, change: number, duration: number): number => change * (time /= duration) * time + begin;

export const easeOutQuad:EasingFunction = (time: number, begin: number, change: number, duration: number): number => -change * (time /= duration) * (time - 2) + begin;

export const easeInOutQuad:EasingFunction = (time: number, begin: number, change: number, duration: number): number => {
	if ((time /= duration / 2) < 1) return change / 2 * time * time + begin;
	return -change / 2 * ((--time) * (time - 2) - 1) + begin;
};

export const easeInSine:EasingFunction = (time: number, begin: number, change: number, duration: number): number => -change * Math.cos(time / duration * (Math.PI / 2)) + change + begin;

export const easeOutSine:EasingFunction = (time: number, begin: number, change: number, duration: number): number => change * Math.sin(time / duration * (Math.PI / 2)) + begin;

export const easeInOutSine:EasingFunction = (time: number, begin: number, change: number, duration: number): number => -change / 2 * (Math.cos(Math.PI * time / duration) - 1) + begin;

export const easeInExpo:EasingFunction = (time: number, begin: number, change: number, duration: number): number => (time === 0) ? begin : change * Math.pow(2, 10 * (time / duration - 1)) + begin;

export const easeOutExpo:EasingFunction = (time: number, begin: number, change: number, duration: number): number => (time === duration) ? begin + change : change * (-Math.pow(2, -10 * time / duration) + 1) + begin;

export const easeInOutExpo:EasingFunction = (time: number, begin: number, change: number, duration: number): number => {
	if (time === 0) return begin;
	if (time === duration) return begin + change;
	if ((time /= duration / 2) < 1) return change / 2 * Math.pow(2, 10 * (time - 1)) + begin;
	return change / 2 * (-Math.pow(2, -10 * --time) + 2) + begin;
};

export const easeInCirc:EasingFunction = (time: number, begin: number, change: number, duration: number): number => -change * (Math.sqrt(1 - (time /= duration) * time) - 1) + begin;

export const easeOutCirc:EasingFunction = (time: number, begin: number, change: number, duration: number): number => change * Math.sqrt(1 - (time = time / duration - 1) * time) + begin;

export const easeInOutCirc:EasingFunction = (time: number, begin: number, change: number, duration: number): number => {
	if ((time /= duration / 2) < 1) return -change / 2 * (Math.sqrt(1 - time * time) - 1) + begin;
	return change / 2 * (Math.sqrt(1 - (time -= 2) * time) + 1) + begin;
};

export const easeInCubic:EasingFunction = (time: number, begin: number, change: number, duration: number): number => change * (time /= duration) * time * time + begin;

export const easeOutCubic:EasingFunction = (time: number, begin: number, change: number, duration: number): number => change * ((time = time / duration - 1) * time * time + 1) + begin;

export const easeInOutCubic:EasingFunction = (time: number, begin: number, change: number, duration: number): number => {
	if ((time /= duration / 2) < 1) return change / 2 * time * time * time + begin;
	return change / 2 * ((time -= 2) * time * time + 2) + begin;
};

export const easeInQuart:EasingFunction = (time: number, begin: number, change: number, duration: number): number => change * (time /= duration) * time * time * time + begin;

export const easeOutQuart:EasingFunction = (time: number, begin: number, change: number, duration: number): number => -change * ((time = time / duration - 1) * time * time * time - 1) + begin;

export const easeInOutQuart:EasingFunction = (time: number, begin: number, change: number, duration: number): number => {
	if ((time /= duration / 2) < 1) return change / 2 * time * time * time * time + begin;
	return -change / 2 * ((time -= 2) * time * time * time - 2) + begin;
};

export const easeInQuint:EasingFunction = (time: number, begin: number, change: number, duration: number): number => change * (time /= duration) * time * time * time * time + begin;

export const easeOutQuint:EasingFunction = (time: number, begin: number, change: number, duration: number): number => change * ((time = time / duration - 1) * time * time * time * time + 1) + begin;

export const easeInOutQuint:EasingFunction = (time: number, begin: number, change: number, duration: number): number => {
	if ((time /= duration / 2) < 1) return change / 2 * time * time * time * time * time + begin;
	return change / 2 * ((time -= 2) * time * time * time * time + 2) + begin;
};

export const easeInElastic:EasingFunction = (time: number, begin: number, change: number, duration: number): number => {
	let s = 1.70158;
	let p = 0;
	let a = change;
	if (time === 0) return begin;
	if ((time /= duration) === 1) return begin + change;
	if (!p) p = duration * .3;
	if (a < Math.abs(change)){
		a = change;
		s = p / 4;
	}
	else s = p / (2 * Math.PI) * Math.asin(change / a);
	return -(a * Math.pow(2, 10 * (time -= 1)) * Math.sin((time * duration - s) * (2 * Math.PI) / p)) + begin;
};

export const easeOutElastic:EasingFunction = (time: number, begin: number, change: number, duration: number): number => {
	let s = 1.70158;
	let p = 0;
	let a = change;
	if (time === 0) return begin;
	if ((time /= duration) === 1) return begin + change;
	if (!p) p = duration * .3;
	if (a < Math.abs(change)) {
		a = change;
		s = p / 4;
	}
	else s = p / (2 * Math.PI) * Math.asin(change / a);
	return a * Math.pow(2, -10 * time) * Math.sin((time * duration - s) * (2 * Math.PI) / p) + change + begin;
};

export const easeInOutElastic:EasingFunction = (time: number, begin: number, change: number, duration: number): number => {
	let s = 1.70158;
	let p = 0;
	let a = change;
	if (time === 0) return begin;
	if ((time /= duration / 2) === 2) return begin + change;
	if (!p) p = duration * (.3 * 1.5);
	if (a < Math.abs(change)) {
		a = change;
		s = p / 4;
	}
	else s = p / (2 * Math.PI) * Math.asin(change / a);
	if (time < 1) return -.5 * (a * Math.pow(2, 10 * (time -= 1)) * Math.sin((time * duration - s) * (2 * Math.PI) / p)) + begin;
	return a * Math.pow(2, -10 * (time -= 1)) * Math.sin((time * duration - s) * (2 * Math.PI) / p) * .5 + change + begin;
};

export const easeInBack:EasingFunction = (time: number, begin: number, change: number, duration: number): number => {
	let s;
	if (s === undefined) s = 1.70158;
	return change * (time /= duration) * time * ((s + 1) * time - s) + begin;
};