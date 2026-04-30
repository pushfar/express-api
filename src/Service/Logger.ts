import { GlobalsType } from '../Types/System';
import PushfarService from '../Base/Service/PushfarService';
import Request from '../System/Request';
import Response from '../System/Response';
import { IncomingHttpHeaders } from 'http';
import ZodSchemaTools from '../Library/ZodSchemaTools';
import { z } from 'zod';

/**
 * @namespace API/Service
 * @class Logger
 * @extends Service
 * @description Service class providing access to logger service
 * @author Paul Smith (pushfar) <paul.smith@pushfar.com>
 * @copyright 2025 Pushfar (pushfar.com) all rights reserved
 * @license Unlicensed
 */
export default class Logger<T extends GlobalsType & { $client: { correlation: { id: string; userId?: string; organisationId?: string; impersonatorId?: string } } }> extends PushfarService<T> {
	public service: string = 'logger';
	public newrelic: any;

	/**
	 * @public @async log
	 * @description Error log function
	 * @param type The type of error
	 * @param title The title of the log
	 * @param payload The payload to log
	 * @return Promise a resulting promise with an error to feed back or data to send on
	 */
	async log(
		type: 'info' | 'warning' | 'error',
		title: string,
		payload?: { error?: Error; request?: Request; response?: Response; dump?: any },
	): Promise<unknown> {
		const correlation = this.$client?.correlation || {};

		if (payload?.dump) console.log(`\nLOGGER NOTICE: LOG DUMP DATA DETECTED - Ensure you redact any senstive data before logging dump data !!!`);

		// clean payload to remove circular references
		const requestBody = ZodSchemaTools.redact(payload?.request?.body, this.$client?.controller?.zodSchema?.[payload?.request?.method || 'get']?.body ?? z.object({}));
		const parsedResponseBody = typeof payload?.response?.body === 'string' ? JSON.parse(payload.response.body) : payload?.response?.body;
		const responseBody = ZodSchemaTools.redact(
			parsedResponseBody,
			this.$client?.controller?.zodSchema?.[payload?.response?.method ?? 'get']?.response?.[payload?.response?.status || 200]?.schema ?? z.object({}),
		);

		const data = {
			request: { path: payload?.request?.path, method: payload?.request?.method, headers: payload?.request?.headers, body: requestBody },
			response: { status: payload?.response?.status, headers: payload?.response?.headers, body: responseBody },
			error: payload?.error?.message,
			dump: payload?.dump,
		};

		// console log if set
		if (this.$environment.EAPI_LOGGING === 'all') console.log(`\nLOG [${type}, ${title}]: ${JSON.stringify(data)}\n`);
		if (this.$environment.EAPI_LOGGING === 'info' && ['info', 'warning', 'error'].includes(type)) console.log(`\nLOG [${type}, ${title}]: ${JSON.stringify(data)}\n`);
		if (this.$environment.EAPI_LOGGING === 'warning' && ['warning', 'error'].includes(type)) console.log(`\nLOG [${type}, ${title}]: ${JSON.stringify(data)}\n`);
		if (this.$environment.EAPI_LOGGING === 'error' && ['error'].includes(type)) console.log(`\nLOG [${type}, ${title}]: ${JSON.stringify(data)}\n`);

		const endpoint = `${this.$environment.EAPI_PUSHFAR_SERVICE_LOGGER_URL}/log`;
		const options = { method: 'post', body: JSON.stringify({ type, title, correlation, data }) };

		return this.fetch(endpoint, options).catch(() => {}); // do not let logging errors stop flow
	}

	/**
	 * @public @async logHandler
	 * @description Log a request and response to the logger service
	 * @param type The type of error
	 * @param title The title of the log
	 * @param payload The payload to log
	 * @return Promise a resulting promise with an error to feed back or data to send on
	 */
	async logHandler(payload?: {
		request?: { path: string; method: string; headers: IncomingHttpHeaders; body: Record<string, string> };
		response?: Response;
		stream?: any;
		error?: Error;
	}): Promise<unknown> {
		const correlation = this.$client?.correlation || {};
		const type = payload?.error ? 'error' : 'info';
		const title = payload?.error ? 'Error' : 'Info';

		// clean payload to remove circular references
		const requestBody = ZodSchemaTools.redact(payload?.request?.body, this.$client?.controller?.zodSchema?.[payload?.request?.method || 'get']?.body ?? z.object({}));
		const parsedResponseBody = typeof payload?.response?.body === 'string' ? JSON.parse(payload.response.body) : payload?.response?.body;
		const responseBody = ZodSchemaTools.redact(
			parsedResponseBody,
			this.$client?.controller?.zodSchema?.[payload?.response?.method ?? 'get']?.response?.[payload?.response?.status || 200]?.schema ?? z.object({}),
		);

		const data = {
			request: { path: payload?.request?.path, method: payload?.request?.method, headers: payload?.request?.headers, body: requestBody },
			response: { status: payload?.response?.status, headers: payload?.response?.headers, body: responseBody },
			error: payload?.error?.message,
		};

		// console log if set
		if (this.$environment.EAPI_LOGGING === 'all') console.log(`\nLOG [${type}, ${title}, ${correlation.id}]: ${JSON.stringify(data)}\n`);
		if (this.$environment.EAPI_LOGGING === 'info' && ['info', 'warning', 'error'].includes(type)) {
			console.log(`\nLOG [${type}, ${title}, ${correlation.id}]: ${JSON.stringify(data)}\n`);
		}
		if (this.$environment.EAPI_LOGGING === 'warning' && ['warning', 'error'].includes(type)) console.log(`\nLOG [${type}, ${title}, ${correlation.id}]: ${JSON.stringify(data)}\n`);
		if (this.$environment.EAPI_LOGGING === 'error' && ['error'].includes(type)) console.log(`\nLOG [${type}, ${title}, ${correlation.id}]: ${JSON.stringify(data)}\n`);

		const endpoint = `${this.$environment.EAPI_PUSHFAR_SERVICE_LOGGER_URL}/log`;
		const options = { method: 'post', body: JSON.stringify({ type, title, correlation, data }) };

		return this.fetch(endpoint, options).catch(() => {}); // do not let logging errors stop flow
	}

