/**
 * A function that defines an easing calculation.
 * 
 * @param {number} time - The current time (or position) of the tween.
 * @param {number} begin - The beginning value of the property being animated.
 * @param {number} change - The change in value of the property being animated.
 * @param {number} duration - The total duration of the tween.
 * @returns {number} - The calculated value at the current time.
 */
export type TEasingFunction = (time: number, begin: number, change: number, duration: number) => number;

/**
 * An object where the keys are strings and the values are easing functions.
 */
export type TEasings = { [key: string]: TEasingFunction };

/**
 * The keys of the TEasings type, representing the names of the easing functions.
 */
export type TEasingsKey = keyof TEasings;
