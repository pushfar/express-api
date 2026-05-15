import Controller from '../Controller.js';
import Request from '../../System/Request.js';
import { OpenApiSchema } from '../../Library/ZodToOpenApi.js';
import { GlobalsType } from '../../Types/System.js';
import type { ZodSchema, ZodMethodSchema } from '../../Types/Zod.js';
export type { ZodSchema };
type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';
type ZodOut<T> = T extends {
    _output: infer O;
} ? O : any;
type ParsedField<TSchema extends ZodSchema, M extends keyof TSchema, F extends keyof ZodMethodSchema> = undefined extends TSchema[M][F] ? any : ZodOut<TSchema[M][F]>;
type ParsedOutput<TSchema extends ZodSchema, M extends keyof TSchema, StatusCode extends number = 200> = StatusCode extends keyof NonNullable<TSchema[M]['response']> ? NonNullable<TSchema[M]['response']>[StatusCode] extends {
    schema: infer S;
} ? ZodOut<S> : any : any;
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
export default abstract class ApiZod<T extends GlobalsType, TSchema extends ZodSchema = ZodSchema> extends Controller<T> {
    /**
     * @public @static @get zodSchema
     * @description Zod-based schema definitions for this endpoint. Override in subclass.
     * @returns The Zod schema definition for this endpoint
     */
    static get zodSchema(): ZodSchema;
    /**
     * @public @method options
     * @description Return metadata documentation on the endpoint as OpenAPI fragment (auto-converted from zodSchema)
     * @returns The documentation for this endpoint
     */
    options(): OpenApiSchema;
    /**
     * @public parseBody
     * @description Parse and validate the request body against the Zod schema defined in zodSchema().
     * Passing method as a string literal (e.g. 'post') returns a fully typed result when TSchema is provided.
     * Omitting method triggers auto-detection from the call stack and returns any.
     * @param request The http request passed in to the system
     * @param method The optional method to use if auto detection fails
     * @returns The validated body data
     */
    parseBody<M extends keyof TSchema & HttpMethod>(request: Request, method: M): ParsedField<TSchema, M, 'body'>;
    parseBody(request: Request, method?: HttpMethod): any;
    /**
     * @public parsePathParameters
     * @description Parse and validate the path parameters against the Zod schema defined in zodSchema().
     * Passing method as a string literal (e.g. 'get') returns a fully typed result when TSchema is provided.
     * Omitting method triggers auto-detection from the call stack and returns any.
     * @param request The http request passed in to the system
     * @param method The optional method to use if auto detection fails
     * @returns The validated path parameter data
     */
    parsePathParameters<M extends keyof TSchema & HttpMethod>(request: Request, method: M): ParsedField<TSchema, M, 'params'>;
    parsePathParameters(request: Request, method?: HttpMethod): any;
    /**
     * @public parseQueryParameters
     * @description Parse and validate the query parameters against the Zod schema defined in zodSchema().
     * Passing method as a string literal (e.g. 'get') returns a fully typed result when TSchema is provided.
     * Omitting method triggers auto-detection from the call stack and returns any.
     * @param request The http request passed in to the system
     * @param method The optional method to use if auto detection fails
     * @returns The validated query parameter data
     */
    parseQueryParameters<M extends keyof TSchema & HttpMethod>(request: Request, method: M): ParsedField<TSchema, M, 'query'>;
    parseQueryParameters(request: Request, method?: HttpMethod): any;
    /**
     * @public parseOutput
     * @description Parse and validate response output against the Zod schema defined in zodSchema().
     * Passing method as a string literal and statusCode as a numeric literal returns a fully typed result when TSchema is provided.
     * Omitting method triggers auto-detection from the call stack and returns any.
     * @param data The response data to send out in a response
     * @param method The optional method to use if auto detection fails
     * @param statusCode The HTTP status code to select the response schema (defaults to 200)
     * @returns The validated output data
     */
    parseOutput<M extends keyof TSchema & HttpMethod, StatusCode extends number = 200>(data: any, method: M, statusCode?: StatusCode): ParsedOutput<TSchema, M, StatusCode>;
    parseOutput(data: any, method?: HttpMethod, statusCode?: number): any;
    /**
     * @private __getMethodSchema
     * @description Get the ZodMethodSchema for a given HTTP method from zodSchema()
     * @param method The HTTP method
     * @returns The method schema
     */
    private __getMethodSchema;
    /**
     * @protected getCallingMethod
     * @description Attempts to detect the calling method name from the call stack
     * @returns The detected method name
     */
    protected getCallingMethod(): HttpMethod;
}
//# sourceMappingURL=ApiZod.d.ts.map