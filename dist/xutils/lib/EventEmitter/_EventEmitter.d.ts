/**
 * Emitted event interface
 */
export interface IEvent<T = any> {
    type: string;
    time: number;
    data: T;
}
/**
 * Private props `Symbol` key name
 */
declare const PROPS: unique symbol;
/**
 * @class EventEmitter
 */
export declare class EventEmitter {
    /**
     * EventEmitter global max listeners
     * - warns if exceeded (helps find memory leaks)
     */
    static get max_listeners(): number;
    static set max_listeners(value: any);
    /**
     * Instance "private" props
     */
    [PROPS]: {
        _events: {
            [type: string]: any;
        };
        _max_listeners: number | undefined;
    };
    /**
     * Max listeners count (default: `undefiend` ~ `EventEmitter.max_listeners`)
     * - Accepts positive integer `number`
     * - Set to zero for unlimited
     */
    get max_listeners(): number | undefined;
    set max_listeners(value: any);
    /**
     * Create new instance
     */
    constructor();
    /**
     * Get valid event type
     *
     * @param type - event type/name
     * @param throwable - enable throwing error when type is invalid
     * @returns `string` lowercase event name ~ `''` on error
     */
    static type(type: any, throwable?: boolean): string;
    /**
     * Get valid event listener callback function.
     *
     * @param listener - event listener
     * @param throwable - enable throwing error when listener is invalid
     * @returns `(event:IEvent)=>void` event handler | `undefined` on error
     */
    static listener(listener: (event: IEvent) => void, throwable?: boolean): ((event: IEvent) => void) | undefined;
    /**
     * Get event listeners
     *
     * @param type - event type/name
     * @returns `((event:IEvent)=>void)[]` event handlers
     */
    listeners(type: string): ((event: IEvent) => void)[];
    /**
     * Check if event listener exists
     *
     * @param type - event type/name
     * @param listener - event listener
     * @returns `((event:IEvent)=>void)[]` event handlers
     */
    hasListener(type: string, listener: (event: IEvent) => void): boolean;
    /**
     * Emit event
     *
     * @param type - event type/name
     * @param data - event data
     * @returns `boolean` caught
     */
    emit(type: string, data?: any): boolean;
    /**
     * Add event listener ~ emits 'newListener' event if added (alias `emitter.addListener`)
     *
     * @param type - event type/name
     * @param listener - event listener callback function
     * @param once - one time callback
     * @returns `EventEmitter` - `this` instance
     */
    on(type: string, listener: (event: IEvent) => void, once?: boolean): EventEmitter;
    /**
     * Add one time event listener ~ emits 'newListener' event if added
     *
     * @param type - event type/name
     * @param listener - event listener callback function
     * @returns `EventEmitter` - `this` instance
     */
    once(type: string, listener: (event: IEvent) => void): EventEmitter;
    /**
     * Add event subscriber
     *
     * @param type - event type/name
     * @param listener - event callback handler
     * @returns `(()=>void)` unsubscribe callback
     */
    subscribe(type: string, listener: (event: IEvent) => void): () => void;
    /**
     * Add event listener ~ emits 'newListener' event if added
     *
     * @param type - event type/name
     * @param listener - event listener callback function
     * @param once - one time callback
     * @returns `EventEmitter` - `this` instance
     */
    addListener(type: string, listener: (event: IEvent) => void, once?: boolean): EventEmitter;
    /**
     * Remove event listener ~ emits 'removeListener' event if removed
     *
     * @param type - event type/name
     * @param listener - event listener callback function
     * @returns `EventEmitter` - `this` instance
     */
    removeListener(type: string, listener: (event: IEvent) => void): EventEmitter;
    /**
     * Remove all listeners ~ emits 'removeListener' event for each removed listener
     *
     * @param type - event type/name
     * @returns `EventEmitter` - `this` instance
     */
    removeAllListeners(type: string): EventEmitter;
}
export {};
