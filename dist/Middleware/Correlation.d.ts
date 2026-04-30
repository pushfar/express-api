import { GlobalsType } from '../Types/System.js';
import Middleware from '../Base/Middleware.js';
import Request from '../System/Request.js';
import Response from '../System/Response.js';
/**
 * @namespace API/Middleware
 * @class Correlation
 * @extends Middleware
 * @description Middleware class providing correlation actions in all incomming requests to services
 * @author Paul Smith (pushfar) <paul.smith@pushfar.com>
 * @copyright 2025 Pushfar (pushfar.com) all rights reserved
 * @license Unlicensed
 */
export default class Correlation<T extends GlobalsType & {
    $client: {
        correlation: {
            id: string;
            userId?: string;
            organisationId?: string;
            impersonatorId?: string;
        };
    };
}> extends Middleware<T> {
    private type;
    constructor(globals: T, type: 'api' | 'service');
    /**
     * @public @method mount
     * @description Invoke middleware for incomming event at mount time
     * @param request The incoming request
     * @retruns The updated request
     */
    mount(request: Request): Promise<Request>;
    /**
     * @public @method in
     * @description Invoke middleware for incomming event at in time
     * @param request The incoming request
     * @retruns The updated request
     */
    in(request: Request): Promise<Request>;
    /**
     * @public @method out
     * @description Invoke middleware for incomming event at in time
     * @param request The incoming request
     * @retruns The updated request
     */
    out(response: Response): Promise<Response>;
}
//# sourceMappingURL=Correlation.d.ts.map