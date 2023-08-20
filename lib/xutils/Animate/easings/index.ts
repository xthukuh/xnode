import type { EasingFunction as _EasingFunction } from './_easings';
import {
	easeLinear,
	easeInQuad,
	easeOutQuad,
	easeInOutQuad,
	easeInSine,
	easeOutSine,
	easeInOutSine,
	easeInExpo,
	easeOutExpo,
	easeInOutExpo,
	easeInCirc,
	easeOutCirc,
	easeInOutCirc,
	easeInCubic,
	easeOutCubic,
	easeInOutCubic,
	easeInQuart,
	easeOutQuart,
	easeInOutQuart,
	easeInQuint,
	easeOutQuint,
	easeInOutQuint,
	easeInElastic,
	easeOutElastic,
	easeInOutElastic,
	easeInBack,
} from './_easings';
export type EasingFunction = _EasingFunction;
export interface IEasings {
	easeLinear: EasingFunction;
	easeInQuad: EasingFunction;
	easeOutQuad: EasingFunction;
	easeInOutQuad: EasingFunction;
	easeInSine: EasingFunction;
	easeOutSine: EasingFunction;
	easeInOutSine: EasingFunction;
	easeInExpo: EasingFunction;
	easeOutExpo: EasingFunction;
	easeInOutExpo: EasingFunction;
	easeInCirc: EasingFunction;
	easeOutCirc: EasingFunction;
	easeInOutCirc: EasingFunction;
	easeInCubic: EasingFunction;
	easeOutCubic: EasingFunction;
	easeInOutCubic: EasingFunction;
	easeInQuart: EasingFunction;
	easeOutQuart: EasingFunction;
	easeInOutQuart: EasingFunction;
	easeInQuint: EasingFunction;
	easeOutQuint: EasingFunction;
	easeInOutQuint: EasingFunction;
	easeInElastic: EasingFunction;
	easeOutElastic: EasingFunction;
	easeInOutElastic: EasingFunction;
	easeInBack: EasingFunction;
};
export type EasingsKey = keyof IEasings;
export const Easings: IEasings = {
	easeLinear,
	easeInQuad,
	easeOutQuad,
	easeInOutQuad,
	easeInSine,
	easeOutSine,
	easeInOutSine,
	easeInExpo,
	easeOutExpo,
	easeInOutExpo,
	easeInCirc,
	easeOutCirc,
	easeInOutCirc,
	easeInCubic,
	easeOutCubic,
	easeInOutCubic,
	easeInQuart,
	easeOutQuart,
	easeInOutQuart,
	easeInQuint,
	easeOutQuint,
	easeInOutQuint,
	easeInElastic,
	easeOutElastic,
	easeInOutElastic,
	easeInBack,
};