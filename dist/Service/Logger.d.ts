import { GlobalsType } from '../Types/System.js';
import PushfarService from '../Base/Service/PushfarService.js';
import Request from '../System/Request.js';
import Response from '../System/Response.js';
import { IncomingHttpHeaders } from 'http';
/**
 * @namespace API/Service
 * @class Logger
 * @extends Service
 * @description Service class providing access to logger service
 * @author Paul Smith (pushfar) <paul.smith@pushfar.com>
 * @copyright 2025 Pushfar (pushfar.com) all rights reserved
 * @license Unlicensed
 */
export default class Logger<T extends GlobalsType & {
    $client: {
        correlation: {
            id: string;
            userId?: string;
            organisationId?: string;
            impersonatorId?: string;
        };
    };
}> extends PushfarService<T> {
    service: string;
    newrelic: any;
    /**
     * @public @async log
     * @description Error log function
     * @param type The type of error
     * @param title The title of the log
     * @param payload The payload to log
     * @return Promise a resulting promise with an error to feed back or data to send on
     */
    log(type: 'info' | 'warning' | 'error', title: string, payload?: {
        error?: Error;
        request?: Request;
        response?: Response;
        dump?: any;
    }): Promise<unknown>;
    /**
     * @public @async logHandler
     * @description Log a request and response to the logger service
     * @param type The type of error
     * @param title The title of the log
     * @param payload The payload to log
     * @return Promise a resulting promise with an error to feed back or data to send on
     */
    logHandler(payload?: {
        request?: {
            path: string;
            method: string;
            headers: IncomingHttpHeaders;
            body: Record<string, string>;
        };
        response?: Response;
        stream?: any;
        error?: Error;
    }): Promise<unknown>;
    /**
     * @public @async logRequest
     * @description Log a request to the logger service
     * @param request The request object
     * @return Promise a resulting promise with an error to feed back or data to send on
     */
    logRequest(request: Request): Promise<unknown>;
    /**
     * @public @async logResponse
     * @description Log a response to the logger service
     * @param response The response object
     * @return Promise a resulting promise with an error to feed back or data to send on
     */
    logResponse(response: Response): Promise<unknown>;
}
//# sourceMappingURL=Logger.d.ts.map