	/**
	 * @public @async logRequest
	 * @description Log a request to the logger service
	 * @param request The request object
	 * @return Promise a resulting promise with an error to feed back or data to send on
	 */
	async logRequest(request: Request): Promise<unknown> {
		const type = 'info';
		const title = 'Request';
		const correlation = this.$client?.correlation || {};

		const body = ZodSchemaTools.redact(request.body, this.$client?.controller?.zodSchema?.[request.method]?.body ?? z.object({}));
		const data = { path: request.path, method: request.method, headers: request.headers, body };

		// console log if set
		if (this.$environment.EAPI_LOGGING === 'all') console.log(`\nLOG [${type}, ${title}, ${correlation.id}]: ${JSON.stringify(data)}\n`);
		if (this.$environment.EAPI_LOGGING === 'info' && ['info', 'warning', 'error'].includes(type)) {
			console.log(`\nLOG [${type}, ${title}, ${correlation.id}]: ${JSON.stringify(data)}\n`);
		}
		if (this.$environment.EAPI_LOGGING === 'warning' && ['warning', 'error'].includes(type)) console.log(`\nLOG [${type}, ${title}, ${correlation.id}]: ${JSON.stringify(data)}\n`);
		if (this.$environment.EAPI_LOGGING === 'error' && ['error'].includes(type)) console.log(`\nLOG [${type}, ${title}, ${correlation.id}]: ${JSON.stringify(data)}\n`);

		const endpoint = `${this.$environment.EAPI_PUSHFAR_SERVICE_LOGGER_URL}/log`;
		const options = { method: 'post', body: JSON.stringify({ type, title, correlation, data }) };

		return this.fetch(endpoint, options).catch(() => {}); // do not let logging errors stop flow
	}

	/**
	 * @public @async logResponse
	 * @description Log a response to the logger service
	 * @param response The response object
	 * @return Promise a resulting promise with an error to feed back or data to send on
	 */
	async logResponse(response: Response): Promise<unknown> {
		const type = response.status >= 500 ? 'error' : response.status >= 400 ? 'warning' : 'info';
		const title = response.status >= 500 ? 'Response Error' : response.status >= 400 ? 'Response Warning' : 'Response Info';
		const correlation = this.$client?.correlation || {};

		const parsedBody = typeof response.body === 'string' ? JSON.parse(response.body) : response.body;
		const body = ZodSchemaTools.redact(parsedBody, this.$client?.controller?.zodSchema?.[response.method]?.response?.[response.status]?.schema ?? z.object({}));
		const data = { status: response.status, headers: response.headers, body };

		// console log if set
		if (this.$environment.EAPI_LOGGING === 'all') console.log(`\nLOG [${type}, ${title}, ${correlation.id}]: ${JSON.stringify(data)}\n`);
		if (this.$environment.EAPI_LOGGING === 'info' && ['info', 'warning', 'error'].includes(type)) {
			console.log(`\nLOG [${type}, ${title}, ${correlation.id}]: ${JSON.stringify(data)}\n`);
		}
		if (this.$environment.EAPI_LOGGING === 'warning' && ['warning', 'error'].includes(type)) console.log(`\nLOG [${type}, ${title}, ${correlation.id}]: ${JSON.stringify(data)}\n`);
		if (this.$environment.EAPI_LOGGING === 'error' && ['error'].includes(type)) console.log(`\nLOG [${type}, ${title}, ${correlation.id}]: ${JSON.stringify(data)}\n`);

		const endpoint = `${this.$environment.EAPI_PUSHFAR_SERVICE_LOGGER_URL}/log`;
		const options = { method: 'post', body: JSON.stringify({ type, title, correlation, data }) };

		return this.fetch(endpoint, options).catch(() => {}); // do not let logging errors stop flow
	}
}
