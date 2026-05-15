import Controller from '../Controller.js';
import RestError from '../../Error/Rest.js';
import { zodToOpenApiSchema } from '../../Library/ZodToOpenApi.js';
/**
 * @module express-api/Base/Controller/ApiZod
 * @class ApiZod
 * @extends Controller
 * @description Base class for API controllers using Zod schemas for validation and OpenAPI generation.
 *
 * To get fully inferred types from parse methods, pass the concrete schema type as the second generic:
 *
 *   const schema = { post: { description: '...', body: z.object({ name: z.string() }) } } satisfies ZodSchema;
 *   class MyController extends ApiZod<Globals, typeof schema> { static get zodSchema() { return schema; } }
 *
 * Then `this.parseBody(request, 'post')` returns `{ name: string }` instead of `any`.
 * When the method is omitted and auto-detected from the call stack, the return type is `any`.
 *
 * @author Paul Smith (ulsmith) <paul.smith@ulsmith.net>
 * @license MIT
 */
export default class ApiZod extends Controller {
    /**
     * @public @static @get zodSchema
     * @description Zod-based schema definitions for this endpoint. Override in subclass.
     * @returns The Zod schema definition for this endpoint
     */
    static get zodSchema() {
        throw new Error('zodSchema must be overridden in subclass');
    }
    /**
     * @public @method options
     * @description Return metadata documentation on the endpoint as OpenAPI fragment (auto-converted from zodSchema)
     * @returns The documentation for this endpoint
     */
    options() {
        return zodToOpenApiSchema(this.constructor.zodSchema);
    }
    parseBody(request, method) {
        const m = method || this.getCallingMethod();
        const methodSchema = this.__getMethodSchema(m);
        if (!methodSchema.body)
            throw new RestError('Body schema not defined for method ' + m, 400);
        const result = methodSchema.body.safeParse(request.body);
        if (!result.success) {
            throw new RestError(result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; '), 400);
        }
        return result.data;
    }
    parsePathParameters(request, method) {
        const m = method || this.getCallingMethod();
        const methodSchema = this.__getMethodSchema(m);
        if (!methodSchema.params)
            throw new RestError('Path parameters schema not defined for method ' + m, 400);
        const result = methodSchema.params.safeParse(request.parameters.path);
        if (!result.success) {
            throw new RestError(result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; '), 400);
        }
        return result.data;
    }
    parseQueryParameters(request, method) {
        const m = method || this.getCallingMethod();
        const methodSchema = this.__getMethodSchema(m);
        if (!methodSchema.query)
            throw new RestError('Query parameters schema not defined for method ' + m, 400);
        const result = methodSchema.query.safeParse(request.parameters.query);
        if (!result.success) {
            throw new RestError(result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; '), 400);
        }
        return result.data;
    }
    parseOutput(data, method, statusCode = 200) {
        const m = method || this.getCallingMethod();
        const methodSchema = this.__getMethodSchema(m);
        if (!methodSchema.response)
            throw new RestError('Response schema not defined for method ' + m, 400);
        const responseSchema = methodSchema.response[statusCode];
        if (!responseSchema)
            throw new RestError(`Response schema not defined for method ${m} status ${statusCode}`, 400);
        const result = responseSchema.schema.safeParse(data);
        if (!result.success) {
            throw new RestError(result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; '), 400);
        }
        return result.data;
    }
    /**
     * @private __getMethodSchema
     * @description Get the ZodMethodSchema for a given HTTP method from zodSchema()
     * @param method The HTTP method
     * @returns The method schema
     */
    __getMethodSchema(method) {
        const schema = this.constructor.zodSchema[method];
        if (!schema)
            throw new RestError(`Schema not defined for method ${method}`, 400);
        return schema;
    }
    /**
     * @protected getCallingMethod
     * @description Attempts to detect the calling method name from the call stack
     * @returns The detected method name
     */
    getCallingMethod() {
        try {
            const stack = new Error().stack;
            if (!stack)
                throw new Error('not found');
            const stackLines = stack.split('\n');
            for (let i = 2; i < Math.min(stackLines.length, 6); i++) {
                const line = stackLines[i];
                // Use word boundary so e.g. getCallingMethod is not mistaken for "get"
                const methods = ['get', 'post', 'put', 'patch', 'delete'];
                for (const method of methods) {
                    if (new RegExp(`\\.${method}\\b`).test(line))
                        return method;
                }
            }
        }
        catch { }
        throw new Error('Could not determine HTTP method. Please provide method parameter or ensure parseOutput is called from a method named get, post, put, patch, or delete.');
    }
}
//# sourceMappingURL=ApiZod.js.map