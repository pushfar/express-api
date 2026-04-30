import Service from '../Service.js';
import RestError from '../../Error/Rest.js';
import { ReadableStream } from 'stream/web';
import { Readable } from 'stream';
/**
 * @namespace API/Service
 * @class PushfarService
 * @extends Service
 * @description Service class providing access to project service
 * @author Paul Smith (pushfar) <paul.smith@pushfar.com>
 * @copyright 2025 Pushfar (pushfar.com) all rights reserved
 * @license Unlicensed
 */
export default class PushfarService extends Service {
    constructor() {
        super(...arguments);
        this.service = '';
    }
    /**
     * @public @async fetch
     * @description Make a fetch request
     * @param endpoint The endpoint to send the request to
     * @param options The optoins to go with the request
     * @return Promise a resulting promise with an error to feed back or data to send on
     */
    async fetch(endpoint, options) {
        options.headers = {
            'Content-Type': 'application/json',
            ...options.headers,
            'X-Correlation-Id': this.$client.correlation?.id?.toString() || '00000000-0000-0000-0000-000000000000',
            'X-User-Id': this.$client.correlation?.userId?.toString() || '00000000-0000-0000-0000-000000000000',
            'X-Organisation-Id': this.$client.correlation?.organisationId?.toString() || '00000000-0000-0000-0000-000000000000',
            'X-Impersonator-Id': this.$client.correlation?.impersonatorId?.toString() || '00000000-0000-0000-0000-000000000000',
        };
        // perform request
        return fetch(endpoint, options)
            .catch(() => {
            throw new RestError('Could not contact backend system services, please try again later', 500);
        })
            .then((res) => res.json().then((data) => ({ status: res.status, data })))
            .then((out) => {
            if (out.status >= 400)
                throw new RestError(out.data, out.status);
            return out.data;
        });
    }
    /**
     * @public fetchEventStream
     * @description Make a fetch request and return a readable stream with parsed JSON chunks
     * @param endpoint The endpoint to send the request to
     * @param options The optoins to go with the request
     * @return ReadableStream a readable stream of parsed JSON objects
     */
    fetchEventStream(endpoint, options) {
        options.headers = {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
            ...options.headers,
            'X-Correlation-Id': this.$client.correlation?.id?.toString() || '00000000-0000-0000-0000-000000000000',
            'X-User-Id': this.$client.correlation?.userId?.toString() || '00000000-0000-0000-0000-000000000000',
            'X-Organisation-Id': this.$client.correlation?.organisationId?.toString() || '00000000-0000-0000-0000-000000000000',
            'X-Impersonator-Id': this.$client.correlation?.impersonatorId?.toString() || '00000000-0000-0000-0000-000000000000',
        };
        // Start the fetch request
        const fetchPromise = fetch(endpoint, options).catch(() => {
            throw new RestError('Could not contact backend system services, please try again later', 500);
        });
        // Create a new ReadableStream that reads from the response
        return new ReadableStream({
            async start(controller) {
                try {
                    const res = await fetchPromise;
                    // Check for errors
                    if (res.status >= 400) {
                        let errorMessage;
                        try {
                            const errorData = await res.json();
                            errorMessage = typeof errorData === 'string' ? errorData : JSON.stringify(errorData);
                        }
                        catch {
                            try {
                                errorMessage = await res.text();
                            }
                            catch {
                                errorMessage = `Error ${res.status}: ${res.statusText}`;
                            }
                        }
                        return controller.error(new RestError(errorMessage, res.status));
                    }
                    if (!res.body)
                        return controller.error(new RestError('Response body is empty', 500));
                    // Get the reader from the response body
                    let bodyStream;
                    if (res.body instanceof Readable || ('pipe' in res.body && typeof res.body.getReader !== 'function')) {
                        bodyStream = Readable.toWeb(res.body);
                    }
                    else if (typeof res.body?.getReader === 'function') {
                        bodyStream = res.body;
                    }
                    else {
                        bodyStream = Readable.toWeb(res.body);
                    }
                    const decoder = new TextDecoder();
                    let buffer = '';
                    // Read chunks and parse SSE format (text/event-stream) using for await
                    for await (const value of bodyStream) {
                        // Decode the chunk and add to buffer
                        const decoded = decoder.decode(value, { stream: true });
                        buffer += decoded;
                        // Process complete lines
                        const lines = buffer.split('\n');
                        buffer = lines.pop() || ''; // Keep the last incomplete line in buffer
                        for (const line of lines) {
                            const trimmed = line.trim();
                            if (trimmed.startsWith('data: ')) {
                                try {
                                    const jsonStr = trimmed.slice(6); // Remove "data: " prefix
                                    const parsed = JSON.parse(jsonStr);
                                    controller.enqueue(parsed);
                                }
                                catch (error) {
                                    // Skip invalid JSON
                                    console.log('request stream JSON parse error', error instanceof Error ? error.message : String(error));
                                }
                            }
                        }
                    }
                    controller.close();
                }
                catch (error) {
                    controller.error(error);
                }
            },
        });
    }
}
//# sourceMappingURL=PushfarService.js.map