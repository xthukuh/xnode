import { TEasingFunction } from './easings';
import { IAnimateOptions, IAnimation } from './_types';
/**
 * The default easing function used in animations.
 *
 * @constant {TEasingFunction}
 */
export declare const ANIMATE_DEFAULT_EASING: TEasingFunction;
/**
 * The default duration for animations, in milliseconds.
 *
 * @constant {number}
 */
export declare const ANIMATE_DEFAULT_DURATION: number;
/**
 * Animates an object based on the provided options.
 *
 * @param {IAnimateOptions} options - The options to configure the animation.
 * @param {boolean} [_debug=false] - Enables debug mode if true.
 * @returns {IAnimation} The animation control object.
 * @throws {Error} Throws an error if the update callback is not defined in options.
 */
export declare function _animate(this: any, options: IAnimateOptions, _debug?: boolean): IAnimation;
