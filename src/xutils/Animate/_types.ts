import { TEasingsKey, TEasingFunction } from './easings';

/**
 * Options for configuring an animation.
 */
export interface IAnimateOptions {

	/**
	 * Function called to update the animation.
	 *
	 * @param {Object} value - The current state of the animation.
	 * @param {number} value.index - The current frame index of the animation.
	 * @param {number} value.delta - The change in position from the last frame.
	 * @param {number} value.pos - The current position of the animation.
	 * @param {number} value.time - The current time of the animation.
	 * @returns {void|false} - Return false to stop the animation.
	 */
	update: (value: { index: number; delta: number; pos: number; time: number; }) => void | false;

	/**
	 * Function called before the animation starts.
	 *
	 * @param {Object} value - The initial state before the animation starts.
	 * @param {number} value.timestamp - The timestamp when the animation is about to start.
	 * @param {any} value.options - The options provided to the animation.
	 * @param {number} value.then - The initial time offset.
	 * @returns {void|false} - Return false to prevent the animation from starting.
	 */
	before?: (value: { timestamp: number; options: any; then: number; }) => void | false;

	/**
	 * Function called after the animation ends.
	 *
	 * @param {Object} value - The final state after the animation ends.
	 * @param {boolean} value.aborted - Indicates if the animation was aborted.
	 * @param {undefined|'abort'|'update'|'begin'|'timeout'} value.abort_method - The method used to abort the animation, if applicable.
	 * @param {boolean} value.complete - Indicates if the animation completed successfully.
	 * @param {number} value.pause_duration - The total duration of any pauses during the animation.
	 * @param {number} value.total_duration - The total duration of the animation.
	 * @returns {void}
	 */
	after?: (value: { aborted: boolean; abort_method: undefined | 'abort' | 'update' | 'begin' | 'timeout'; complete: boolean; pause_duration: number; total_duration: number; }) => void;

	/**
	 * The easing function or key to use for the animation.
	 */
	easing: TEasingsKey | TEasingFunction;

	/**
	 * The duration of the animation in milliseconds.
	 */
	duration: number;

	/**
	 * The delay before the animation starts in milliseconds.
	 */
	delay?: number;

	/**
	 * Indicates if the animation is delayed.
	 */
	delayed?: boolean;

	/**
	 * The initial position of the animation.
	 */
	from?: number;

	/**
	 * The final position of the animation.
	 */
	to?: number;

	/**
	 * The timeout for the animation in milliseconds.
	 */
	timeout?: number;

	/**
	 * Indicates if the animation plays automatically.
	 */
	autoplay?: boolean;
}


/**
 * Interface representing an animation with various control methods and state properties.
 */
export interface IAnimation {

	/**
	 * Indicates whether debug mode is enabled.
	 */
	_debug: boolean;

	/**
	 * Indicates whether the animation has begun.
	 */
	begun: boolean;

	/**
	 * Indicates whether the animation is currently paused.
	 */
	paused: boolean;

	/**
	 * Indicates whether the animation is completed.
	 */
	done: boolean;

	/**
	 * Starts or restarts the animation.
	 *
	 * @param {boolean} [restart=false] - If true, restarts the animation from the beginning.
	 * @returns {boolean} - Returns true if the animation starts successfully.
	 */
	play: (restart?: boolean) => boolean;

	/**
	 * Pauses the animation.
	 *
	 * @param {boolean} [toggle=true] - If true, toggles the pause state.
	 * @returns {boolean} - Returns true if the animation is paused successfully.
	 */
	pause: (toggle?: boolean) => boolean;

	/**
	 * Resumes the animation from a paused state.
	 *
	 * @returns {boolean} - Returns true if the animation resumes successfully.
	 */
	resume: () => boolean;

	/**
	 * Restarts the animation from the beginning.
	 *
	 * @returns {boolean} - Returns true if the animation restarts successfully.
	 */
	restart: () => boolean;

	/**
	 * Reset the animation.
	 *
	 * @returns {boolean} - Returns true if the animation is reset successfully.
	 */
	reset: () => boolean;

	/**
	 * Aborts the animation.
	 *
	 * @returns {boolean} - Returns true if the animation is aborted successfully.
	 */
	abort: () => boolean;
}
