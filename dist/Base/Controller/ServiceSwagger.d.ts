import { SwaggerSchemaMethodType } from '../../Types/Swagger.js';
import Controller from '../Controller.js';
import Request from '../../System/Request.js';
import { GlobalsType } from '../../Types/System.js';
declare enum SchemaMethods {
    post = "post"
}
export type Schema = {
    [key in SchemaMethods]: SwaggerSchemaMethodType;
};
/**
 * @module express-api/Base/Controller/ServiceSwagger
 * @class ServiceSwagger
 * @extends Controller
 * @description Base class for service controllers using raw OpenAPI/Swagger schema definitions
 * @author Paul Smith (ulsmith) <paul.smith@ulsmith.net>
 * @license MIT
 */
export default abstract class ServiceSwagger<T extends GlobalsType> extends Controller<T> {
    /**
     * @public @method options
     * @description Return metadata documentation on the endpoint
     * @returns {Object} The documentation for this endpoint
     */
    abstract options(): Schema;
    /**
     * @public parseBody
     * @description Parse the body of a request, based on the schemaMethod passed in
     * @param request The http request passed in to the system
     * @returns the resulting body data
     */
    parseBody<T = any>(request: Request): T;
    /**
     * @public parseOutput
     * @description Parse the response output, based on the schemaMethod passed in to remove data, require it and type check etc
     * @param data The response data to send out in a response
     * @param statusCode The HTTP status code to use for selecting the response schema (defaults to 200)
     * @returns the resulting body data
     */
    parseOutput<T = any>(data: any, statusCode?: number): T;
}
export {};
//# sourceMappingURL=ServiceSwagger.d.ts.map