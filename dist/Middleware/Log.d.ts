import { GlobalsType } from '../Types/System.js';
import Middleware from '../Base/Middleware.js';
import Request from '../System/Request.js';
import Response from '../System/Response.js';
import Logger from '../Service/Logger.js';
/**
 * @namespace API/Middleware
 * @class LogRequestResponse
 * @extends Middleware
 * @description Middleware class providing logging of request and response
 * @author Paul Smith (pushfar) <paul.smith@pushfar.com>
 * @copyright 2025 Pushfar (pushfar.com) all rights reserved
 * @license Unlicensed
 */
export default class LogRequestResponse<T extends GlobalsType & {
    $services: {
        logger: Logger<T & {
            $client: {
                correlation: {
                    id: string;
                    userId?: string;
                    organisationId?: string;
                    impersonatorId?: string;
                };
            };
        }>;
    };
}> extends Middleware<T> {
    /**
     * @public @method in
     * @description Invoke middleware for incomming event
     * @param request The incoming request
     * @retruns The updated request
     */
    in(request: Request): Promise<Request>;
    /**
     * @public @method out
     * @description Invoke middleware for outgoing event
     * @param response The outgoing response
     * @retruns The updated response
     */
    out(response: Response): Promise<Response>;
}
//# sourceMappingURL=Log.d.ts.map