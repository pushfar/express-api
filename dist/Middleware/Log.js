import Middleware from '../Base/Middleware.js';
/**
 * @namespace API/Middleware
 * @class LogRequestResponse
 * @extends Middleware
 * @description Middleware class providing logging of request and response
 * @author Paul Smith (pushfar) <paul.smith@pushfar.com>
 * @copyright 2025 Pushfar (pushfar.com) all rights reserved
 * @license Unlicensed
 */
export default class LogRequestResponse extends Middleware {
    /**
     * @public @method in
     * @description Invoke middleware for incomming event
     * @param request The incoming request
     * @retruns The updated request
     */
    async in(request) {
        if (!this.$services.logger)
            return request;
        return this.$services.logger
            .logRequest(request)
            .catch(() => { })
            .then(() => request);
    }
    /**
     * @public @method out
     * @description Invoke middleware for outgoing event
     * @param response The outgoing response
     * @retruns The updated response
     */
    async out(response) {
        if (!this.$services.logger)
            return response;
        return this.$services.logger
            .logResponse(response)
            .catch(() => { })
            .then(() => response);
    }
}
//# sourceMappingURL=Log.js.map