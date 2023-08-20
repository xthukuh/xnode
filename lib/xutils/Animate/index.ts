//easings - EasingFunction, EasingsKey, IEasings
export * from './easings';

//_polyfill
export { requestAnimationFrame, cancelAnimationFrame } from './_polyfill';

//_animate
export type {
	IAnimateOptions,
	IAnimation,
} from './_animate';

export {
	DEFAULT_EASING,
	DEFAULT_DURATION,
	_animate,
} from './_animate';