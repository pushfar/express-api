import Middleware from '../Base/Middleware.js';
import { v4 as uuidv4 } from 'uuid';
/**
 * @namespace API/Middleware
 * @class Correlation
 * @extends Middleware
 * @description Middleware class providing correlation actions in all incomming requests to services
 * @author Paul Smith (pushfar) <paul.smith@pushfar.com>
 * @copyright 2025 Pushfar (pushfar.com) all rights reserved
 * @license Unlicensed
 */
export default class Correlation extends Middleware {
    constructor(globals, type) {
        super(globals);
        this.type = type;
    }
    /**
     * @public @method mount
     * @description Invoke middleware for incomming event at mount time
     * @param request The incoming request
     * @retruns The updated request
     */
    async mount(request) {
        // only generate correlation if we are an api
        if (this.type !== 'api')
            return request;
        this.$client.correlation = { id: uuidv4().toString(), userId: '', organisationId: '', impersonatorId: '' };
        return request;
    }
    /**
     * @public @method in
     * @description Invoke middleware for incomming event at in time
     * @param request The incoming request
     * @retruns The updated request
     */
    async in(request) {
        // only set correlation if we are a service
        if (this.type !== 'service')
            return request;
        this.$client.correlation = {
            id: (request.headers?.['X-Correlation-Id'] || request.headers?.['x-correlation-id']),
            userId: (request.headers?.['X-User-Id'] || request.headers?.['x-user-id']),
            organisationId: (request.headers?.['X-Organisation-Id'] || request.headers?.['x-organisation-id']),
            impersonatorId: (request.headers?.['X-Impersonator-Id'] || request.headers?.['x-impersonator-id']),
        };
        return request;
    }
    /**
     * @public @method out
     * @description Invoke middleware for incomming event at in time
     * @param request The incoming request
     * @retruns The updated request
     */
    async out(response) {
        // only set correlation if we are a service
        if (this.type !== 'service')
            return response;
        response.headers['X-Correlation-Id'] = this.$client.correlation?.id || '';
        response.headers['X-User-Id'] = this.$client.correlation?.userId || '';
        response.headers['X-Organisation-Id'] = this.$client.correlation?.organisationId || '';
        response.headers['X-Impersonator-Id'] = this.$client.correlation?.impersonatorId || '';
        return response;
    }
}
//# sourceMappingURL=Correlation.js.map