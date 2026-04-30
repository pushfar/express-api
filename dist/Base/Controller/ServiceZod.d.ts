import Controller from '../Controller.js';
import Request from '../../System/Request.js';
import { OpenApiSchema } from '../../Library/ZodToOpenApi.js';
import { GlobalsType } from '../../Types/System.js';
import type { ZodServiceSchema } from '../../Types/Zod.js';
export type { ZodServiceSchema };
/**
 * @module express-api/Base/Controller/ServiceZod
 * @class ServiceZod
 * @extends Controller
 * @description Base class for service controllers using Zod schemas for validation and OpenAPI generation. Services are POST-only.
 * @author Paul Smith (ulsmith) <paul.smith@ulsmith.net>
 * @license MIT
 */
export default abstract class ServiceZod<T extends GlobalsType> extends Controller<T> {
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
     * @description Parse and validate the request body against the Zod schema defined in zodSchema.post.body
     * @param request The http request passed in to the system
     * @returns The validated body data
     */
    parseBody(request: Request): any;
    /**
     * @public parseOutput
     * @description Parse and validate response output against the Zod schema defined in zodSchema.post.response
     * @param data The response data to send out in a response
     * @param statusCode The HTTP status code to select the response schema (defaults to 200)
     * @returns The validated output data
     */
    parseOutput(data: any, statusCode?: number): any;
}
//# sourceMappingURL=ServiceZod.d.ts.map