import Controller from '../Controller.js';
import Request from '../../System/Request.js';
import { OpenApiSchema } from '../../Library/ZodToOpenApi.js';
import { GlobalsType } from '../../Types/System.js';
import type { ZodServiceSchema } from '../../Types/Zod.js';
export type { ZodServiceSchema };
type ZodOut<T> = T extends {
    _output: infer O;
} ? O : any;
type ParsedBody<TSchema extends ZodServiceSchema> = undefined extends TSchema['post']['body'] ? any : ZodOut<TSchema['post']['body']>;
type ParsedResponse<TSchema extends ZodServiceSchema, StatusCode extends number = 200> = StatusCode extends keyof NonNullable<TSchema['post']['response']> ? NonNullable<TSchema['post']['response']>[StatusCode] extends {
    schema: infer S;
} ? ZodOut<S> : any : any;
/**
 * @module express-api/Base/Controller/ServiceZod
 * @class ServiceZod
 * @extends Controller
 * @description Base class for service controllers using Zod schemas for validation and OpenAPI generation. Services are POST-only.
 *
 * To get fully inferred types from parseBody and parseOutput, pass the concrete schema type as the second generic:
 *
 *   const schema = { post: { description: '...', body: z.object({ name: z.string() }) } } satisfies ZodServiceSchema;
 *   class MyService extends ServiceZod<Globals, typeof schema> { static get zodSchema() { return schema; } }
 *
 * @author Paul Smith (ulsmith) <paul.smith@ulsmith.net>
 * @license MIT
 */
export default abstract class ServiceZod<T extends GlobalsType, TSchema extends ZodServiceSchema = ZodServiceSchema> extends Controller<T> {
    /**
     * @public @static @get zodSchema
     * @description Zod-based schema definitions for this service endpoint (post only). Override in subclass.
     * @returns The Zod schema definition for this endpoint
     */
    static get zodSchema(): ZodServiceSchema;
    /**
     * @public @method options
     * @description Return metadata documentation on the endpoint as OpenAPI fragment (auto-converted from zodSchema)
     * @returns The documentation for this endpoint
     */
    options(): OpenApiSchema;
    /**
     * @public parseBody
     * @description Parse and validate the request body against the Zod schema defined in zodSchema.post.body.
     * Returns a fully typed result when TSchema is provided as a class generic (e.g. ServiceZod<G, typeof schema>).
     * @param request The http request passed in to the system
     * @returns The validated body data
     */
    parseBody(request: Request): ParsedBody<TSchema>;
    /**
     * @public parseOutput
     * @description Parse and validate response output against the Zod schema defined in zodSchema.post.response.
     * Returns a fully typed result when TSchema is provided as a class generic and statusCode is a numeric literal.
     * @param data The response data to send out in a response
     * @param statusCode The HTTP status code to select the response schema (defaults to 200)
     * @returns The validated output data
     */
    parseOutput<StatusCode extends number = 200>(data: any, statusCode?: StatusCode): ParsedResponse<TSchema, StatusCode>;
}
//# sourceMappingURL=ServiceZod.d.ts.map