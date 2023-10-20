import { EasingFunction, EasingsKey } from './easings';
/**
 * Default animation easing
 */
export declare const DEFAULT_EASING: EasingFunction;
/**
 * Default animation duration
 */
export declare const DEFAULT_DURATION: number;
/**
 * Animate options interface
 */
export interface IAnimateOptions {
    update: (value: {
        index: number;
        delta: number;
        pos: number;
        time: number;
    }) => void | false;
    before?: (value: {
        timestamp: number;
        options: any;
        then: number;
    }) => void | false;
    after?: (value: {
        aborted: boolean;
        abort_method: undefined | 'abort' | 'update' | 'begin' | 'timeout';
        complete: boolean;
        pause_duration: number;
        total_duration: number;
    }) => void;
    easing: EasingsKey | EasingFunction;
    duration: number;
    delay?: number;
    delayed?: boolean;
    from?: number;
    to?: number;
    timeout?: number;
    manual?: boolean;
}
/**
 * Animation control interface
 */
export interface IAnimation {
    _debug: boolean;
    begun: boolean;
    paused: boolean;
    done: boolean;
    play: (restart: boolean) => boolean;
    pause: (toggle: boolean) => boolean;
    resume: () => boolean;
    restart: () => boolean;
    cancel: () => boolean;
    abort: () => boolean;
}
/**
 * Create timed animation
 *
 * @param options
 * @param _debug
 */
export declare function _animate(this: any, options: IAnimateOptions, _debug?: boolean): IAnimation;
