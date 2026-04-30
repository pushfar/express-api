import { GlobalsType } from '../Types/System';
import Middleware from '../Base/Middleware';
import Request from '../System/Request';
import Response from '../System/Response';
import Logger from '../Service/Logger';

/**
 * @namespace API/Middleware
 * @class LogRequestResponse
 * @extends Middleware
 * @description Middleware class providing logging of request and response
 * @author Paul Smith (pushfar) <paul.smith@pushfar.com>
 * @copyright 2025 Pushfar (pushfar.com) all rights reserved
 * @license Unlicensed
 */
export default class LogRequestResponse<T extends GlobalsType & { $services: { logger: Logger<T & { $client: { correlation: { id: string; userId?: string; organisationId?: string; impersonatorId?: string } } }> } }> extends Middleware<T> {
	/**
	 * @public @method in
	 * @description Invoke middleware for incomming event
	 * @param request The incoming request
	 * @retruns The updated request
	 */
	async in(request: Request): Promise<Request> {
		if (!this.$services.logger) return request;
		
		return this.$services.logger
			.logRequest(request)
			.catch(() => {})
			.then(() => request);
	}

	/**
	 * @public @method out
	 * @description Invoke middleware for outgoing event
	 * @param response The outgoing response
	 * @retruns The updated response
	 */
	async out(response: Response): Promise<Response> {
		if (!this.$services.logger) return response;
		
		return this.$services.logger
			.logResponse(response)
			.catch(() => {})
			.then(() => response);
	}
}
