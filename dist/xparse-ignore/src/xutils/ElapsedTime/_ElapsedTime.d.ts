export declare class ElapsedTime {
    start_time: Date | undefined;
    stop_time: Date | undefined;
    _ms: number | undefined;
    /**
     * New instance
     */
    constructor();
    /**
     * Start time tracking (sets start_time to now and resets other properties)
     */
    start(): ElapsedTime;
    /**
     * Track current time (sets this._ms to time difference between last start and now)
     *
     * @param updateStart  Set start to now
     */
    now(updateStart?: boolean): ElapsedTime;
    /**
     * Stop time tracking (sets this._ms to time difference between last start and last stop)
     * If last stop is less than start time, stop time is updated to now.
     */
    stop(): ElapsedTime;
    /**
     * Whether time tracking was started
     */
    started(): boolean;
    /**
     * Whether time tracking was stopped
     */
    stopped(): boolean;
    /**
     * Get tracked elapsed time in milliseconds
     *
     * @returns milliseconds
     */
    ms(): number;
    /**
     * Get tracked elapsed time in seconds
     *
     * @param decimalPlaces
     * @returns seconds
     */
    sec(decimalPlaces?: number): number;
    /**
     * Get tracked elapsed time in minutes
     *
     * @param decimalPlaces
     * @returns minutes
     */
    min(decimalPlaces?: number): number;
    /**
     * Get tracking data (this will stop tracking)
     */
    data(): {
        start_time: Date | undefined;
        stop_time: Date | undefined;
        elapsed_ms: number;
    };
}
