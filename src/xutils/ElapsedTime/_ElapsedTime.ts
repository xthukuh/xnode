import { _isDate } from '../utils/_datetime';
import { _round } from '../utils/_number';

export class ElapsedTime
{
	//props
	start_time: Date|undefined;
	stop_time: Date|undefined;
	_ms: number|undefined;
	
	/**
	 * New instance
	 */
	constructor(){
		this.start_time = new Date();
		this.stop_time = undefined;
		this._ms = undefined;
	}

	/**
	 * Start time tracking (sets start_time to now and resets other properties)
	 */
	start(): ElapsedTime {
		const _now = new Date();
		this.start_time = _isDate(this.start_time) ? this.start_time : _now;
		this.stop_time = undefined;
		this._ms = undefined;
		return this;
	}

	/**
	 * Track current time (sets this._ms to time difference between last start and now)
	 * 
	 * @param updateStart  Set start to now
	 */
	now(updateStart: boolean = false): ElapsedTime {
		const _now = new Date();
		const _start: any = _isDate(this.start_time) ? this.start_time : this.start_time = _now;
		this._ms = _now.getTime() - _start.getTime();
		if (updateStart) this.start_time = _now;
		return this;
	}

	/**
	 * Stop time tracking (sets this._ms to time difference between last start and last stop)
	 * If last stop is less than start time, stop time is updated to now.
	 */
	stop(): ElapsedTime {
		const _now = new Date();
		const _start: any = _isDate(this.start_time) ? this.start_time : _now, t = _start.getTime();
		const _stop_time: any = this.stop_time;
		const _stop = _isDate(_stop_time) && _stop_time.getTime() >= t ? _stop_time : this.stop_time = _now;
		this._ms = _stop.getTime() - t;
		return this;
	}

	/**
	 * Whether time tracking was started
	 */
	started(): boolean {
		return _isDate(this.start_time);
	}

	/**
	 * Whether time tracking was stopped
	 */
	stopped(): boolean {
		return _isDate(this.stop_time);
	}

	/**
	 * Get tracked elapsed time in milliseconds
	 * 
	 * @returns milliseconds
	 */
	ms(): number {
		return parseInt(this._ms as any);
	}

	/**
	 * Get tracked elapsed time in seconds
	 * 
	 * @param decimalPlaces
	 * @returns seconds
	 */
	sec(decimalPlaces: number = 3): number {
		return _round(this.ms()/1000, decimalPlaces);
	}

	/**
	 * Get tracked elapsed time in minutes
	 * 
	 * @param decimalPlaces
	 * @returns minutes
	 */
	min(decimalPlaces: number = 3): number {
		return _round(this.ms()/60000, decimalPlaces);
	}

	/**
	 * Get tracking data (this will stop tracking)
	 */
	data(): {start_time: Date|undefined; stop_time: Date|undefined; elapsed_ms: number;}{
		this.stop();
		const start_time = _isDate(this.start_time) ? this.start_time : undefined;
		const stop_time = _isDate(this.stop_time) ? this.stop_time : undefined;
		const elapsed_ms = this.ms();
		return {start_time, stop_time, elapsed_ms};
	}
}