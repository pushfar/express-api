import Service from '../Service.js';
import { ReadableStream } from 'stream/web';
import { GlobalsType } from '../../Types/System.js';
/**
 * @namespace API/Service
 * @class PushfarService
 * @extends Service
 * @description Service class providing access to project service
 * @author Paul Smith (pushfar) <paul.smith@pushfar.com>
 * @copyright 2025 Pushfar (pushfar.com) all rights reserved
 * @license Unlicensed
 */
export default class PushfarService<T extends GlobalsType> extends Service<T> {
    service: string;
    /**
     * @public @async fetch
     * @description Make a fetch request
     * @param endpoint The endpoint to send the request to
     * @param options The optoins to go with the request
     * @return Promise a resulting promise with an error to feed back or data to send on
     */
    fetch<T>(endpoint: string, options: {
        method: string;
        body: string;
        headers?: Record<string, string> | Headers;
    }): Promise<T>;
    /**
     * @public fetchEventStream
     * @description Make a fetch request and return a readable stream with parsed JSON chunks
     * @param endpoint The endpoint to send the request to
     * @param options The optoins to go with the request
     * @return ReadableStream a readable stream of parsed JSON objects
     */
    fetchEventStream<T>(endpoint: string, options: {
        method: string;
        body: string;
        headers?: Record<string, string> | Headers;
    }): ReadableStream<T>;
}
//# sourceMappingURL=PushfarService.d.ts.map