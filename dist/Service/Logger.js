import PushfarService from '../Base/Service/PushfarService.js';
import ZodSchemaTools from '../Library/ZodSchemaTools.js';
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
export default class Logger extends PushfarService {
    /**
     * @public @constructor
     * @description Constructor for the Logger service
     * @param globals The globals object
     * @param pushToService Whether to push to the service
     */
    constructor(globals, pushToService = true) {
        super(globals);
        this.service = 'logger';
        this.pushToService = true;
        this.pushToService = pushToService;
    }
    /**
     * @public @async log
     * @description Error log function
     * @param type The type of error
     * @param title The title of the log
     * @param payload The payload to log
     * @return Promise void
     */
    async log(type, title, payload) {
        const correlation = this.$client?.correlation || {};
        if (payload?.dump)
            console.log(`\nLOGGER NOTICE: LOG DUMP DATA DETECTED - Ensure you redact any senstive data before logging dump data !!!`);
        // clean payload to remove circular references
        const requestBody = ZodSchemaTools.redact(payload?.request?.body, this.$client?.controller?.zodSchema?.[payload?.request?.method || 'get']?.body ?? z.object({}));
        let parsedResponseBody = payload?.response?.body;
        try {
            parsedResponseBody = typeof payload?.response?.body === 'string' ? JSON.parse(payload.response.body) : payload?.response?.body;
        }
        catch (_) { }
        const responseBody = ZodSchemaTools.redact(parsedResponseBody, this.$client?.controller?.zodSchema?.[payload?.response?.method ?? 'get']?.response?.[payload?.response?.status || 200]?.schema ?? z.object({}));
        const data = {
            request: { path: payload?.request?.path, method: payload?.request?.method, headers: payload?.request?.headers, body: requestBody },
            response: { path: payload?.response?.path, method: payload?.response?.method, status: payload?.response?.status, headers: payload?.response?.headers, body: responseBody },
            error: payload?.error?.message,
            dump: payload?.dump,
        };
        // console log if set
        if (!this.$environment.EAPI_LOGGING)
            console.log(`\nLOGGER NOTICE: EAPI_LOGGING environment variable is not set - Ensure you set the EAPI_LOGGING in your .env file!!!`);
        if (this.$environment.EAPI_LOGGING === 'all')
            console.log(`\nLOG [${type}, ${title}]: ${JSON.stringify(data)}\n`);
        if (this.$environment.EAPI_LOGGING === 'info' && ['info', 'warning', 'error'].includes(type))
            console.log(`\nLOG [${type}, ${title}]: ${JSON.stringify(data)}\n`);
        if (this.$environment.EAPI_LOGGING === 'warning' && ['warning', 'error'].includes(type))
            console.log(`\nLOG [${type}, ${title}]: ${JSON.stringify(data)}\n`);
        if (this.$environment.EAPI_LOGGING === 'error' && ['error'].includes(type))
            console.log(`\nLOG [${type}, ${title}]: ${JSON.stringify(data)}\n`);
        if (!this.pushToService)
            return;
        if (!this.$environment.EAPI_PUSHFAR_SERVICE_LOGGER_URL)
            return console.log(`\nLOGGER NOTICE: EAPI_PUSHFAR_SERVICE_LOGGER_URL environment variable is not set - Ensure you set the EAPI_PUSHFAR_SERVICE_LOGGER_URL in your .env file!!!`);
        const endpoint = `${this.$environment.EAPI_PUSHFAR_SERVICE_LOGGER_URL}/log`;
        const options = { method: 'post', body: JSON.stringify({ type, title, correlation, data }) };
        return this.fetch(endpoint, options).then(() => { }).catch(() => { }); // do not let logging errors stop flow
    }
    /**
     * @public @async logHandler
     * @description Log a request and response to the logger service
     * @param type The type of error
     * @param title The title of the log
     * @param payload The payload to log
     * @return Promise void
     */
    async logHandler(payload) {
        const correlation = this.$client?.correlation || {};
        const type = payload?.error ? 'error' : 'info';
        const title = payload?.error ? 'Error' : 'Info';
        // clean payload to remove circular references
        const requestBody = ZodSchemaTools.redact(payload?.request?.body, this.$client?.controller?.zodSchema?.[payload?.request?.method || 'get']?.body ?? z.object({}));
        let parsedResponseBody = payload?.response?.body;
        try {
            parsedResponseBody = typeof payload?.response?.body === 'string' ? JSON.parse(payload.response.body) : payload?.response?.body;
        }
        catch (_) { }
        const responseBody = ZodSchemaTools.redact(parsedResponseBody, this.$client?.controller?.zodSchema?.[payload?.response?.method ?? 'get']?.response?.[payload?.response?.status || 200]?.schema ?? z.object({}));
        const data = {
            request: { path: payload?.request?.path, method: payload?.request?.method, headers: payload?.request?.headers, body: requestBody },
            response: { path: payload?.response?.path, method: payload?.response?.method, status: payload?.response?.status, headers: payload?.response?.headers, body: responseBody },
            error: payload?.error?.message,
        };
        // console log if set
        if (!this.$environment.EAPI_LOGGING)
            console.log(`\nLOGGER NOTICE: EAPI_LOGGING environment variable is not set - Ensure you set the EAPI_LOGGING in your .env file!!!`);
        if (this.$environment.EAPI_LOGGING === 'all')
            console.log(`\nLOG [${type}, ${title}, ${correlation.id}]: ${JSON.stringify(data)}\n`);
        if (this.$environment.EAPI_LOGGING === 'info' && ['info', 'warning', 'error'].includes(type)) {
            console.log(`\nLOG [${type}, ${title}, ${correlation.id}]: ${JSON.stringify(data)}\n`);
        }
        if (this.$environment.EAPI_LOGGING === 'warning' && ['warning', 'error'].includes(type))
            console.log(`\nLOG [${type}, ${title}, ${correlation.id}]: ${JSON.stringify(data)}\n`);
        if (this.$environment.EAPI_LOGGING === 'error' && ['error'].includes(type))
            console.log(`\nLOG [${type}, ${title}, ${correlation.id}]: ${JSON.stringify(data)}\n`);
        if (!this.pushToService)
            return;
        if (!this.$environment.EAPI_PUSHFAR_SERVICE_LOGGER_URL)
            return console.log(`\nLOGGER NOTICE: EAPI_PUSHFAR_SERVICE_LOGGER_URL environment variable is not set - Ensure you set the EAPI_PUSHFAR_SERVICE_LOGGER_URL in your .env file!!!`);
        const endpoint = `${this.$environment.EAPI_PUSHFAR_SERVICE_LOGGER_URL}/log`;
        const options = { method: 'post', body: JSON.stringify({ type, title, correlation, data }) };
        return this.fetch(endpoint, options).then(() => { }).catch(() => { }); // do not let logging errors stop flow
    }
    /**
     * @public @async logRequest
     * @description Log a request to the logger service
     * @param request The request object
     * @return Promise void
     */
    async logRequest(request) {
        const type = 'info';
        const title = 'Request';
        const correlation = this.$client?.correlation || {};
        const body = ZodSchemaTools.redact(request.body, this.$client?.controller?.zodSchema?.[request.method]?.body ?? z.object({}));
        const data = { request: { path: request.path, method: request.method, headers: request.headers, body } };
        // console log if set
        if (!this.$environment.EAPI_LOGGING)
            console.log(`\nLOGGER NOTICE: EAPI_LOGGING environment variable is not set - Ensure you set the EAPI_LOGGING in your .env file!!!`);
        if (this.$environment.EAPI_LOGGING === 'all')
            console.log(`\nLOG [${type}, ${title}, ${correlation.id}]: ${JSON.stringify(data)}\n`);
        if (this.$environment.EAPI_LOGGING === 'info' && ['info', 'warning', 'error'].includes(type)) {
            console.log(`\nLOG [${type}, ${title}, ${correlation.id}]: ${JSON.stringify(data)}\n`);
        }
        if (this.$environment.EAPI_LOGGING === 'warning' && ['warning', 'error'].includes(type))
            console.log(`\nLOG [${type}, ${title}, ${correlation.id}]: ${JSON.stringify(data)}\n`);
        if (this.$environment.EAPI_LOGGING === 'error' && ['error'].includes(type))
            console.log(`\nLOG [${type}, ${title}, ${correlation.id}]: ${JSON.stringify(data)}\n`);
        if (!this.pushToService)
            return;
        if (!this.$environment.EAPI_PUSHFAR_SERVICE_LOGGER_URL)
            return console.log(`\nLOGGER NOTICE: EAPI_PUSHFAR_SERVICE_LOGGER_URL environment variable is not set - Ensure you set the EAPI_PUSHFAR_SERVICE_LOGGER_URL in your .env file!!!`);
        const endpoint = `${this.$environment.EAPI_PUSHFAR_SERVICE_LOGGER_URL}/log`;
        const options = { method: 'post', body: JSON.stringify({ type, title, correlation, data }) };
        return this.fetch(endpoint, options).then(() => { }).catch(() => { }); // do not let logging errors stop flow
    }
    /**
     * @public @async logResponse
     * @description Log a response to the logger service
     * @param response The response object
     * @return Promise void
     */
    async logResponse(response) {
        const type = response.status >= 500 ? 'error' : response.status >= 400 ? 'warning' : 'info';
        const title = response.status >= 500 ? 'Response Error' : response.status >= 400 ? 'Response Warning' : 'Response Info';
        const correlation = this.$client?.correlation || {};
        let parsedBody = response.body;
        try {
            parsedBody = typeof response.body === 'string' ? JSON.parse(response.body) : response.body;
        }
        catch (_) { }
        const body = ZodSchemaTools.redact(parsedBody, this.$client?.controller?.zodSchema?.[response.method]?.response?.[response.status]?.schema ?? z.object({}));
        const data = { response: { path: response.path, method: response.method, status: response.status, headers: response.headers, body } };
        // console log if set
        if (!this.$environment.EAPI_LOGGING)
            console.log(`\nLOGGER NOTICE: EAPI_LOGGING environment variable is not set - Ensure you set the EAPI_LOGGING in your .env file!!!`);
        if (this.$environment.EAPI_LOGGING === 'all')
            console.log(`\nLOG [${type}, ${title}, ${correlation.id}]: ${JSON.stringify(data)}\n`);
        if (this.$environment.EAPI_LOGGING === 'info' && ['info', 'warning', 'error'].includes(type)) {
            console.log(`\nLOG [${type}, ${title}, ${correlation.id}]: ${JSON.stringify(data)}\n`);
        }
        if (this.$environment.EAPI_LOGGING === 'warning' && ['warning', 'error'].includes(type))
            console.log(`\nLOG [${type}, ${title}, ${correlation.id}]: ${JSON.stringify(data)}\n`);
        if (this.$environment.EAPI_LOGGING === 'error' && ['error'].includes(type))
            console.log(`\nLOG [${type}, ${title}, ${correlation.id}]: ${JSON.stringify(data)}\n`);
        if (!this.pushToService)
            return;
        if (!this.$environment.EAPI_PUSHFAR_SERVICE_LOGGER_URL)
            return console.log(`\nLOGGER NOTICE: EAPI_PUSHFAR_SERVICE_LOGGER_URL environment variable is not set - Ensure you set the EAPI_PUSHFAR_SERVICE_LOGGER_URL in your .env file!!!`);
        const endpoint = `${this.$environment.EAPI_PUSHFAR_SERVICE_LOGGER_URL}/log`;
        const options = { method: 'post', body: JSON.stringify({ type, title, correlation, data }) };
        return this.fetch(endpoint, options).then(() => { }).catch(() => { }); // do not let logging errors stop flow
    }
}
//# sourceMappingURL=Logger.js.map